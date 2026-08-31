<?php

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
*/

use App\Enums\ImageCategory;
use App\Models\Image;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
*/

/**
 * Allow the current request to pass the ALLOWED_IPS guard.
 */
function allowLocalIp(): void
{
    config(['app.allowed-ips' => '127.0.0.1']);
}

/**
 * Swap the default disk for an in-memory fake and return it.
 */
function fakeDisk(): Filesystem
{
    return Storage::fake(config('filesystems.default'));
}

/**
 * An image record whose file actually exists on the faked disk.
 */
function imageWithFile(ImageCategory $category = ImageCategory::CAT, string $contents = 'fake image contents'): Image
{
    $image = Image::factory()->create(['category' => $category]);

    Storage::put($image->path, $contents);

    return $image;
}

function fakeUpload(string $name = 'photo.png'): UploadedFile
{
    return UploadedFile::fake()->image($name, 10, 10);
}
