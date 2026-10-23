import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useFetch } from '../hooks/use-fetch';

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('useFetch', () => {
    it('starts loading', () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => new Promise(() => undefined)),
        );

        const { result } = renderHook(() => useFetch('/api/github'));

        expect(result.current).toEqual({ data: undefined, status: 'loading' });
    });

    it('returns the parsed body once the request succeeds', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => jsonResponse([{ name: 'portfolio' }])),
        );

        const { result } = renderHook(() => useFetch<{ name: string }[]>('/api/github'));

        await waitFor(() => expect(result.current.status).toBe('success'));
        expect(result.current.data).toEqual([{ name: 'portfolio' }]);
    });

    it('reports an error when the server answers with a failure status', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => jsonResponse({ message: 'Server Error' }, 500)),
        );

        const { result } = renderHook(() => useFetch('/api/github'));

        await waitFor(() => expect(result.current.status).toBe('error'));
        expect(result.current.data).toBeUndefined();
    });

    it('reports an error when the request never reaches the server', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))),
        );

        const { result } = renderHook(() => useFetch('/api/github'));

        await waitFor(() => expect(result.current.status).toBe('error'));
    });

    it('aborts the request when the component unmounts', () => {
        const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(() => new Promise(() => undefined));
        vi.stubGlobal('fetch', fetchMock);

        const { unmount } = renderHook(() => useFetch('/api/github'));
        unmount();

        expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    });
});
