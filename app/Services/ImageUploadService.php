<?php

namespace App\Services;

use App\Enums\ImageCategory;
use App\Models\Image;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadService
{
    /**
     * Persist the uploaded file on the configured disk and record it as an image.
     */
    public function store(UploadedFile $file, ImageCategory $category): Image
    {
        $path = $this->buildPath($file, $category);

        Storage::put($path, $file->getContent());

        return Image::create([
            'category' => $category,
            'name' => basename($path),
            'original_name' => $file->getClientOriginalName(),
            'mimetype' => $file->getMimeType(),
            'path' => $path,
        ]);
    }

    /**
     * A collision free path, so concurrent uploads can never overwrite each other.
     */
    private function buildPath(UploadedFile $file, ImageCategory $category): string
    {
        $extension = $file->clientExtension() ?: 'bin';

        return $category->value.'/'.Str::uuid()->toString().'.'.$extension;
    }
}
