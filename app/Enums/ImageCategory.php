<?php

namespace App\Enums;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

enum ImageCategory: string
{
    case CAT = 'cat';
    case MOUNTAIN = 'mountain';
    case OTHER = 'other';
    case TRAVEL = 'travel';

    public static function rule(): Enum
    {
        return Rule::enum(self::class);
    }
}
