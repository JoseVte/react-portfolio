<?php

namespace App\Http\Controllers;

use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class HandleImageController extends Controller
{
    private const DAY_IN_SECONDS = 86400;

    private const YEAR_IN_SECONDS = 31536000;

    public function __invoke(Request $request, Image $image): Response
    {
        $cacheKey = "image-{$image->path}";

        if ($request->boolean('preview')) {
            Cache::forget($cacheKey);
        }

        $contents = Cache::remember($cacheKey, self::DAY_IN_SECONDS, function () use ($image): ?string {
            if (Storage::missing($image->path)) {
                return null;
            }

            return Storage::get($image->path);
        });

        abort_if($contents === null, 404, 'The file does not exist.');

        return response($contents, 200, [
            'Content-Type' => $image->mimetype ?? 'application/octet-stream',
            'Content-Length' => (string) strlen($contents),
            'Cache-Control' => 'public, max-age='.self::YEAR_IN_SECONDS.', immutable',
        ]);
    }
}
