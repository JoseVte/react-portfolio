<?php

use App\Enums\ImageCategory;
use App\Models\Image;
use App\Models\PlayroomGame;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    fakeDisk();
    allowLocalIp();
});

describe('index', function () {
    it('groups images by category and leaves the playroom out', function () {
        Image::factory()->inCategory(ImageCategory::CAT)->count(2)->create();
        Image::factory()->inCategory(ImageCategory::TRAVEL)->create();
        PlayroomGame::factory()->create();

        $response = $this->getJson(route('assets.index'));

        $response->assertOk();
        expect(array_keys($response->json()))->toEqualCanonicalizing(['cat', 'travel'])
            ->and($response->json('cat'))->toHaveCount(2);
    });

    it('is only reachable from an allowed ip', function () {
        config(['app.allowed-ips' => '10.0.0.1']);

        $this->getJson(route('assets.index'))->assertUnauthorized();
    });
});

describe('byCategory', function () {
    it('returns the images of a single category without needing an allowed ip', function () {
        config(['app.allowed-ips' => '10.0.0.1']);
        Image::factory()->inCategory(ImageCategory::MOUNTAIN)->count(3)->create();
        Image::factory()->inCategory(ImageCategory::CAT)->create();

        $response = $this->getJson(route('assets.show', ImageCategory::MOUNTAIN->value));

        $response->assertOk();
        expect($response->json())->toHaveCount(3);
    });

    it('rejects a category that is not part of the enum', function () {
        $this->getJson('/api/assets/not-a-category')->assertNotFound();
    });
});

describe('store', function () {
    it('stores the upload and records it', function () {
        $response = $this->post(route('assets.store'), [
            'category' => ImageCategory::CAT->value,
            'file' => fakeUpload('holidays.png'),
        ]);

        $response->assertRedirect();

        $image = Image::sole();

        expect($image->category)->toBe(ImageCategory::CAT)
            ->and($image->original_name)->toBe('holidays.png')
            ->and($image->path)->toStartWith('cat/');
        Storage::assertExists($image->path);
    });

    it('never overwrites an existing file when two uploads share a name', function () {
        foreach (range(1, 2) as $ignored) {
            $this->post(route('assets.store'), [
                'category' => ImageCategory::CAT->value,
                'file' => fakeUpload('same-name.png'),
            ])->assertRedirect();
        }

        $paths = Image::pluck('path');

        expect($paths)->toHaveCount(2)
            ->and($paths->unique())->toHaveCount(2);
    });

    it('requires a valid category and an image', function () {
        $this->post(route('assets.store'), [])
            ->assertSessionHasErrors(['category', 'file']);

        $this->post(route('assets.store'), [
            'category' => 'nope',
            'file' => fakeUpload(),
        ])->assertSessionHasErrors('category');

        expect(Image::count())->toBe(0);
    });

    it('rejects a file that is not an image', function () {
        $this->post(route('assets.store'), [
            'category' => ImageCategory::CAT->value,
            'file' => UploadedFile::fake()->create('resume.pdf', 10, 'application/pdf'),
        ])->assertSessionHasErrors('file');

        expect(Image::count())->toBe(0);
    });

    it('is only reachable from an allowed ip', function () {
        config(['app.allowed-ips' => '10.0.0.1']);

        $this->post(route('assets.store'), [
            'category' => ImageCategory::CAT->value,
            'file' => fakeUpload(),
        ])->assertUnauthorized();
    });
});

describe('delete', function () {
    it('deletes the image and its file', function () {
        $image = imageWithFile(ImageCategory::CAT);

        $this->delete(route('assets.destroy', ['category' => $image->category->value, 'image' => $image->id]))
            ->assertRedirect();

        expect(Image::find($image->id))->toBeNull();
        Storage::assertMissing($image->path);
    });

    it('refuses to delete through a mismatched category', function () {
        $image = imageWithFile(ImageCategory::CAT);

        $this->delete(route('assets.destroy', ['category' => ImageCategory::TRAVEL->value, 'image' => $image->id]))
            ->assertNotFound();

        expect(Image::find($image->id))->not->toBeNull();
        Storage::assertExists($image->path);
    });

    it('is only reachable from an allowed ip', function () {
        config(['app.allowed-ips' => '10.0.0.1']);
        $image = imageWithFile();

        $this->delete(route('assets.destroy', ['category' => $image->category->value, 'image' => $image->id]))
            ->assertUnauthorized();

        expect(Image::find($image->id))->not->toBeNull();
    });
});

describe('categories', function () {
    it('lists every category except the playroom one', function () {
        $response = $this->getJson(route('categories'));

        $response->assertOk();
        expect(collect($response->json())->pluck('value')->all())
            ->toEqualCanonicalizing(['cat', 'mountain', 'other', 'travel']);
    });
});
