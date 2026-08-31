<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config(['services.github.token' => 'test-token']);
    Cache::tags('github')->flush();
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function githubRepository(array $overrides = []): array
{
    return [
        'name' => 'portfolio',
        'description' => 'My portfolio',
        'html_url' => 'https://github.com/josevte/portfolio',
        'updated_at' => '2026-01-01T00:00:00Z',
        'stargazers_count' => 5,
        'open_issues_count' => 1,
        'homepage' => 'josrom.io',
        'size' => 1234,
        'forks_count' => 2,
        'language' => 'PHP',
        'license' => null,
        'owner' => ['login' => 'josevte', 'avatar_url' => 'https://example.test/avatar.png'],
        ...$overrides,
    ];
}

it('returns the mapped repositories', function () {
    Http::fake(['api.github.com/*' => Http::response([githubRepository()])]);

    $response = $this->getJson(route('github'));

    $response->assertOk()
        ->assertJsonCount(1)
        ->assertJsonPath('0.name', 'portfolio')
        ->assertJsonPath('0.stargazers_count', 5)
        ->assertJsonPath('0.owner.login', 'josevte');
});

it('normalises a homepage that is missing its scheme', function () {
    Http::fake(['api.github.com/*' => Http::response([githubRepository(['homepage' => 'josrom.io'])])]);

    $this->getJson(route('github'))->assertJsonPath('0.homepage', 'https://josrom.io');
});

it('leaves a homepage that already has a scheme alone', function () {
    Http::fake(['api.github.com/*' => Http::response([githubRepository(['homepage' => 'http://josrom.io'])])]);

    $this->getJson(route('github'))->assertJsonPath('0.homepage', 'http://josrom.io');
});

it('treats an empty homepage as none', function () {
    Http::fake(['api.github.com/*' => Http::response([githubRepository(['homepage' => ''])])]);

    $this->getJson(route('github'))->assertJsonPath('0.homepage', null);
});

it('returns an empty list instead of failing when github errors', function () {
    Http::fake(['api.github.com/*' => Http::response(['message' => 'Bad credentials'], 401)]);

    $this->getJson(route('github'))->assertOk()->assertExactJson([]);
});

it('skips entries that are not repositories', function () {
    Http::fake(['api.github.com/*' => Http::response(['message' => 'Not Found'])]);

    $this->getJson(route('github'))->assertOk()->assertExactJson([]);
});

it('requests the page that was asked for', function () {
    Http::fake(['api.github.com/*' => Http::response([githubRepository()])]);

    $this->getJson(route('github', ['page' => 3]))->assertOk();

    Http::assertSent(fn ($request) => $request['page'] === 3);
});

it('caches each page separately', function () {
    Http::fake(['api.github.com/*' => Http::response([githubRepository()])]);

    $this->getJson(route('github'))->assertOk();
    $this->getJson(route('github'))->assertOk();

    Http::assertSentCount(1);

    $this->getJson(route('github', ['page' => 2]))->assertOk();

    Http::assertSentCount(2);
});

it('busts the cache when preview is requested', function () {
    Http::fake(['api.github.com/*' => Http::response([githubRepository()])]);

    $this->getJson(route('github'))->assertOk();
    $this->getJson(route('github', ['preview' => 1]))->assertOk();

    Http::assertSentCount(2);
});
