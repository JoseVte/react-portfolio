import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { initializeTheme, useAppearance } from '../hooks/use-appearance';
import { stubMatchMedia } from './setup';

const isDark = () => document.documentElement.classList.contains('dark');

describe('useAppearance', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('starts from the persisted preference', () => {
        localStorage.setItem('appearance', 'dark');

        const { result } = renderHook(() => useAppearance());

        expect(result.current.appearance).toBe('dark');
        expect(isDark()).toBe(true);
    });

    it('defaults to system when nothing is persisted', () => {
        const { result } = renderHook(() => useAppearance());

        expect(result.current.appearance).toBe('system');
    });

    it('persists an explicit choice in localStorage and a cookie', () => {
        const { result } = renderHook(() => useAppearance());

        act(() => result.current.updateAppearance('dark'));

        expect(result.current.appearance).toBe('dark');
        expect(localStorage.getItem('appearance')).toBe('dark');
        expect(document.cookie).toContain('appearance=dark');
        expect(isDark()).toBe(true);
    });

    it('removes the dark class when switching to light', () => {
        document.documentElement.classList.add('dark');

        const { result } = renderHook(() => useAppearance());

        act(() => result.current.updateAppearance('light'));

        expect(isDark()).toBe(false);
    });

    it('follows the system preference when set to system', () => {
        stubMatchMedia(true);

        const { result } = renderHook(() => useAppearance());

        act(() => result.current.updateAppearance('system'));

        expect(isDark()).toBe(true);
    });

    it('keeps the system theme listener alive after the hook unmounts', () => {
        const { listeners } = stubMatchMedia(false);

        initializeTheme();
        expect(listeners.size).toBe(1);

        const { result, unmount } = renderHook(() => useAppearance());
        act(() => result.current.updateAppearance('system'));
        unmount();

        // A previous version tore this down on every appearance change, which stopped the
        // page from reacting to the OS switching between light and dark.
        expect(listeners.size).toBe(1);
    });
});

describe('initializeTheme', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('applies the persisted preference immediately', () => {
        localStorage.setItem('appearance', 'dark');

        initializeTheme();

        expect(isDark()).toBe(true);
    });

    it('applies the system preference when nothing is persisted', () => {
        stubMatchMedia(true);

        initializeTheme();

        expect(isDark()).toBe(true);
    });

    it('registers a single listener for system theme changes', () => {
        const { listeners } = stubMatchMedia(false);

        initializeTheme();

        expect(listeners.size).toBe(1);
    });

    it('reapplies the theme when the system preference changes', () => {
        const { listeners } = stubMatchMedia(true);

        initializeTheme();
        localStorage.setItem('appearance', 'light');

        act(() => listeners.forEach((listener) => listener({} as MediaQueryListEvent)));

        expect(isDark()).toBe(false);
    });
});
