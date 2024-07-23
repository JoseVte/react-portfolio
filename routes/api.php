<?php

use App\Enums\ImageCategory;
use App\Http\Middleware\IpMiddleware;
use App\Models\Image;
use Illuminate\Support\Str;

Route::prefix('assets')->name('assets.')->group(function () {
    Route::get('/', function () {
        return response()->json(Image::all()->groupBy('category'));
    })->name('index');

    Route::get('{category}', function (string $category) {
        return response()->json(Image::where('category', $category)->get());
    })->withoutMiddleware(IpMiddleware::class)->name('show');

    Route::post('/', function (\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'category' => ['required', 'string', ImageCategory::rule()],
            'file' => ['required', 'image'],
        ]);

        $file = $request->file('file') ?: $request->get('file');
        $extension = $file->clientExtension();

        $fileCount = 1;
        if (Storage::has($validated['category'])) {
            $fileCount += count(Storage::listContents($validated['category'])->toArray());
        }

        while (Storage::has($validated['category'].'/'.$fileCount.'.'.$extension)) {
            $fileCount++;
        }

        $path = $validated['category'].'/'.$fileCount.'.'.$extension;
        Storage::put($path, $file->getContent());

        Image::create([
            'category' => $validated['category'],
            'name' => $fileCount.'.'.$extension,
            'original_name' => $file->getClientOriginalName(),
            'mimetype' => $file->getMimeType(),
            'path' => $path,
        ]);

        return back();
    })->name('store');

    Route::delete('{category}/{image}', function (string $category, Image $image) {
        if (Storage::has($image->path)) {
            Storage::delete($image->path);
        }

        $image->delete();

        return back();
    })->name('destroy');
});

Route::get('categories', function () {
    return response()->json(array_map(static fn (ImageCategory $imageCategory) => [
        'name' => Str::ucfirst($imageCategory->value),
        'value' => $imageCategory->value,
    ], ImageCategory::cases()));
})->name('categories');

Route::get('github', function (\Illuminate\Http\Request $request) {
    if ($request->boolean('preview')) {
        cache()->forget('github');
    }

    return cache()->remember('github', 60 * 60 * 24, function () {
        $response = Http::withHeaders([
            'Accept' => 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version' => '2022-11-28',
        ])->withToken(env('GITHUB_OAUTH_TOKEN'))
            ->get('https://api.github.com/user/repos', [
                'visibility' => 'public',
                'sort' => 'updated',
                'direction' => 'desc',
                'per_page' => 6,
            ]);

        return response()->json($response->json());
    });
})->withoutMiddleware(IpMiddleware::class)->name('github');
