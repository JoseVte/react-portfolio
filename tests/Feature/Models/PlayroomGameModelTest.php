<?php

use App\Models\Image;
use App\Models\PlayroomGame;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    fakeDisk();
});

it('can create a playroom game', function () {
    $image = Image::factory()->create();

    $game = PlayroomGame::create([
        'name' => 'Memory Game',
        'description_es' => 'Un juego de memoria divertido',
        'description_en' => 'A fun memory game',
        'category_es' => 'Educativo',
        'category_en' => 'Educational',
        'image_id' => $image->id,
    ]);

    expect($game)->toBeInstanceOf(PlayroomGame::class)
        ->and($game->id)->not->toBeNull()
        ->and($game->name)->toBe('Memory Game')
        ->and($game->description_es)->toBe('Un juego de memoria divertido')
        ->and($game->description_en)->toBe('A fun memory game')
        ->and($game->category_es)->toBe('Educativo')
        ->and($game->category_en)->toBe('Educational')
        ->and($game->image_id)->toBe($image->id)
        ->and($game->order)->toBe(1);
});

it('can update a playroom game', function () {
    $game = PlayroomGame::factory()->create();
    $newImage = Image::factory()->create();

    $game->update([
        'name' => 'Updated Game',
        'description_en' => 'Updated description',
        'category_en' => 'Fun',
        'image_id' => $newImage->id,
    ]);

    expect($game->fresh())
        ->name->toBe('Updated Game')
        ->description_en->toBe('Updated description')
        ->category_en->toBe('Fun')
        ->image_id->toBe($newImage->id);
});

it('belongs to an image', function () {
    $image = Image::factory()->create();
    $game = PlayroomGame::factory()->for($image)->create();

    expect($game->image)->toBeInstanceOf(Image::class)
        ->and($game->image->id)->toBe($image->id);
});

it('exposes an image url attribute pointing at the assets route', function () {
    $game = PlayroomGame::factory()->create();

    expect($game->image_url)
        ->toContain('assets')
        ->toContain($game->image->path);
});

it('eager loads its image by default', function () {
    $game = PlayroomGame::factory()->create();

    $loadedGame = PlayroomGame::find($game->id);

    expect($loadedGame->relationLoaded('image'))->toBeTrue()
        ->and($loadedGame->image)->toBeInstanceOf(Image::class);
});

it('hides the raw image relation from serialization', function () {
    $game = PlayroomGame::factory()->create();

    expect($game->toArray())
        ->not->toHaveKey('image')
        ->not->toHaveKey('image_id')
        ->toHaveKey('image_url');
});

it('deletes the related image and its file when the game is deleted', function () {
    $image = imageWithFile();
    $game = PlayroomGame::factory()->for($image)->create();

    $game->delete();

    expect(PlayroomGame::find($game->id))->toBeNull()
        ->and(Image::find($image->id))->toBeNull();
    Storage::assertMissing($image->path);
});

it('cascades the deletion of an image to its game', function () {
    $image = imageWithFile();
    $game = PlayroomGame::factory()->for($image)->create();

    $image->delete();

    expect(PlayroomGame::find($game->id))->toBeNull();
});

it('assigns an incrementing order on creation', function () {
    $first = PlayroomGame::factory()->create();
    $second = PlayroomGame::factory()->create();

    expect($second->order)->toBe($first->order + 1)
        ->and(PlayroomGame::ordered()->pluck('id')->all())->toBe([$first->id, $second->id]);
});

it('can be reordered', function () {
    $games = PlayroomGame::factory()->count(3)->create();
    $reversedIds = $games->pluck('id')->reverse()->values()->all();

    PlayroomGame::setNewOrder($reversedIds);

    expect(PlayroomGame::ordered()->pluck('id')->all())->toBe($reversedIds);
});
