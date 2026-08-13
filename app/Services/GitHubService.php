<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GitHubService
{
    private string $token;

    public function __construct()
    {
        $this->token = config('services.github.token');
    }

    public function getRepositories(int $page = 1, bool $preview = false): array
    {
        if ($preview) {
            Cache::tags('github')->clear();
        }

        return Cache::tags('github')->remember('github-page-'.$page, 60 * 60 * 24, function () use ($page) {
            $response = Http::withHeaders([
                'Accept' => 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version' => '2022-11-28',
            ])->withToken($this->token)
                ->get('https://api.github.com/user/repos', [
                    'page' => $page,
                    'visibility' => 'public',
                    'sort' => 'updated',
                    'direction' => 'desc',
                    'per_page' => 6,
                ]);

            return collect($response->json())->map(fn ($repository) => [
                'name' => $repository['name'],
                'description' => $repository['description'],
                'html_url' => $repository['html_url'],
                'updated_at' => $repository['updated_at'],
                'stargazers_count' => $repository['stargazers_count'],
                'open_issues_count' => $repository['open_issues_count'],
                'homepage' => $repository['homepage'] ? $this->formatUrl($repository['homepage']) : null,
                'size' => $repository['size'],
                'forks_count' => $repository['forks_count'],
                'language' => $repository['language'],
                'license' => $repository['license'] ?? null,
                'owner' => [
                    'login' => $repository['owner']['login'],
                    'avatar_url' => $repository['owner']['avatar_url'],
                ],
            ])->toArray();
        });
    }

    private function formatUrl(string $url): string
    {
        return Str::startsWith($url, 'http') ? $url : 'https://'.$url;
    }
}
