<?php

namespace App\Http\Requests;

use App\Enums\ImageCategory;
use Illuminate\Foundation\Http\FormRequest;

class AssetRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'category' => ['required', 'string', ImageCategory::rule()],
            'file' => ['required', 'image'],
        ];
    }
}
