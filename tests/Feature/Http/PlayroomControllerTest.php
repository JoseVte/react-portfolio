<?php

use App\Enums\ImageCategory;
use App\Models\Image;
use App\Models\PlayroomGame;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    fakeDisk();
    allowLocalIp();
});

describe('public listing', function () {
    it('returns the games in their configured order', function () {
        $games = PlayroomGame::factory()->count(3)->create();
        PlayroomGame::setNewOrder($games->pluck('id')->reverse()->values()->all());

        $response = $this->getJson(route('playroom'));

        $response->assertOk();
        expect(collect($response->json())->pluck('id')->all())
            ->toBe($games->pluck('id')->reverse()->values()->all());
    });

    it('exposes the image url but not the raw relation', function () {
        $game = PlayroomGame::factory()->create();

        $response = $this->getJson(route('playroom'));

        $response->assertOk()
            ->assertJsonPath('0.image_url', $game->image_url)
            ->assertJsonMissingPath('0.image')
            ->assertJsonMissingPath('0.image_id');
    });

    it('does not need an allowed ip', function () {
        config(['app.allowed-ips' => '10.0.0.1']);

        $this->getJson(route('playroom'))->assertOk();
    });
});

describe('admin listing', function () {
    it('is only reachable from an allowed ip', function () {
        config(['app.allowed-ips' => '10.0.0.1']);

        $this->getJson(route('playroom.index'))->assertUnauthorized();
    });

    it('returns the games for an allowed ip', function () {
        PlayroomGame::factory()->count(2)->create();

        $this->getJson(route('playroom.index'))->assertOk()->assertJsonCount(2);
    });
});

describe('store', function () {
    it('creates the game together with a playroom image', function () {
        $response = $this->post(route('playroom.store'), [
            'name' => 'Wingspan',
            'description_en' => 'Birds',
            'description_es' => 'Pájaros',
            'category_en' => 'Strategy',
            'category_es' => 'Estrategia',
            'file' => fakeUpload('wingspan.png'),
        ]);

        $response->assertRedirect()->assertSessionHasNoErrors();

        $game = PlayroomGame::sole();

        expect($game->name)->toBe('Wingspan')
            ->and($game->description_es)->toBe('Pájaros')
            ->and($game->category_en)->toBe('Strategy')
            ->and($game->image->category)->toBe(ImageCategory::PLAYROOM);
        Storage::assertExists($game->image->path);
    });

    it('defaults missing descriptions to an empty string', function () {
        $this->post(route('playroom.store'), [
            'name' => 'Azul',
            'category_en' => 'Abstract',
            'category_es' => 'Abstracto',
            'file' => fakeUpload(),
        ])->assertSessionHasNoErrors();

        expect(PlayroomGame::sole())
            ->description_en->toBe('')
            ->description_es->toBe('');
    });

    it('requires a name, both categories and an image', function () {
        $this->post(route('playroom.store'), [])
            ->assertSessionHasErrors(['name', 'category_en', 'category_es', 'file']);

        expect(PlayroomGame::count())->toBe(0)
            ->and(Image::count())->toBe(0);
    });

    it('is only reachable from an allowed ip', function () {
        config(['app.allowed-ips' => '10.0.0.1']);

        $this->post(route('playroom.store'), [
            'name' => 'Azul',
            'category_en' => 'Abstract',
            'category_es' => 'Abstracto',
            'file' => fakeUpload(),
        ])->assertUnauthorized();
    });
});

describe('update', function () {
    it('updates the text fields without touching the image', function () {
        $game = PlayroomGame::factory()->create();
        $originalImageId = $game->image_id;

        $this->post(route('playroom.update', $game), [
            'name' => 'Renamed',
            'description_en' => 'English text',
            'description_es' => 'Texto español',
            'category_en' => 'Party',
            'category_es' => 'Fiesta',
        ])->assertRedirect()->assertSessionHasNoErrors();

        expect($game->fresh())
            ->name->toBe('Renamed')
            ->description_en->toBe('English text')
            ->description_es->toBe('Texto español')
            ->image_id->toBe($originalImageId);
    });

    it('keeps the english and spanish descriptions separate', function () {
        $game = PlayroomGame::factory()->create();

        $this->post(route('playroom.update', $game), [
            'name' => $game->name,
            'description_en' => 'Only english',
            'description_es' => 'Solo español',
            'category_en' => $game->category_en,
            'category_es' => $game->category_es,
        ])->assertSessionHasNoErrors();

        expect($game->fresh())
            ->description_en->toBe('Only english')
            ->description_es->toBe('Solo español');
    });

    it('replaces the image and removes the previous file', function () {
        $game = PlayroomGame::factory()->create();
        Storage::put($game->image->path, 'old contents');
        $previousImage = $game->image;

        $this->post(route('playroom.update', $game), [
            'name' => $game->name,
            'category_en' => $game->category_en,
            'category_es' => $game->category_es,
            'file' => fakeUpload('replacement.png'),
        ])->assertRedirect()->assertSessionHasNoErrors();

        $game->refresh();

        expect($game->image_id)->not->toBe($previousImage->id)
            ->and(Image::find($previousImage->id))->toBeNull()
            ->and($game->image->original_name)->toBe('replacement.png');
        Storage::assertMissing($previousImage->path);
        Storage::assertExists($game->image->path);
    });

    it('still requires a name and both categories', function () {
        $game = PlayroomGame::factory()->create();

        $this->post(route('playroom.update', $game), [])
            ->assertSessionHasErrors(['name', 'category_en', 'category_es']);
    });

    it('is only reachable from an allowed ip', function () {
        config(['app.allowed-ips' => '10.0.0.1']);
        $game = PlayroomGame::factory()->create();

        $this->post(route('playroom.update', $game), ['name' => 'Nope'])->assertUnauthorized();
    });
});

describe('sort', function () {
    it('persists the new order', function () {
        $games = PlayroomGame::factory()->count(3)->create();
        $newOrder = $games->pluck('id')->reverse()->values()->all();

        $this->put(route('playroom.sort'), ['id' => $newOrder])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        expect(PlayroomGame::ordered()->pluck('id')->all())->toBe($newOrder);
    });

    it('rejects ids that do not exist', function () {
        $this->put(route('playroom.sort'), ['id' => [9999]])->assertSessionHasErrors('id.0');
    });

    it('rejects a missing id list', function () {
        $this->put(route('playroom.sort'), [])->assertSessionHasErrors('id');
    });

    it('is only reachable from an allowed ip', function () {
        config(['app.allowed-ips' => '10.0.0.1']);

        $this->put(route('playroom.sort'), ['id' => [1]])->assertUnauthorized();
    });
});

describe('delete', function () {
    it('deletes the game, its image and the file', function () {
        $game = PlayroomGame::factory()->create();
        Storage::put($game->image->path, 'contents');
        $image = $game->image;

        $this->delete(route('playroom.destroy', $game))->assertRedirect();

        expect(PlayroomGame::find($game->id))->toBeNull()
            ->and(Image::find($image->id))->toBeNull();
        Storage::assertMissing($image->path);
    });

    it('is only reachable from an allowed ip', function () {
        config(['app.allowed-ips' => '10.0.0.1']);
        $game = PlayroomGame::factory()->create();

        $this->delete(route('playroom.destroy', $game))->assertUnauthorized();

        expect(PlayroomGame::find($game->id))->not->toBeNull();
    });
});
