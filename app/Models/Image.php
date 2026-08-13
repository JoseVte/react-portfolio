<?php

namespace App\Models;

use App\Enums\ImageCategory;
use App\Observers\ImageObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy([ImageObserver::class])]
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

    public function getUrlAttribute(): string
    {
        return app('url')->asset('images/'.$this->path);
    }
}
