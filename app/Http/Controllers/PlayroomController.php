<?php

namespace App\Http\Controllers;

use App\Models\PlayroomGame;
use Illuminate\Http\JsonResponse;

class PlayroomController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json(PlayroomGame::ordered()->get());
    }
}
