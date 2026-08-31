<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class SteamService
{
    private const DAY_IN_SECONDS = 86400;

    private const HOUR_IN_SECONDS = 3600;

    /**
     * Delay between store/stats calls so Steam does not rate limit us.
     */
    private const REQUEST_DELAY_IN_MICROSECONDS = 100_000;

    private string $userId;

    private string $apiKey;

    private string $apiUrl;

    private string $storeUrl;

    public function __construct()
    {
        $this->userId = (string) config('services.steam.user-id');
        $this->apiKey = (string) config('services.steam.api-key');
        $this->apiUrl = (string) config('services.steam.api-url');
        $this->storeUrl = (string) config('services.steam.store-url');
    }

    /**
     * @return array{summary: array<string, mixed>, recently_games: list<array<string, mixed>>, owned_games: list<array<string, mixed>>}
     */
    public function getStats(): array
    {
        $recentlyPlayedGames = $this->getRecentlyPlayedGames();

        return [
            'summary' => [
                ...$this->getSummary(),
                'achievements' => array_sum(Arr::pluck($recentlyPlayedGames, 'achievements.current')),
            ],
            'recently_games' => $recentlyPlayedGames,
            'owned_games' => $this->getOwnedGames(),
        ];
    }

    /**
     * @return array{nick: string, avatar: string, url: string, achievements: int}
     */
    private function getSummary(): array
    {
        return Cache::tags('steam')->remember('steam-summary-'.$this->userId, self::DAY_IN_SECONDS, function (): array {
            $summary = $this->createUserClient()->get('/ISteamUser/GetPlayerSummaries/v0002', [
                'steamids' => $this->userId,
                'key' => $this->apiKey,
            ])->json('response.players.0') ?? [];

            return [
                'nick' => Arr::get($summary, 'personaname', ''),
                'avatar' => Arr::get($summary, 'avatar', ''),
                'url' => Arr::get($summary, 'profileurl', ''),
                'achievements' => 0,
            ];
        });
    }

    /**
     * Raw Steam payload for every owned game, sorted by the most recently played first.
     *
     * @return list<array<string, mixed>>
     */
    private function getOwnedGamesPayload(): array
    {
        // See the note on the recently played cache about the version suffix.
        return Cache::tags('steam')->remember('steam-owned-games-v2-'.$this->userId, self::HOUR_IN_SECONDS, function (): array {
            $owned = $this->createUserClient()->get('/IPlayerService/GetOwnedGames/v0001/', [
                'steamid' => $this->userId,
                'key' => $this->apiKey,
                'format' => 'json',
                'include_appinfo' => true,
            ])->json('response.games') ?? [];

            return collect($owned)->sortByDesc('rtime_last_played')->values()->all();
        });
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function getOwnedGames(): array
    {
        return collect($this->getOwnedGamesPayload())
            ->map(function (array $game): array {
                $appId = $game['appid'];

                return [
                    'name' => $game['name'],
                    'steam_url' => $this->storeUrl.'/app/'.$appId,
                    'icon_url' => 'https://media.steampowered.com/steamcommunity/public/images/apps/'.$appId.'/'.Arr::get($game, 'img_icon_url', '').'.jpg',
                    'default_icon_url' => 'https://placehold.co/32x32?text='.Str::initials($game['name']),
                    'time' => [
                        '2weeks' => Arr::get($game, 'playtime_2weeks', 0),
                        'total' => Arr::get($game, 'playtime_forever', 0),
                    ],
                ];
            })
            ->all();
    }

    /**
     * Last played timestamp per app id, derived from the owned games payload.
     *
     * @return array<int, int>
     */
    private function getLastPlayedTimestamps(): array
    {
        return collect($this->getOwnedGamesPayload())
            ->mapWithKeys(fn (array $game): array => [$game['appid'] => Arr::get($game, 'rtime_last_played', 0)])
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function getRecentlyPlayedGames(): array
    {
        // The suffix is bumped whenever the cached shape changes, so a deploy cannot pick up
        // entries written by the previous release.
        $games = Cache::tags('steam')->remember('steam-recently-played-v2-'.$this->userId, self::HOUR_IN_SECONDS, function (): array {
            return $this->createUserClient()->get('/IPlayerService/GetRecentlyPlayedGames/v0001', [
                'steamid' => $this->userId,
                'key' => $this->apiKey,
                'format' => 'json',
            ])->json('response.games') ?? [];
        });

        if ($games === []) {
            return [];
        }

        $appIds = Arr::pluck($games, 'appid');
        $lastPlayedTimestamps = $this->getLastPlayedTimestamps();
        $playerStatsBatch = $this->fetchPlayerStatsBatch($appIds);
        $gameDataBatch = $this->fetchGameDataBatch($appIds);

        $recentlyPlayedGames = [];

        foreach ($games as $game) {
            $appId = $game['appid'];
            $playerStats = $playerStatsBatch[$appId] ?? ['achievements' => []];
            $gameData = $gameDataBatch[$appId] ?? [];

            $recentlyPlayedGames[] = [
                'name' => $game['name'],
                'time' => [
                    '2weeks' => Arr::get($game, 'playtime_2weeks', 0),
                    'total' => Arr::get($game, 'playtime_forever', 0),
                ],
                'achievements' => [
                    'current' => count(Arr::get($playerStats, 'achievements', [])),
                    'total' => Arr::get($gameData, 'achievements.total', 0),
                ],
                'style' => [
                    'image' => Arr::get($gameData, 'header_image'),
                    'capsule_image' => Arr::get($gameData, 'capsule_image'),
                    'capsule_imagev5' => Arr::get($gameData, 'capsule_imagev5'),
                    'background' => Arr::get($gameData, 'background'),
                    'background_raw' => Arr::get($gameData, 'background_raw'),
                ],
                'website' => Arr::get($gameData, 'website'),
                'steam_url' => $this->storeUrl.'/app/'.$appId,
                'last_played' => $lastPlayedTimestamps[$appId] ?? 0,
            ];
        }

        return array_values(Arr::sortDesc($recentlyPlayedGames, 'last_played'));
    }

    /**
     * @param  list<int>  $appIds
     * @return array<int, array<string, mixed>>
     */
    private function fetchGameDataBatch(array $appIds): array
    {
        return $this->fetchCachedPerApp(
            $appIds,
            'steam-game-',
            self::DAY_IN_SECONDS,
            fn (int $appId): array => $this->createStoreClient()
                ->get('/api/appdetails', ['appids' => $appId])
                ->json($appId.'.data', []),
            fallback: [],
        );
    }

    /**
     * @param  list<int>  $appIds
     * @return array<int, array<string, mixed>>
     */
    private function fetchPlayerStatsBatch(array $appIds): array
    {
        return $this->fetchCachedPerApp(
            $appIds,
            'steam-player-stats-',
            self::HOUR_IN_SECONDS,
            fn (int $appId): array => $this->createUserClient()
                ->get('/ISteamUserStats/GetUserStatsForGame/v0002/', [
                    'steamid' => $this->userId,
                    'key' => $this->apiKey,
                    'appid' => $appId,
                ])
                ->throw()
                ->json('playerstats', []),
            fallback: ['achievements' => []],
        );
    }

    /**
     * Resolve one cached value per app id, fetching the misses sequentially to stay
     * under Steam's rate limits. Failures fall back instead of breaking the page.
     *
     * @param  list<int>  $appIds
     * @param  callable(int): array<string, mixed>  $fetch
     * @param  array<string, mixed>  $fallback
     * @return array<int, array<string, mixed>>
     */
    private function fetchCachedPerApp(array $appIds, string $cacheKeyPrefix, int $ttl, callable $fetch, array $fallback): array
    {
        $result = [];
        $uncachedAppIds = [];

        foreach (array_unique($appIds) as $appId) {
            $cached = Cache::tags('steam')->get($cacheKeyPrefix.$appId);

            if ($cached === null) {
                $uncachedAppIds[] = $appId;

                continue;
            }

            $result[$appId] = $cached;
        }

        foreach ($uncachedAppIds as $index => $appId) {
            try {
                $value = $fetch($appId);
                Cache::tags('steam')->put($cacheKeyPrefix.$appId, $value, $ttl);
                $result[$appId] = $value;
            } catch (Throwable) {
                $result[$appId] = $fallback;
            }

            if ($index < count($uncachedAppIds) - 1) {
                usleep(self::REQUEST_DELAY_IN_MICROSECONDS);
            }
        }

        return $result;
    }

    private function createUserClient(): PendingRequest
    {
        return Http::baseUrl($this->apiUrl)
            ->timeout(10)
            ->retry(3, 100);
    }

    private function createStoreClient(): PendingRequest
    {
        return Http::baseUrl($this->storeUrl)
            ->timeout(10)
            ->retry(3, 100);
    }
}
