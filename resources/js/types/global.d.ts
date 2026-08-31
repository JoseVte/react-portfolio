import type { route as routeFn } from 'ziggy-js';

declare global {
    // Assignable on `globalThis` so the SSR entrypoint can bind Ziggy per request.
    var route: typeof routeFn;
}
