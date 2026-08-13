<?php

use App\Models\Image;
use App\Models\PlayroomGame;

it('can create a playroom game', function () {
    $image = Image::factory()->create();

    $game = PlayroomGame::create([
        'name' => 'Memory Game',
        'description_es' => 'Un juego de memoria divertido',
        'description_en' => 'A fun memory game',
        'category_es' => 'Educativo',
        'category_en' => 'Educational',
        'image_id' => $image->id,
        'order' => 1,
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
    $image = Image::factory()->create();
    $game = PlayroomGame::factory()->create(['image_id' => $image->id]);

    $newImage = Image::factory()->create();

    $game->update([
        'name' => 'Updated Game',
        'description_es' => 'Descripción actualizada',
        'description_en' => 'Updated description',
        'category_es' => 'Diversión',
        'category_en' => 'Fun',
        'image_id' => $newImage->id,
        'order' => 5,
    ]);

    $game->refresh();

    expect($game->name)->toBe('Updated Game')
        ->and($game->description_es)->toBe('Descripción actualizada')
        ->and($game->description_en)->toBe('Updated description')
        ->and($game->category_es)->toBe('Diversión')
        ->and($game->category_en)->toBe('Fun')
        ->and($game->image_id)->toBe($newImage->id)
        ->and($game->order)->toBe(5);
});

it('can delete a playroom game', function () {
    $image = Image::factory()->create();
    $game = PlayroomGame::factory()->create(['image_id' => $image->id]);

    $gameId = $game->id;
    $game->delete();

    expect(PlayroomGame::find($gameId))->toBeNull();
});

it('belongs to an image', function () {
    $image = Image::factory()->create();
    $game = PlayroomGame::factory()->create(['image_id' => $image->id]);

    expect($game->image)->toBeInstanceOf(Image::class)
        ->and($game->image->id)->toBe($image->id);
});

it('has image url attribute', function () {
    $image = Image::factory()->create();
    $game = PlayroomGame::factory()->create(['image_id' => $image->id]);

    expect($game->image_url)->toContain('assets')
        ->and($game->image_url)->toContain($image->path);
});

it('loads image with game by default', function () {
    $image = Image::factory()->create();
    $game = PlayroomGame::factory()->create(['image_id' => $image->id]);

    $loadedGame = PlayroomGame::find($game->id);

    expect($loadedGame->relationLoaded('image'))->toBeTrue()
        ->and($loadedGame->image)->toBeInstanceOf(Image::class);
});

it('mass assigns playroom game fields', function () {
    $image = Image::factory()->create();

    $game = PlayroomGame::create([
        'name' => 'Puzzle',
        'description_es' => 'Rompecabezas',
        'description_en' => 'Puzzle Game',
        'category_es' => 'Lógica',
        'category_en' => 'Logic',
        'image_id' => $image->id,
        'order' => 2,
    ]);

    expect($game)->toBeInstanceOf(PlayroomGame::class)
        ->and($game->name)->toBe('Puzzle');
});

it('can create multiple playroom games', function () {
    $images = Image::factory()->count(3)->create();

    $games = PlayroomGame::factory()
        ->count(3)
        ->sequence(
            ['image_id' => $images[0]->id, 'order' => 1],
            ['image_id' => $images[1]->id, 'order' => 2],
            ['image_id' => $images[2]->id, 'order' => 3],
        )
        ->create();

    expect($games->count())->toBe(3)
        ->and(PlayroomGame::count())->toBe(3)
        ->and(PlayroomGame::where('order', 1)->first()->image_id)->toBe($images[0]->id);
});

it('deletes related image when game is deleted', function () {
    $image = Image::factory()->create();
    $game = PlayroomGame::factory()->create(['image_id' => $image->id]);

    $gameId = $game->id;
    $imageId = $image->id;
    $game->delete();

    expect(PlayroomGame::find($gameId))->toBeNull()
        ->and(Image::find($imageId))->toBeNull();
});
