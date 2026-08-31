<?php

namespace Database\Factories;

use App\Enums\ImageCategory;
use App\Models\Image;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Image>
 */
class ImageFactory extends Factory
{
    protected $model = Image::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Playroom images are always created through the playroom flow, so they are
        // opted into explicitly with `inCategory()` instead of appearing at random.
        $category = fake()->randomElement(array_filter(
            ImageCategory::cases(),
            fn (ImageCategory $category): bool => $category !== ImageCategory::PLAYROOM,
        ));
        $name = Str::uuid()->toString().'.png';

        return [
            'name' => $name,
            'path' => $category->value.'/'.$name,
            'category' => $category,
            'original_name' => fake()->slug().'.png',
            'mimetype' => 'image/png',
        ];
    }

    public function inCategory(ImageCategory $category): static
    {
        return $this->state(function () use ($category): array {
            $name = Str::uuid()->toString().'.png';

            return [
                'category' => $category,
                'name' => $name,
                'path' => $category->value.'/'.$name,
            ];
        });
    }
}
