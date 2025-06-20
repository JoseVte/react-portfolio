<?php

use App\Http\Middleware\IpMiddleware;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'homepage')->name('homepage');
Route::inertia('about', 'about')->name('about');
Route::inertia('projects', 'projects')->name('projects');;

Route::middleware(IpMiddleware::class)->group(function () {
    include 'admin.php';
});

Route::get('assets/{image:path}', function (Request $request, Image $image) {
    if ($request->boolean('preview')) {
        cache()->forget("image-{$image->path}");
    }

    return cache()->remember("image-{$image->path}", 60 * 60 * 24, function () use ($image) {
        return Storage::get($image->path);
    });
})->name('asset')->where('image', '.*');

Route::get('images/{image:path}', function (Request $request, Image $image) {
    if ($request->boolean('preview')) {
        cache()->forget("image-{$image->path}");
    }

    return cache()->remember("image-{$image->path}", 60 * 60 * 24, function () use ($image) {
        return Storage::get($image->path);
    });
})->name('asset')->where('image', '.*');
