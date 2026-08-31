import { useEffect, useState } from 'react';

/**
 * Tracks the `dark` class that `use-appearance` toggles on the document element.
 */
export function useIsDarkMode() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const sync = () => setIsDark(document.documentElement.classList.contains('dark'));

        sync();

        const observer = new MutationObserver(sync);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isDark;
}
