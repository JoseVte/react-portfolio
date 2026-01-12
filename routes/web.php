<?php

use App\Http\Middleware\IpMiddleware;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'homepage')->name('homepage');
Route::inertia('about', 'about')->name('about');
Route::inertia('projects', 'projects')->name('projects');

Route::middleware(IpMiddleware::class)->group(function () {
    include 'admin.php';
});

$handleImageRequest = static function (Request $request, Image $image) {
    if ($request->boolean('preview')) {
        cache()->forget("image-{$image->path}");
    }

    return cache()->remember("image-{$image->path}", 60 * 60 * 24, function () use ($image) {
        $response = Response::make(Storage::get($image->path));
        $response->header('Content-Type', Storage::mimeType($image->path));
        $response->header('Content-Length', Storage::size($image->path));
        $response->header('Cache-Control', 'public, max-age=31536000');

        return $response;
    });
};

Route::get('assets/{image:path}', $handleImageRequest)->name('assets')->where('image', '.*');

Route::get('images/{image:path}', $handleImageRequest)->name('images')->where('image', '.*');
