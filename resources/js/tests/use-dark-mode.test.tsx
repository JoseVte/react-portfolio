import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useIsDarkMode } from '../hooks/use-dark-mode';

describe('useIsDarkMode', () => {
    it('reports the initial state of the document', () => {
        document.documentElement.classList.add('dark');

        const { result } = renderHook(() => useIsDarkMode());

        expect(result.current).toBe(true);
    });

    it('reports light mode when the class is absent', () => {
        const { result } = renderHook(() => useIsDarkMode());

        expect(result.current).toBe(false);
    });

    it('reacts to the class being added', async () => {
        const { result } = renderHook(() => useIsDarkMode());

        act(() => document.documentElement.classList.add('dark'));

        await waitFor(() => expect(result.current).toBe(true));
    });

    it('reacts to the class being removed', async () => {
        document.documentElement.classList.add('dark');

        const { result } = renderHook(() => useIsDarkMode());

        act(() => document.documentElement.classList.remove('dark'));

        await waitFor(() => expect(result.current).toBe(false));
    });

    it('stops observing once unmounted', async () => {
        const { result, unmount } = renderHook(() => useIsDarkMode());

        unmount();
        document.documentElement.classList.add('dark');

        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(result.current).toBe(false);
    });
});
