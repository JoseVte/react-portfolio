<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlayroomGameRequest extends FormRequest
{
    public function rules(): array
    {
        $imageRequired = $this->routeIs('playroom.update') ? 'sometimes' : 'required';

        return [
            'name' => ['required'],
            'description_es' => ['sometimes'],
            'description_en' => ['sometimes'],
            'category_es' => ['required'],
            'category_en' => ['required'],
            'file' => [$imageRequired, 'image'],
        ];
    }
}
