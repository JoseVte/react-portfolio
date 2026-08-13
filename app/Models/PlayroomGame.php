<?php

namespace App\Models;

use App\Observers\PlayroomGameObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\EloquentSortable\Sortable;
use Spatie\EloquentSortable\SortableTrait;

#[ObservedBy([PlayroomGameObserver::class])]
class PlayroomGame extends Model implements Sortable
{
    use HasFactory, SortableTrait;

    protected $fillable = [
        'name',
        'description_es',
        'description_en',
        'category_es',
        'category_en',
        'image_id',
        'order',
    ];

    public $sortable = [
        'order_column_name' => 'order',
        'sort_when_creating' => true,
    ];

    protected $with = ['image'];

    protected $appends = ['image_url'];

    protected $hidden = [
        'image',
        'image_id',
    ];

    public function image(): BelongsTo
    {
        return $this->belongsTo(Image::class);
    }

    public function getImageUrlAttribute(): string
    {
        return route('assets', $this->image->path);
    }
}
