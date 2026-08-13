<?php

namespace App\Http\Controllers;

use App\Services\SteamService;
use Illuminate\Http\JsonResponse;

class SteamController extends Controller
{
    public function __invoke(SteamService $steamService): JsonResponse
    {
        return response()->json($steamService->getStats());
    }
}
