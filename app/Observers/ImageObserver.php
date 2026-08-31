<?php

namespace App\Observers;

use App\Models\Image;
use Illuminate\Support\Facades\Storage;

class ImageObserver
{
    public function deleted(Image $image): void
    {
        if (Storage::exists($image->path)) {
            Storage::delete($image->path);
        }
    }
}
