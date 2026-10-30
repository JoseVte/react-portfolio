import { useState } from 'react';
import { Mock, vi } from 'vitest';

type Visit = Mock<(url: string, options?: { onSuccess?: () => void; onError?: () => void; onFinish?: () => void }) => void>;

/**
 * What the admin components hand to Inertia, so a test can assert on it and play the server's answer.
 */
export const form: {
    errors: Record<string, string>;
    post: Visit;
    put: Visit;
    destroy: Visit;
    reset: Mock<() => void>;
    setData: Mock<(keyOrData: unknown, value?: unknown) => void>;
} = {
    errors: {},
    post: vi.fn(),
    put: vi.fn(),
    destroy: vi.fn(),
    reset: vi.fn(),
    setData: vi.fn(),
};

export function resetForm() {
    form.errors = {};
    form.post = vi.fn();
    form.put = vi.fn();
    form.destroy = vi.fn();
    form.reset = vi.fn();
    form.setData = vi.fn();
}

/**
 * A stand-in for Inertia's useForm that keeps the data in React state and records every request.
 */
export function useFakeForm<T extends object>(initial?: T) {
    const [data, setDataState] = useState<T>((initial ?? {}) as T);

    const setData = (keyOrData: keyof T | T, value?: unknown) => {
        form.setData(keyOrData, value);
        setDataState((current) => (typeof keyOrData === 'string' ? { ...current, [keyOrData]: value } : (keyOrData as T)));
    };

    return {
        data,
        setData,
        errors: form.errors,
        post: (...args: Parameters<Visit>) => form.post(...args),
        put: (...args: Parameters<Visit>) => form.put(...args),
        delete: (...args: Parameters<Visit>) => form.destroy(...args),
        reset: () => form.reset(),
    };
}

/**
 * Plays the server's answer to the last request of the given kind.
 */
export function lastVisit(visit: Visit) {
    const call = visit.mock.lastCall;

    if (!call) {
        throw new Error('No request was made');
    }

    return { url: call[0], options: call[1] ?? {} };
}

export function stubObjectUrls() {
    const createObjectURL = vi.fn((file: Blob) => `blob:${(file as File).name}`);
    const revokeObjectURL = vi.fn();

    Object.defineProperty(URL, 'createObjectURL', { configurable: true, writable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, writable: true, value: revokeObjectURL });

    return { createObjectURL, revokeObjectURL };
}

export const route = (name: string, params?: unknown) => (params === undefined ? `/admin/${name}` : `/admin/${name}/${JSON.stringify(params)}`);
