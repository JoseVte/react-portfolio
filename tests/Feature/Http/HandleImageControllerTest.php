<?php

use App\Enums\ImageCategory;
use App\Models\Image;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    fakeDisk();
    Cache::flush();
});

it('serves the file with its recorded mime type', function () {
    $image = imageWithFile(ImageCategory::CAT, 'binary-contents');

    $response = $this->get(route('images', $image->path));

    $response->assertOk()
        ->assertHeader('Content-Type', 'image/png')
        ->assertHeader('Content-Length', (string) strlen('binary-contents'));

    expect($response->getContent())->toBe('binary-contents');
});

it('is reachable through the assets route as well', function () {
    $image = imageWithFile();

    $this->get(route('assets', $image->path))->assertOk();
});

it('marks the response as cacheable for a long time', function () {
    $image = imageWithFile();

    $this->get(route('images', $image->path))
        ->assertHeader('Cache-Control', 'immutable, max-age=31536000, public');
});

it('returns a 404 for an unknown path', function () {
    $this->get('/images/cat/does-not-exist.png')->assertNotFound();
});

it('returns a 404 when the record exists but the file does not', function () {
    $image = Image::factory()->create();

    Storage::assertMissing($image->path);

    $this->get(route('images', $image->path))->assertNotFound();
});

it('does not cache a miss, so the file becomes servable once it is uploaded', function () {
    $image = Image::factory()->create();

    $this->get(route('images', $image->path))->assertNotFound();

    Storage::put($image->path, 'now here');

    $this->get(route('images', $image->path))->assertOk();
});

it('serves the cached copy without touching the disk again', function () {
    $image = imageWithFile(ImageCategory::CAT, 'first');

    $this->get(route('images', $image->path))->assertOk();

    Storage::put($image->path, 'second');

    $response = $this->get(route('images', $image->path));

    expect($response->getContent())->toBe('first');
});

it('refreshes the cached copy when preview is requested', function () {
    $image = imageWithFile(ImageCategory::CAT, 'first');

    $this->get(route('images', $image->path))->assertOk();
    Storage::put($image->path, 'second');

    $response = $this->get(route('images', ['image' => $image->path, 'preview' => 1]));

    expect($response->getContent())->toBe('second');
});
