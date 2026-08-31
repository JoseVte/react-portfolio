import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const APPEARANCE_STORAGE_KEY = 'appearance';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const storedAppearance = (): Appearance => {
    if (typeof localStorage === 'undefined') {
        return 'system';
    }

    return (localStorage.getItem(APPEARANCE_STORAGE_KEY) as Appearance | null) ?? 'system';
};

const handleSystemThemeChange = () => applyTheme(storedAppearance());

export function initializeTheme() {
    applyTheme(storedAppearance());

    // Add the event listener for system theme changes...
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('system');

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);

        // Store in localStorage for client-side persistence...
        localStorage.setItem(APPEARANCE_STORAGE_KEY, mode);

        // Store in cookie for SSR...
        setCookie(APPEARANCE_STORAGE_KEY, mode);

        applyTheme(mode);
    }, []);

    // Adopt the persisted preference once on mount. The system theme listener is owned by
    // `initializeTheme`, so it must not be torn down when this hook unmounts.
    useEffect(() => {
        const persisted = storedAppearance();

        setAppearance(persisted);
        applyTheme(persisted);
    }, []);

    return { appearance, updateAppearance } as const;
}
