<?php

use App\Enums\ImageCategory;
use App\Http\Controllers\Admin\AssetController;
use App\Http\Controllers\Admin\PlayroomController;
use App\Http\Middleware\IpMiddleware;
use Illuminate\Support\Str;

Route::inertia('admin', 'admin')->name('admin');

Route::prefix('api')->group(function () {
    Route::prefix('assets')->name('assets.')->group(function () {
        Route::get('/', [AssetController::class, 'index'])->name('index');

        Route::get('{category}', [AssetController::class, 'byCategory'])
            ->withoutMiddleware(IpMiddleware::class)
            ->name('show');

        Route::post('/', [AssetController::class, 'store'])->name('store');

        Route::delete('{category}/{image}', [AssetController::class, 'delete'])->name('destroy');
    });

    Route::prefix('playrooms')->name('playroom.')->group(function () {
        Route::get('/', [PlayroomController::class, 'index'])->name('index');

        Route::post('/', [PlayroomController::class, 'store'])->name('store');

        Route::post('/{game}', [PlayroomController::class, 'update'])->name('update');

        Route::put('/', [PlayroomController::class, 'sort'])->name('sort');

        Route::delete('/{game}', [PlayroomController::class, 'delete'])->name('destroy');
    });

    Route::get('categories', function () {
        $categories = array_filter(array_map(static fn (ImageCategory $imageCategory) => [
            'name' => Str::ucfirst($imageCategory->value),
            'value' => $imageCategory->value,
        ], ImageCategory::cases()), fn ($category) => $category['value'] !== ImageCategory::PLAYROOM->value);

        return response()->json($categories);
    })->name('categories');
});
