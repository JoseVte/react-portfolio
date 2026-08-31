import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(import.meta.dirname, 'resources/js'),
            'ziggy-js': resolve(import.meta.dirname, 'vendor/tightenco/ziggy'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['resources/js/tests/setup.ts'],
        include: ['resources/js/**/*.test.{ts,tsx}'],
        restoreMocks: true,
    },
});
