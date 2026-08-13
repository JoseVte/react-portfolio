<?php

namespace App\Http\Controllers;

use App\Models\Image;
use Illuminate\Http\Request;
use Response;
use Storage;

class HandleImageController extends Controller
{
    public function __invoke(Request $request, Image $image)
    {
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
    }
}
