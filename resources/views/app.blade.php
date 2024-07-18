<!DOCTYPE html>
<html
    class="h-full antialiased"
    lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead

        <script>
            let darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

            updateMode()
            darkModeMediaQuery.addEventListener('change', updateModeWithoutTransitions)
            window.addEventListener('storage', updateModeWithoutTransitions)

            function updateMode() {
                let isSystemDarkMode = darkModeMediaQuery.matches
                let isDarkMode = window.localStorage.isDarkMode === 'true' || (!('isDarkMode' in window.localStorage) && isSystemDarkMode)

                if (isDarkMode) {
                    document.documentElement.classList.add('dark')
                } else {
                    document.documentElement.classList.remove('dark')
                }

                if (isDarkMode === isSystemDarkMode) {
                    delete window.localStorage.isDarkMode
                }
            }

            function disableTransitionsTemporarily() {
                document.documentElement.classList.add('[&_*]:!transition-none')
                window.setTimeout(() => {
                    document.documentElement.classList.remove('[&_*]:!transition-none')
                }, 0)
            }

            function updateModeWithoutTransitions() {
                disableTransitionsTemporarily()
                updateMode()
            }
        </script>
    </head>
    <body class="flex h-full flex-col bg-zinc-50 dark:bg-black">
        @inertia
    </body>
</html>
