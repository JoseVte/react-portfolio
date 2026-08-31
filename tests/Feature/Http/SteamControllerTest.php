<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config([
        'services.steam.api-url' => 'https://api.steampowered.test',
        'services.steam.store-url' => 'https://store.steampowered.test',
        'services.steam.user-id' => '76561190000000000',
        'services.steam.api-key' => 'test-key',
    ]);

    Cache::tags('steam')->flush();
});

/**
 * @param  array<string, mixed>  $overrides
 */
function fakeSteam(array $overrides = []): void
{
    Http::fake([
        'api.steampowered.test/ISteamUser/GetPlayerSummaries*' => Http::response([
            'response' => ['players' => [['personaname' => 'josrom', 'avatar' => 'https://example.test/a.jpg', 'profileurl' => 'https://steamcommunity.test/id/josrom']]],
        ]),
        'api.steampowered.test/IPlayerService/GetOwnedGames*' => Http::response([
            'response' => [
                'games' => [
                    ['appid' => 1, 'name' => 'Portal', 'img_icon_url' => 'aaa', 'playtime_2weeks' => 120, 'playtime_forever' => 600, 'rtime_last_played' => 100],
                    ['appid' => 2, 'name' => 'Factorio', 'img_icon_url' => 'bbb', 'playtime_forever' => 300, 'rtime_last_played' => 900],
                ],
            ],
        ]),
        'api.steampowered.test/IPlayerService/GetRecentlyPlayedGames*' => Http::response([
            'response' => [
                'games' => [
                    ['appid' => 1, 'name' => 'Portal', 'playtime_2weeks' => 120, 'playtime_forever' => 600],
                    ['appid' => 2, 'name' => 'Factorio', 'playtime_2weeks' => 60, 'playtime_forever' => 300],
                ],
            ],
        ]),
        'api.steampowered.test/ISteamUserStats/GetUserStatsForGame*' => Http::response([
            'playerstats' => ['achievements' => [['name' => 'one'], ['name' => 'two']]],
        ]),
        'store.steampowered.test/api/appdetails*' => Http::response([
            '1' => ['data' => ['header_image' => 'https://example.test/1.jpg', 'capsule_image' => 'https://example.test/1c.jpg', 'website' => 'https://portal.test', 'achievements' => ['total' => 10]]],
            '2' => ['data' => ['header_image' => 'https://example.test/2.jpg', 'capsule_image' => 'https://example.test/2c.jpg', 'achievements' => ['total' => 20]]],
        ]),
        ...$overrides,
    ]);
}

it('returns the summary, recently played and owned games', function () {
    fakeSteam();

    $response = $this->getJson(route('steam'));

    $response->assertOk()
        ->assertJsonPath('summary.nick', 'josrom')
        ->assertJsonCount(2, 'recently_games')
        ->assertJsonCount(2, 'owned_games');
});

it('totals the achievements of the recently played games in the summary', function () {
    fakeSteam();

    // Two recently played games with two unlocked achievements each.
    $this->getJson(route('steam'))->assertJsonPath('summary.achievements', 4);
});

it('sorts the recently played games by when they were last played', function () {
    fakeSteam();

    $response = $this->getJson(route('steam'));

    expect(collect($response->json('recently_games'))->pluck('name')->all())->toBe(['Factorio', 'Portal']);
});

it('builds store urls and playtime for the owned games', function () {
    fakeSteam();

    $this->getJson(route('steam'))
        ->assertJsonPath('owned_games.0.name', 'Factorio')
        ->assertJsonPath('owned_games.0.steam_url', 'https://store.steampowered.test/app/2')
        ->assertJsonPath('owned_games.0.time.2weeks', 0)
        ->assertJsonPath('owned_games.1.time.2weeks', 120);
});

it('reads the owned games only once for both the list and the timings', function () {
    fakeSteam();

    $this->getJson(route('steam'))->assertOk();

    $ownedGamesCalls = collect(Http::recorded())
        ->filter(fn (array $pair): bool => str_contains($pair[0]->url(), 'GetOwnedGames'))
        ->count();

    expect($ownedGamesCalls)->toBe(1);
});

it('falls back to empty achievements when the stats endpoint fails', function () {
    fakeSteam([
        'api.steampowered.test/ISteamUserStats/GetUserStatsForGame*' => Http::response(status: 500),
    ]);

    $this->getJson(route('steam'))
        ->assertOk()
        ->assertJsonPath('summary.achievements', 0)
        ->assertJsonPath('recently_games.0.achievements.current', 0);
});

it('survives an empty profile', function () {
    Http::fake([
        'api.steampowered.test/ISteamUser/GetPlayerSummaries*' => Http::response(['response' => ['players' => []]]),
        'api.steampowered.test/IPlayerService/GetOwnedGames*' => Http::response(['response' => []]),
        'api.steampowered.test/IPlayerService/GetRecentlyPlayedGames*' => Http::response(['response' => []]),
    ]);

    $this->getJson(route('steam'))->assertOk()->assertExactJson([
        'summary' => ['nick' => '', 'avatar' => '', 'url' => '', 'achievements' => 0],
        'recently_games' => [],
        'owned_games' => [],
    ]);
});

it('caches the response so a second request hits no api', function () {
    fakeSteam();

    $this->getJson(route('steam'))->assertOk();
    $sentAfterFirstCall = count(Http::recorded());

    $this->getJson(route('steam'))->assertOk();

    expect(count(Http::recorded()))->toBe($sentAfterFirstCall);
});

it('ignores entries left behind by a previous release', function () {
    fakeSteam();

    // Shape stored before the owned games and recently played caches were reworked.
    Cache::tags('steam')->put('steam-recently-played-'.config('services.steam.user-id'), [
        'total_count' => 1,
        'games' => [['appid' => 99, 'name' => 'Stale']],
    ], 3600);
    Cache::tags('steam')->put('steam-owned-games-'.config('services.steam.user-id'), [
        'owned' => [['name' => 'Stale']],
    ], 3600);

    $response = $this->getJson(route('steam'));

    $response->assertOk();
    expect(collect($response->json('recently_games'))->pluck('name')->all())->not->toContain('Stale')
        ->and(collect($response->json('owned_games'))->pluck('name')->all())->not->toContain('Stale');
});
