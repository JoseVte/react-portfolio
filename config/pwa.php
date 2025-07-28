<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Would you like the install button to appear on all pages?
      Set true/false
    |--------------------------------------------------------------------------
    */

    'install-button' => false,

    /*
    |--------------------------------------------------------------------------
    | PWA Manifest Configuration
    |--------------------------------------------------------------------------
    |  php artisan erag:pwa-update-manifest
    */

    'manifest' => [
        'name' => env('APP_NAME'),
        'short_name' => 'Josrom',
        'background_color' => '#18181b',
        'display' => 'fullscreen',
        'description' => 'Web developer, Hiker, Cat Lover and Board/Card Game Enjoyer.',
        'theme_color' => '#ffffff',
        'icons' => [
            [
                'src' => 'logo-512x512.jpeg',
                'sizes' => '512x512',
                'type' => 'image/jpeg',
            ],
            [
                'src' => 'logo-128x128.jpeg',
                'sizes' => '128x128',
                'type' => 'image/jpeg',
            ],
            [
                'src' => 'favicon.jpeg',
                'sizes' => '50x50',
                'type' => 'image/jpeg',
            ],
            [
                'src' => 'logo-512x512.webp',
                'sizes' => '512x512',
                'type' => 'image/webp',
            ],
            [
                'src' => 'logo-128x128.webp',
                'sizes' => '128x128',
                'type' => 'image/webp',
            ],
            [
                'src' => 'favicon.webp',
                'sizes' => '50x50',
                'type' => 'image/webp',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Debug Configuration
    |--------------------------------------------------------------------------
    | Toggles the application's debug mode based on the environment variable
    */

    'debug' => env('APP_DEBUG', false),

    /*
    |--------------------------------------------------------------------------
    | Livewire Integration
    |--------------------------------------------------------------------------
    | Set to true if you're using Livewire in your application to enable
    | Livewire-specific PWA optimizations or features.
    */

    'livewire-app' => false,
];
