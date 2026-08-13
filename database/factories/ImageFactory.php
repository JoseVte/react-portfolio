<?php

namespace Database\Factories;

use App\Enums\ImageCategory;
use App\Models\Image;
use Illuminate\Database\Eloquent\Factories\Factory;
use League\Flysystem\Filesystem;
use League\Flysystem\FilesystemException;
use League\Flysystem\Local\LocalFilesystemAdapter;

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
     * @throws FilesystemException
     */
    public function definition(): array
    {
        $adapter = new Filesystem(new LocalFilesystemAdapter(
            storage_path('app/public')
        ));

        /** @var ImageCategory $category */
        $category = $this->faker->randomElement(ImageCategory::cases());

        if (! $adapter->directoryExists($category->value)) {
            $adapter->createDirectory($category->value);
        }

        $filename = $this->faker->slug;
        $imagePath = $category->value.'/'.$filename.'.png';

        $adapter->write($imagePath, 'fake image content');

        return [
            'name' => $this->faker->slug,
            'path' => $imagePath,
            'category' => $category,
            'original_name' => $filename.'.png',
            'mimetype' => 'image/png',
        ];
    }
}
