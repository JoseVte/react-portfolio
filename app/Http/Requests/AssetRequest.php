<?php

namespace App\Http\Requests;

use App\Enums\ImageCategory;
use Illuminate\Foundation\Http\FormRequest;

class AssetRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'category' => ['required', 'string', ImageCategory::rule()],
            'file' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:8192'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category.required' => 'Pick a category for this image.',
            'file.required' => 'Pick an image to upload.',
            'file.image' => 'The uploaded file must be an image.',
            'file.max' => 'The image may not be larger than 8 MB.',
        ];
    }
}
