<?php

namespace App\Observers;

use App\Models\PlayroomGame;

class PlayroomGameObserver
{
    /**
     * Deleting the image also removes the underlying file through the ImageObserver.
     */
    public function deleting(PlayroomGame $game): void
    {
        $game->image?->delete();
    }
}
