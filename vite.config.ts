import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    build: {
        // Sourcemaps stay public on purpose: Sentry fetches them to symbolicate frontend errors.
        sourcemap: true,
        minify: true,
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(import.meta.dirname, 'vendor/tightenco/ziggy'),
        },
    },
    ssr: {
        noExternal: ['@inertiajs/server', 'lodash'],
    },
});
