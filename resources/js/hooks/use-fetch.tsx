import { useEffect, useState } from 'react';

export type FetchStatus = 'loading' | 'success' | 'error';

/**
 * Fetches JSON once per URL and reports whether it is still loading, arrived, or failed, so
 * every section can show a loading, empty and error state instead of silently rendering nothing.
 */
export function useFetch<T>(url: string): { data: T | undefined; status: FetchStatus } {
    const [data, setData] = useState<T>();
    const [status, setStatus] = useState<FetchStatus>('loading');

    useEffect(() => {
        const controller = new AbortController();

        setStatus('loading');

        fetch(url, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Request to ${url} failed with status ${response.status}`);
                }

                return response.json();
            })
            .then((json: T) => {
                setData(json);
                setStatus('success');
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setStatus('error');
                }
            });

        return () => controller.abort();
    }, [url]);

    return { data, status };
}
