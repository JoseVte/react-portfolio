<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ImageCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\AssetRequest;
use App\Models\Image;
use App\Services\ImageUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class AssetController extends Controller
{
    public function __construct(private readonly ImageUploadService $imageUploadService) {}

    public function index(): JsonResponse
    {
        $images = Image::query()
            ->whereNot('category', ImageCategory::PLAYROOM->value)
            ->orderBy('category')
            ->orderBy('id')
            ->get()
            ->groupBy(fn (Image $image): string => $image->category->value);

        return response()->json($images);
    }

    public function byCategory(ImageCategory $category): JsonResponse
    {
        return response()->json(
            Image::query()->where('category', $category->value)->orderBy('id')->get()
        );
    }

    public function store(AssetRequest $request): RedirectResponse
    {
        $this->imageUploadService->store(
            $request->file('file'),
            ImageCategory::from($request->validated('category')),
        );

        return back();
    }

    public function delete(ImageCategory $category, Image $image): RedirectResponse
    {
        abort_unless($image->category === $category, 404);

        $image->delete();

        return back();
    }
}
