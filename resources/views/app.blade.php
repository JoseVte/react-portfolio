<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') === 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Manifest, apple-touch-icon and theme-color for the PWA --}}
        @PwaHead

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title data-inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="{{ asset('favicon.ico') }}" sizes="32x32">
        <link rel="icon" href="{{ asset('icons/icon-192.png') }}" sizes="192x192" type="image/png">
        <link rel="icon" href="{{ asset('favicon.webp') }}" sizes="50x50" type="image/webp">
        <link rel="apple-touch-icon" href="{{ asset('icons/apple-touch-icon-180.png') }}" sizes="180x180">

        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet">

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-zinc-50 dark:bg-black">
        @inertia
        @RegisterServiceWorkerScript
    </body>
</html>
