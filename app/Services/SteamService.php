<?php

namespace App\Services;

use Exception;
use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Str;

class SteamService
{
    private string $userId;

    private string $apiKey;

    private string $apiUrl;

    private string $storeUrl;

    public function __construct()
    {
        $this->userId = config('services.steam.user-id');
        $this->apiKey = config('services.steam.api-key');
        $this->apiUrl = config('services.steam.api-url');
        $this->storeUrl = config('services.steam.store-url');
    }

    public function getStats(): array
    {
        return [
            'summary' => $this->getSummary(),
            'recently_games' => $this->getRecentlyPlayedGames(),
            'owned_games' => $this->getOwnedGames()['owned'],
        ];
    }

    private function getSummary(): array
    {
        return Cache::tags('steam')->remember('steam-summary-'.$this->userId, 60 * 60 * 24, function () {
            $clientUser = $this->createUserClient();
            $summary = $clientUser->get('/ISteamUser/GetPlayerSummaries/v0002', [
                'steamids' => $this->userId,
                'key' => $this->apiKey,
            ])->json('response.players.0');

            return [
                'nick' => $summary['personaname'],
                'avatar' => $summary['avatar'],
                'url' => $summary['profileurl'],
                'achievements' => 0,
            ];
        });
    }

    private function getOwnedGamesTiming(): array
    {
        return Cache::tags('steam')->remember('steam-owned-games-timing-'.$this->userId, 60 * 60, function () {
            $clientUser = $this->createUserClient();

            $owned = $clientUser->get('/IPlayerService/GetOwnedGames/v0001/', [
                'steamid' => $this->userId,
                'key' => $this->apiKey,
                'format' => 'json',
                'include_appinfo' => false,
            ])->json('response');

            $timing = [];
            foreach ($owned['games'] ?? [] as $game) {
                $timing[$game['appid']] = $game['rtime_last_played'];
            }

            return $timing;
        });
    }

    private function getOwnedGames(): array
    {
        return Cache::tags('steam')->remember('steam-owned-games-'.$this->userId, 60 * 60, function () {
            $clientUser = $this->createUserClient();

            $owned = $clientUser->get('/IPlayerService/GetOwnedGames/v0001/', [
                'steamid' => $this->userId,
                'key' => $this->apiKey,
                'format' => 'json',
                'include_appinfo' => true,
            ])->json('response');

            $games = collect($owned['games'])->sortByDesc('rtime_last_played');

            $ownedArray = $games->map(function ($game) {
                $appId = $game['appid'];

                return [
                    'name' => $game['name'],
                    'steam_url' => $this->storeUrl.'/app/'.$appId,
                    'icon_url' => 'https://media.steampowered.com/steamcommunity/public/images/apps/'.$appId.'/'.$game['img_icon_url'].'.jpg',
                    'default_icon_url' => 'https://placehold.co/32x32?text='.Str::initials($game['name']),
                    'time' => [
                        '2weeks' => $game['playtime_2weeks'] ?? 0,
                        'total' => $game['playtime_forever'],
                    ],
                ];
            })->values()->toArray();

            return [
                'owned' => $ownedArray,
            ];
        });
    }

    private function getRecentlyPlayedGames(): array
    {
        $clientUser = $this->createUserClient();

        $recently = Cache::tags('steam')->remember('steam-recently-played-'.$this->userId, 60 * 60, function () use ($clientUser) {
            return $clientUser->get('/IPlayerService/GetRecentlyPlayedGames/v0001', [
                'steamid' => $this->userId,
                'key' => $this->apiKey,
                'format' => 'json',
            ])->json('response');
        });

        $games = $recently['games'] ?? [];
        $appIds = collect($games)->pluck('appid')->all();

        // Fetch timing from owned games for sorting
        $timingData = $this->getOwnedGamesTiming();

        // Fetch player stats and game data in parallel
        $playerStatsBatch = $this->fetchPlayerStatsBatch($appIds);
        $gameDataBatch = $this->fetchGameDataBatch($appIds);

        $summary = $this->getSummary();
        $recentlyGames = [];

        foreach ($games as $recentlyGame) {
            $appId = $recentlyGame['appid'];
            $playerStats = $playerStatsBatch[$appId] ?? ['achievements' => []];
            $gameData = $gameDataBatch[$appId] ?? [];
            $lastPlayed = $timingData[$appId] ?? 0;

            $summary['achievements'] += count($playerStats['achievements'] ?? []);
            $recentlyGames[] = [
                'name' => $recentlyGame['name'],
                'time' => [
                    '2weeks' => $recentlyGame['playtime_2weeks'],
                    'total' => $recentlyGame['playtime_forever'],
                ],
                'achievements' => [
                    'current' => count($playerStats['achievements'] ?? []),
                    'total' => Arr::get($gameData, 'achievements.total', 0),
                ],
                'style' => [
                    'image' => $gameData['header_image'] ?? null,
                    'capsule_image' => $gameData['capsule_image'] ?? null,
                    'capsule_imagev5' => $gameData['capsule_imagev5'] ?? null,
                    'background' => $gameData['background'] ?? null,
                    'background_raw' => $gameData['background_raw'] ?? null,
                ],
                'website' => $gameData['website'] ?? null,
                'steam_url' => $this->storeUrl.'/app/'.$appId,
                'last_played' => $lastPlayed,
            ];
        }

        return array_values(Arr::sortDesc($recentlyGames, 'last_played'));
    }

    private function fetchGameDataBatch(array $appIds): array
    {
        if (empty($appIds)) {
            return [];
        }

        $clientStore = $this->createStoreClient();
        $result = [];

        // Collect uncached IDs
        $uncachedIds = [];
        foreach ($appIds as $appId) {
            $cacheKey = 'steam-game-'.$appId;
            if (Cache::tags('steam')->has($cacheKey)) {
                $result[$appId] = Cache::tags('steam')->get($cacheKey);
            } else {
                $uncachedIds[] = $appId;
            }
        }

        if (empty($uncachedIds)) {
            return $result;
        }

        // Process sequentially with delays to avoid rate limiting
        foreach ($uncachedIds as $appId) {
            try {
                $response = $clientStore->get('/api/appdetails', [
                    'appids' => $appId,
                ]);
                $gameData = $response->json($appId.'.data', []);
                Cache::tags('steam')->put('steam-game-'.$appId, $gameData, 60 * 60 * 24);
                $result[$appId] = $gameData;
            } catch (Exception $e) {
                $result[$appId] = [];
            }

            // Small delay between requests to avoid rate limiting
            usleep(100000); // 100ms delay
        }

        return $result;
    }

    private function fetchPlayerStatsBatch(array $appIds): array
    {
        if (empty($appIds)) {
            return [];
        }

        $clientUser = $this->createUserClient();
        $result = [];

        // Collect uncached IDs
        $uncachedIds = [];
        foreach ($appIds as $appId) {
            $cacheKey = 'steam-player-stats-'.$appId;
            if (Cache::tags('steam')->has($cacheKey)) {
                $result[$appId] = Cache::tags('steam')->get($cacheKey);
            } else {
                $uncachedIds[] = $appId;
            }
        }

        if (empty($uncachedIds)) {
            return $result;
        }

        // Process sequentially with delays to avoid rate limiting
        foreach ($uncachedIds as $appId) {
            try {
                $response = $clientUser->get('/ISteamUserStats/GetUserStatsForGame/v0002/', [
                    'steamid' => $this->userId,
                    'key' => $this->apiKey,
                    'appid' => $appId,
                ]);
                $playerStats = $response->throw()->json('playerstats', []);
                Cache::tags('steam')->put('steam-player-stats-'.$appId, $playerStats, 60 * 60);
                $result[$appId] = $playerStats;
            } catch (Exception $e) {
                $result[$appId] = ['achievements' => []];
            }

            // Small delay between requests to avoid rate limiting
            usleep(100000); // 100ms delay
        }

        return $result;
    }

    private function createUserClient(): PendingRequest|Factory
    {
        return Http::baseUrl($this->apiUrl)
            ->timeout(10)
            ->retry(5);
    }

    private function createStoreClient(): PendingRequest|Factory
    {
        return Http::baseUrl($this->storeUrl)
            ->timeout(10)
            ->retry(5);
    }
}
