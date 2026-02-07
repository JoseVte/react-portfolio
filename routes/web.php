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

    if (! Storage::exists($image->path)) {
        abort(404, 'The file does not exist.');
    }

    return cache()->remember("image-{$image->path}", 60 * 60 * 24, function () use ($image) {
        $content = Storage::get($image->path);
        $contentLength = strlen($content);

        $response = Response::make($content);
        $response->header('Content-Type', $image->mimetype ?? mime_content_type($image->path));
        $response->header('Content-Length', $contentLength);
        $response->header('Cache-Control', 'public, max-age=31536000');

        return $response;
    });
};

Route::get('assets/{image:path}', $handleImageRequest)->name('assets')->where('image', '.*');

Route::get('images/{image:path}', $handleImageRequest)->name('images')->where('image', '.*');
