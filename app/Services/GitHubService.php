<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GitHubService
{
    private const DAY_IN_SECONDS = 86400;

    private const REPOSITORIES_PER_PAGE = 6;

    private ?string $token;

    public function __construct()
    {
        $this->token = config('services.github.token');
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function getRepositories(int $page = 1, bool $preview = false): array
    {
        if ($preview) {
            Cache::tags('github')->flush();
        }

        return Cache::tags('github')->remember('github-page-'.$page, self::DAY_IN_SECONDS, function () use ($page): array {
            $response = Http::withHeaders([
                'Accept' => 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version' => '2022-11-28',
            ])
                ->withToken($this->token ?? '')
                ->timeout(10)
                ->retry(3, 100, throw: false)
                ->get('https://api.github.com/user/repos', [
                    'page' => $page,
                    'visibility' => 'public',
                    'sort' => 'updated',
                    'direction' => 'desc',
                    'per_page' => self::REPOSITORIES_PER_PAGE,
                ]);

            if ($response->failed()) {
                return [];
            }

            return collect($response->json())
                ->filter(fn ($repository): bool => is_array($repository) && isset($repository['name']))
                ->map(fn (array $repository): array => [
                    'name' => $repository['name'],
                    'description' => $repository['description'] ?? null,
                    'html_url' => $repository['html_url'],
                    'updated_at' => $repository['updated_at'],
                    'stargazers_count' => $repository['stargazers_count'],
                    'open_issues_count' => $repository['open_issues_count'],
                    'homepage' => filled($repository['homepage'] ?? null) ? $this->formatUrl($repository['homepage']) : null,
                    'size' => $repository['size'],
                    'forks_count' => $repository['forks_count'],
                    'language' => $repository['language'] ?? null,
                    'license' => $repository['license'] ?? null,
                    'owner' => [
                        'login' => $repository['owner']['login'],
                        'avatar_url' => $repository['owner']['avatar_url'],
                    ],
                ])
                ->values()
                ->all();
        });
    }

    private function formatUrl(string $url): string
    {
        return Str::startsWith($url, ['http://', 'https://']) ? $url : 'https://'.$url;
    }
}
