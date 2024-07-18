<?php

namespace Database\Factories;

use App\Enums\ImageCategory;
use App\Models\Image;
use Illuminate\Database\Eloquent\Factories\Factory;
use League\Flysystem\Adapter\Local;
use League\Flysystem\Filesystem;

class ImageFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Image::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $adapter = new Filesystem(new Local(
            base_path('public/images')
        ));

        /** @var ImageCategory $category */
        $category = $this->faker->randomElement(ImageCategory::cases());
        $file = $this->faker->image();
        $filename = $this->faker->slug;
        $adapter->put($category->value.'/'.$filename.'.png', file_get_contents($file));

        return [
            'name' => $this->faker->slug,
            'path' => $category->value.'/'.$filename.'.png',
            'category' => $category,
            'original_name' => $filename.'.png',
            'mimetype' => 'image/png',
        ];
    }
}
