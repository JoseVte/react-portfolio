<?php

use App\Enums\ImageCategory;
use App\Models\Image;
use League\Flysystem\Filesystem;
use League\Flysystem\FilesystemException;
use League\Flysystem\Local\LocalFilesystemAdapter;

$filesystem = null;

beforeEach(function () {
    global $filesystem;
    $filesystem = new Filesystem(new LocalFilesystemAdapter(
        storage_path('app/public')
    ));
});

afterEach(function () {
    global $filesystem;
    try {
        foreach (ImageCategory::cases() as $category) {
            if ($filesystem->directoryExists($category->value)) {
                $filesystem->deleteDirectory($category->value);
            }
        }
    } catch (FilesystemException) {
    }
});

it('can create an image', function () {
    global $filesystem;

    $imageData = [
        'name' => 'test-image',
        'category' => ImageCategory::CAT,
        'original_name' => 'cat.png',
        'path' => 'cat/test-image.png',
        'mimetype' => 'image/png',
    ];

    $filesystem->write($imageData['path'], 'fake image content');

    $image = Image::create($imageData);

    expect($image)->toBeInstanceOf(Image::class)
        ->and($image->id)->not->toBeNull()
        ->and($image->name)->toBe('test-image')
        ->and($image->category)->toBe(ImageCategory::CAT)
        ->and($image->path)->toBe('cat/test-image.png')
        ->and($filesystem->fileExists($imageData['path']))->toBeTrue();
});

it('can update an image', function () {
    global $filesystem;

    $image = Image::factory()->create();

    $newPath = 'mountain/updated-image.png';
    $filesystem->write($newPath, 'updated image content');

    $image->update([
        'name' => 'updated-name',
        'path' => $newPath,
        'category' => ImageCategory::MOUNTAIN,
    ]);

    $image->refresh();

    expect($image->name)->toBe('updated-name')
        ->and($image->path)->toBe($newPath)
        ->and($image->category)->toBe(ImageCategory::MOUNTAIN)
        ->and($filesystem->fileExists($newPath))->toBeTrue();
});

it('can delete an image', function () {
    global $filesystem;

    $image = Image::factory()->create();
    $path = $image->path;

    expect($filesystem->fileExists($path))->toBeTrue();

    $imageId = $image->id;
    $image->delete();

    expect(Image::find($imageId))->toBeNull()
        ->and($filesystem->fileExists($path))->toBeFalse();
});

it('has url attribute', function () {
    $image = Image::factory()->create();

    expect($image->url)->toContain('images/')
        ->and($image->url)->toContain($image->path);
});

it('mass assigns image fields', function () {
    global $filesystem;

    $path = 'travel/test-travel.png';
    $filesystem->write($path, 'travel image content');

    $image = Image::create([
        'name' => 'travel-pic',
        'category' => ImageCategory::TRAVEL,
        'original_name' => 'travel.png',
        'path' => $path,
        'mimetype' => 'image/png',
    ]);

    expect($image)->toBeInstanceOf(Image::class)
        ->and($image->name)->toBe('travel-pic')
        ->and($image->category)->toBe(ImageCategory::TRAVEL);
});

it('casts category to enum', function () {
    $image = Image::factory()->create(['category' => ImageCategory::PLAYROOM]);

    expect($image->category)->toBeInstanceOf(ImageCategory::class)
        ->and($image->category)->toBe(ImageCategory::PLAYROOM);
});

it('can create multiple images with different categories', function () {
    Image::factory()->count(3)->sequence(
        ['category' => ImageCategory::CAT],
        ['category' => ImageCategory::MOUNTAIN],
        ['category' => ImageCategory::TRAVEL],
    )->create();

    expect(Image::count())->toBe(3)
        ->and(Image::where('category', ImageCategory::CAT->value)->count())->toBe(1)
        ->and(Image::where('category', ImageCategory::MOUNTAIN->value)->count())->toBe(1)
        ->and(Image::where('category', ImageCategory::TRAVEL->value)->count())->toBe(1);
});
