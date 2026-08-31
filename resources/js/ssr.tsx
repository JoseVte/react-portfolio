import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { type Config, route } from 'ziggy-js';
import './i18n';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const pages = import.meta.glob('./pages/**/*.tsx') as Record<string, () => Promise<{ default: ResolvedComponent }>>;

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => `${title} - ${appName}`,
        resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, pages).then((module) => module.default),
        setup: ({ App, props }) => {
            const ziggy = page.props.ziggy as Config & { location: string };

            globalThis.route = ((name?: string, params?: unknown, absolute?: boolean) =>
                route(name as never, params as never, absolute, {
                    ...ziggy,
                    location: new URL(ziggy.location),
                })) as typeof route;

            return <App {...props} />;
        },
    }),
);
