import '../css/app.css';

import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

import './i18n';

import * as Sentry from '@sentry/react';
Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN_PUBLIC,
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const pages = import.meta.glob('./pages/**/*.tsx') as Record<string, () => Promise<{ default: ResolvedComponent }>>;

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, pages).then((page) => page.default),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
