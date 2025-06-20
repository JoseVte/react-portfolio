<?php

use Illuminate\Http\Request;

Route::get('github', function (Request $request) {
    if ($request->boolean('preview')) {
        cache()->tags('github')->clear();
    }

    $page = $request->integer('page', 1);

    $createUrl = static fn ($url) => Str::startsWith($url, 'http') ? $url : 'https://'.$url;

    $response = cache()->tags('github')->remember('github-page-'.$page, 60 * 60 * 24, function () use ($createUrl, $page) {
        $response = Http::withHeaders([
            'Accept' => 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version' => '2022-11-28',
        ])->withToken(config('services.github.token'))
            ->get('https://api.github.com/user/repos', [
                'page' => $page,
                'visibility' => 'public',
                'sort' => 'updated',
                'direction' => 'desc',
                'per_page' => 6,
            ]);

        $repositories = collect($response->json());

        return $repositories->map(fn ($repository) => [
            'name' => $repository['name'],
            'description' => $repository['description'],
            'html_url' => $repository['html_url'],
            'updated_at' => $repository['updated_at'],
            'stargazers_count' => $repository['stargazers_count'],
            'open_issues_count' => $repository['open_issues_count'],
            'homepage' => $repository['homepage'] ? $createUrl($repository['homepage']) : null,
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

    return response()->json($response);
})->name('github');
