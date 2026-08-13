<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ImageCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\AssetRequest;
use App\Models\Image;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use League\Flysystem\FilesystemException;
use Storage;

class AssetController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Image::whereNotIn('category', [ImageCategory::PLAYROOM->value])->get()->groupBy('category'));
    }

    public function byCategory(string $category): JsonResponse
    {
        return response()->json(Image::where('category', $category)->get());
    }

    /**
     * @throws FilesystemException
     */
    public function store(AssetRequest $request): RedirectResponse
    {
        $validated = $request->validated();

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
    }

    public function delete(string $category, Image $image): RedirectResponse
    {
        $image->delete();

        return back();
    }
}
