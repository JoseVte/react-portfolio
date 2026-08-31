import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

/**
 * Node defines its own `localStorage` global that resolves to undefined unless the process
 * is started with `--localstorage-file`. That shadows the jsdom implementation, so install
 * a plain in-memory Storage instead.
 */
function installLocalStorage() {
    const entries = new Map<string, string>();

    const storage: Storage = {
        get length() {
            return entries.size;
        },
        clear: () => entries.clear(),
        getItem: (key) => entries.get(key) ?? null,
        key: (index) => [...entries.keys()][index] ?? null,
        removeItem: (key) => void entries.delete(key),
        setItem: (key, value) => void entries.set(key, String(value)),
    };

    Object.defineProperty(window, 'localStorage', { writable: true, configurable: true, value: storage });
    Object.defineProperty(globalThis, 'localStorage', { writable: true, configurable: true, value: storage });
}

/**
 * jsdom has no matchMedia, which `use-appearance` relies on to read the system theme.
 */
export function stubMatchMedia(matches = false) {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();

    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches,
            media: query,
            onchange: null,
            addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
            removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });

    return { listeners };
}

beforeEach(() => {
    installLocalStorage();
    stubMatchMedia();
    document.documentElement.className = '';
    document.cookie.split(';').forEach((cookie) => {
        const name = cookie.split('=')[0].trim();

        if (name) {
            document.cookie = `${name}=;path=/;max-age=0`;
        }
    });
});

afterEach(() => {
    cleanup();
});
