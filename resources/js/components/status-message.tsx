import { PropsWithChildren } from 'react';

/**
 * Explains why a data section shows nothing yet: it is loading, it is empty, or it failed.
 */
export default function StatusMessage({ children, className = '' }: Readonly<PropsWithChildren<{ className?: string }>>) {
    return (
        <p role="status" className={`text-sm text-zinc-600 dark:text-zinc-400 ${className}`}>
            {children}
        </p>
    );
}
