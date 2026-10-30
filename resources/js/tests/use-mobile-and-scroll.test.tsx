import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useIsMobile } from '../hooks/use-mobile';
import { useScroll } from '../hooks/use-scroll';
import { stubMatchMedia } from './setup';

const resizeTo = (width: number) => Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });

const scrollTo = (y: number) => Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: y });

describe('useIsMobile', () => {
    it('is true below the 768px breakpoint and false from it', () => {
        resizeTo(767);
        expect(renderHook(() => useIsMobile()).result.current).toBe(true);

        resizeTo(768);
        expect(renderHook(() => useIsMobile()).result.current).toBe(false);
    });

    it('follows the viewport when it crosses the breakpoint', () => {
        const { listeners } = stubMatchMedia();
        resizeTo(1024);
        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);

        resizeTo(400);
        act(() => listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent)));

        expect(result.current).toBe(true);
    });

    it('stops listening once unmounted', () => {
        const { listeners } = stubMatchMedia();
        const { unmount } = renderHook(() => useIsMobile());

        expect(listeners.size).toBe(1);

        unmount();

        expect(listeners.size).toBe(0);
    });
});

describe('useScroll', () => {
    const pageHeight = (height: number) => Object.defineProperty(document.body, 'scrollHeight', { configurable: true, value: height });

    it('reports the top of the page until the user scrolls down', () => {
        pageHeight(3000);
        scrollTo(0);
        const { result } = renderHook(() => useScroll());

        expect(result.current).toBe(true);

        scrollTo(250);
        act(() => document.dispatchEvent(new Event('scroll')));

        expect(result.current).toBe(false);

        scrollTo(0);
        act(() => document.dispatchEvent(new Event('scroll')));

        expect(result.current).toBe(true);
    });

    it('treats an overscroll bounce above the page as the top', () => {
        pageHeight(3000);
        scrollTo(-40);

        expect(renderHook(() => useScroll()).result.current).toBe(true);
    });

    it('stops listening once unmounted', () => {
        const removeEventListener = vi.spyOn(document, 'removeEventListener');
        const { unmount } = renderHook(() => useScroll());

        unmount();

        expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
});
