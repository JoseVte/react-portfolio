<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ImageCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\PlayroomGameRequest;
use App\Models\Image;
use App\Models\PlayroomGame;
use App\Services\ImageUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class PlayroomController extends Controller
{
    public function __construct(private readonly ImageUploadService $imageUploadService) {}

    public function index(): JsonResponse
    {
        return response()->json(PlayroomGame::ordered()->get());
    }

    public function store(PlayroomGameRequest $request): RedirectResponse
    {
        $uploadedImage = null;

        try {
            DB::transaction(function () use ($request, &$uploadedImage): void {
                $uploadedImage = $this->imageUploadService->store($request->file('file'), ImageCategory::PLAYROOM);

                PlayroomGame::create([
                    ...$this->attributesFrom($request),
                    'image_id' => $uploadedImage->id,
                ]);
            });
        } catch (Throwable $throwable) {
            return $this->rollback($throwable, $uploadedImage);
        }

        return back();
    }

    public function update(PlayroomGameRequest $request, PlayroomGame $game): RedirectResponse
    {
        $uploadedImage = null;

        try {
            DB::transaction(function () use ($request, $game, &$uploadedImage): void {
                $game->update($this->attributesFrom($request));

                if (! $request->hasFile('file')) {
                    return;
                }

                $previousImage = $game->image;
                $uploadedImage = $this->imageUploadService->store($request->file('file'), ImageCategory::PLAYROOM);

                $game->update(['image_id' => $uploadedImage->id]);

                $previousImage?->delete();
            });
        } catch (Throwable $throwable) {
            return $this->rollback($throwable, $uploadedImage);
        }

        return back();
    }

    public function sort(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id' => ['required', 'array'],
            'id.*' => ['required', 'integer', 'exists:playroom_games,id'],
        ]);

        PlayroomGame::setNewOrder($validated['id']);

        return back();
    }

    public function delete(PlayroomGame $game): RedirectResponse
    {
        $game->delete();

        return back();
    }

    /**
     * The database transaction is rolled back for us, the uploaded file is not.
     */
    private function rollback(Throwable $throwable, ?Image $uploadedImage): RedirectResponse
    {
        report($throwable);

        if ($uploadedImage !== null && Storage::exists($uploadedImage->path)) {
            Storage::delete($uploadedImage->path);
        }

        return back()->with('error', 'Error saving game');
    }

    /**
     * @return array<string, string>
     */
    private function attributesFrom(PlayroomGameRequest $request): array
    {
        return [
            'name' => $request->validated('name'),
            'description_en' => $request->validated('description_en') ?? '',
            'description_es' => $request->validated('description_es') ?? '',
            'category_en' => $request->validated('category_en'),
            'category_es' => $request->validated('category_es'),
        ];
    }
}
