<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlayroomGameRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description_es' => ['nullable', 'string', 'max:5000'],
            'description_en' => ['nullable', 'string', 'max:5000'],
            'category_es' => ['required', 'string', 'max:255'],
            'category_en' => ['required', 'string', 'max:255'],
            'file' => [$this->isUpdating() ? 'nullable' : 'required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:8192'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Give the game a name.',
            'category_en.required' => 'Fill in the English category.',
            'category_es.required' => 'Fill in the Spanish category.',
            'file.required' => 'Pick an image for this game.',
            'file.max' => 'The image may not be larger than 8 MB.',
        ];
    }

    private function isUpdating(): bool
    {
        return $this->routeIs('playroom.update');
    }
}
