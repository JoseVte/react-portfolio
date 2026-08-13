<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\PlayroomGameRequest;
use App\Models\Image;
use App\Models\PlayroomGame;
use Arr;
use DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use League\Flysystem\FilesystemException;
use Storage;
use Throwable;

class PlayroomController
{
    public function index(): JsonResponse
    {
        return response()->json(PlayroomGame::ordered()->get());
    }

    /**
     * @throws FilesystemException
     */
    public function store(PlayroomGameRequest $request): RedirectResponse
    {
        [$validated, $category, $file, $extension, $fileCount, $path] = $this->generatePath($request);

        try {
            DB::transaction(function () use ($validated, $extension, $fileCount, $category, $file, $path) {
                Storage::put($path, $file->getContent());

                $image = Image::create([
                    'category' => $category,
                    'name' => $fileCount.'.'.$extension,
                    'original_name' => $file->getClientOriginalName(),
                    'mimetype' => $file->getMimeType(),
                    'path' => $path,
                ]);

                PlayroomGame::create([
                    'name' => $validated['name'],
                    'description_en' => Arr::get($validated, 'description_en') ?? '',
                    'description_es' => Arr::get($validated, 'description_es') ?? '',
                    'category_en' => Arr::get($validated, 'category_en', ''),
                    'category_es' => Arr::get($validated, 'category_es', ''),
                    'image_id' => $image->id,
                ]);
            });

            return back();
        } catch (Throwable $e) {
            report($e);

            if (Storage::exists($path)) {
                Storage::delete($path);
            }

            return back()->with('error', 'Error saving game');
        }
    }

    /**
     * @throws FilesystemException
     */
    public function update(PlayroomGameRequest $request, PlayroomGame $game): RedirectResponse
    {
        [$validated, $category, $file, $extension, $fileCount, $path] = $this->generatePath($request);

        try {
            DB::transaction(function () use ($game, $validated, $extension, $fileCount, $category, $file, $path) {
                $game->update([
                    'name' => $validated['name'],
                    'description_en' => Arr::get($validated, 'description_en') ?? '',
                    'description_es' => Arr::get($validated, 'description_es') ?? '',
                    'category_en' => Arr::get($validated, 'category_en', ''),
                    'category_es' => Arr::get($validated, 'category_es', ''),
                ]);

                if ($path) {
                    $oldImage = $game->image;

                    Storage::put($path, $file->getContent());

                    $image = Image::create([
                        'category' => $category,
                        'name' => $fileCount.'.'.$extension,
                        'original_name' => $file->getClientOriginalName(),
                        'mimetype' => $file->getMimeType(),
                        'path' => $path,
                    ]);

                    $game->update([
                        'image_id' => $image->id,
                    ]);

                    $oldImage->delete();
                }
            });

            return back();
        } catch (Throwable $e) {
            report($e);

            if ($path && Storage::exists($path)) {
                Storage::delete($path);
            }

            return back()->with('error', 'Error saving game');
        }
    }

    public function sort(Request $request): RedirectResponse
    {
        $ids = $request->validate(['id' => ['required', 'array']])['id'];

        PlayroomGame::setNewOrder($ids);

        return back();
    }

    /**
     * @throws FilesystemException
     */
    public function delete(PlayroomGame $game): RedirectResponse
    {
        $game->delete();

        return back();
    }

    /**
     * @throws FilesystemException
     */
    public function generatePath(PlayroomGameRequest $request): array
    {
        $validated = $request->validated();
        $category = 'playroom';
        $file = $extension = $path = null;
        $fileCount = 1;

        $file = $request->file('file') ?: $request->get('file');
        if ($file) {
            $extension = $file->clientExtension();

            if (Storage::has($category)) {
                $fileCount += count(Storage::listContents($category)->toArray());
            }

            while (Storage::has($category.'/'.$fileCount.'.'.$extension)) {
                $fileCount++;
            }

            $path = $category.'/'.$fileCount.'.'.$extension;
        }

        return [$validated, $category, $file, $extension, $fileCount, $path];
    }
}
