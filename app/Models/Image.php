<?php

namespace App\Models;

use App\Enums\ImageCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'original_name',
        'path',
        'mimetype',
    ];

    protected $appends = [
        'url',
    ];

    protected $casts = [
        'category' => ImageCategory::class,
    ];

    public function getUrlAttribute()
    {
        return app('url')->asset('images/'.$this->path);
    }
}
