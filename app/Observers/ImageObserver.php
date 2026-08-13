<?php

namespace App\Observers;

use App\Models\Image;
use League\Flysystem\FilesystemException;
use Storage;

class ImageObserver
{
    /**
     * @throws FilesystemException
     */
    public function deleted(Image $image): void
    {
        if (Storage::has($image->path)) {
            Storage::delete($image->path);
        }
    }
}
