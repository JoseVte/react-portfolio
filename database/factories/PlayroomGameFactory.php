<?php

namespace Database\Factories;

use App\Models\Image;
use App\Models\PlayroomGame;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PlayroomGame>
 */
class PlayroomGameFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'description_es' => fake()->sentence(),
            'description_en' => fake()->sentence(),
            'category_es' => fake()->word(),
            'category_en' => fake()->word(),
            'image_id' => Image::factory(),
            'order' => fake()->numberBetween(1, 100),
        ];
    }
}
