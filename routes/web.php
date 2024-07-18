<?php

use App\Http\Controllers\ProfileController;
use App\Models\Image;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'Homepage');
Route::inertia('about', 'About');
Route::inertia('projects', 'Projects');
Route::inertia('admin', 'Admin')
    ->middleware(\App\Http\Middleware\IpMiddleware::class);

Route::get('assets/{image:path}', function (Image $image) {
    return cache()->remember("image-{$image->path}", 60 * 60 * 24, function () use ($image) {
        return Storage::get($image->path);
    });
})->name('asset')->where('image', '.*');
Route::get('images/{image:path}', function (Image $image) {
    return cache()->remember("image-{$image->path}", 60 * 60 * 24, function () use ($image) {
        return Storage::get($image->path);
    });
})->name('asset')->where('image', '.*');
