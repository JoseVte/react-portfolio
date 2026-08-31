<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Install Button
    |--------------------------------------------------------------------------
    | Whether the package renders its own floating "install app" button.
    | The browser's native install prompt is used instead.
    |--------------------------------------------------------------------------
    */

    'install-button' => false,

    /*
    |--------------------------------------------------------------------------
    | PWA Manifest Configuration
    |--------------------------------------------------------------------------
    | Keep this in sync with public/manifest.json, which is the file the browser
    | actually reads. Run `php artisan erag:pwa-update-manifest` to regenerate it.
    |--------------------------------------------------------------------------
    */

    'manifest' => [
        'name' => 'Jose Vicente - Web developer',
        'short_name' => 'Josrom',
        'id' => '/',
        'scope' => '/',
        'background_color' => '#18181b',
        'display' => 'standalone',
        'orientation' => 'any',
        'description' => 'Web developer, Hiker, Cat Lover and Board/Card Game Enjoyer.',
        'theme_color' => '#18181b',
        'icons' => [
            [
                'src' => 'icons/icon-192.png',
                'sizes' => '192x192',
                'type' => 'image/png',
                'purpose' => 'any',
            ],
            [
                'src' => 'icons/icon-512.png',
                'sizes' => '512x512',
                'type' => 'image/png',
                'purpose' => 'any',
            ],
            [
                'src' => 'icons/icon-maskable-512.png',
                'sizes' => '512x512',
                'type' => 'image/png',
                'purpose' => 'maskable',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Debug Configuration
    |--------------------------------------------------------------------------
    | Logs service worker registration results to the browser console.
    |--------------------------------------------------------------------------
    */

    'debug' => env('APP_DEBUG', false),

    /*
    |--------------------------------------------------------------------------
    | Livewire Integration
    |--------------------------------------------------------------------------
    */

    'livewire-app' => false,
];
