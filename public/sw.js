'use strict';

/**
 * Bump this whenever the precached shell below changes so old caches are dropped.
 */
const VERSION = 'v2';

const SHELL_CACHE = `shell-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;
const OWNED_CACHES = [SHELL_CACHE, ASSET_CACHE];

const OFFLINE_URL = '/offline.html';

const SHELL_URLS = [OFFLINE_URL, '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

/**
 * Vite writes content hashed filenames under /build, so those responses never change.
 */
const isImmutableAsset = (url) => url.pathname.startsWith('/build/');

const isPrecachedIcon = (url) => url.pathname.startsWith('/icons/');

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(SHELL_CACHE)
            .then((cache) => cache.addAll(SHELL_URLS))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((names) => Promise.all(names.filter((name) => !OWNED_CACHES.includes(name)).map((name) => caches.delete(name))))
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

/**
 * Serve from cache, then refresh the entry in the background.
 */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const network = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
            }

            return response;
        })
        .catch(() => cached);

    return cached ?? network;
}

/**
 * Always hit the network for pages so content is never stale, and fall back to the
 * offline page when the request cannot be made at all.
 */
async function networkFirstWithOfflineFallback(request) {
    try {
        return await fetch(request);
    } catch {
        const cache = await caches.open(SHELL_CACHE);

        return (await cache.match(OFFLINE_URL)) ?? Response.error();
    }
}

self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Never interfere with writes, range requests or other origins.
    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(networkFirstWithOfflineFallback(request));

        return;
    }

    if (isImmutableAsset(url) || isPrecachedIcon(url)) {
        event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
    }

    // Everything else (Inertia visits, API calls, remote images) goes straight to the network.
});
