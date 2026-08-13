<?php

namespace App\Http\Controllers;

use App\Models\PlayroomGame;

class PlayroomController
{
    public function __invoke()
    {
        return response()->json(PlayroomGame::ordered()->get());
    }
}
