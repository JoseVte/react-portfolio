<?php

namespace App\Observers;

use App\Models\PlayroomGame;
use League\Flysystem\FilesystemException;
use Storage;

class PlayroomGameObserver
{
    /**
     * @throws FilesystemException
     */
    public function deleting(PlayroomGame $game): void
    {
        $image = $game->image;

        if (Storage::has($image->path)) {
            Storage::delete($image->path);
        }

        $image->delete();
    }
}
