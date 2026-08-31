<?php

use App\Enums\ImageCategory;
use App\Models\Image;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    fakeDisk();
});

it('can create an image', function () {
    $image = Image::create([
        'name' => 'test-image.png',
        'category' => ImageCategory::CAT,
        'original_name' => 'cat.png',
        'path' => 'cat/test-image.png',
        'mimetype' => 'image/png',
    ]);

    expect($image)->toBeInstanceOf(Image::class)
        ->and($image->id)->not->toBeNull()
        ->and($image->name)->toBe('test-image.png')
        ->and($image->category)->toBe(ImageCategory::CAT)
        ->and($image->path)->toBe('cat/test-image.png');
});

it('can update an image', function () {
    $image = Image::factory()->create();

    $image->update([
        'name' => 'updated-name.png',
        'path' => 'mountain/updated-name.png',
        'category' => ImageCategory::MOUNTAIN,
    ]);

    expect($image->fresh())
        ->name->toBe('updated-name.png')
        ->path->toBe('mountain/updated-name.png')
        ->category->toBe(ImageCategory::MOUNTAIN);
});

it('removes the underlying file when the image is deleted', function () {
    $image = imageWithFile();

    Storage::assertExists($image->path);

    $image->delete();

    expect(Image::find($image->id))->toBeNull();
    Storage::assertMissing($image->path);
});

it('does not fail deleting an image whose file is already gone', function () {
    $image = Image::factory()->create();

    Storage::assertMissing($image->path);

    $image->delete();

    expect(Image::find($image->id))->toBeNull();
});

it('exposes a url attribute pointing at the images route', function () {
    $image = Image::factory()->create();

    expect($image->url)
        ->toContain('images/')
        ->toContain($image->path);
});

it('casts category to the enum', function () {
    $image = Image::factory()->inCategory(ImageCategory::PLAYROOM)->create();

    expect($image->category)->toBeInstanceOf(ImageCategory::class)
        ->and($image->category)->toBe(ImageCategory::PLAYROOM);
});

it('can create multiple images with different categories', function () {
    Image::factory()->inCategory(ImageCategory::CAT)->create();
    Image::factory()->inCategory(ImageCategory::MOUNTAIN)->create();
    Image::factory()->inCategory(ImageCategory::TRAVEL)->create();

    expect(Image::count())->toBe(3)
        ->and(Image::where('category', ImageCategory::CAT->value)->count())->toBe(1)
        ->and(Image::where('category', ImageCategory::MOUNTAIN->value)->count())->toBe(1)
        ->and(Image::where('category', ImageCategory::TRAVEL->value)->count())->toBe(1);
});
