import { HTMLAttributes } from 'react';

export default function AvatarContainer({ children, className = '', style }: Readonly<HTMLAttributes<HTMLDivElement>>) {
    return (
        <div
            className={`size-10 rounded-full bg-white/90 p-0.5 shadow-lg ring-1 shadow-zinc-800/5 ring-zinc-900/5 backdrop-blur dark:bg-zinc-800/90 dark:ring-white/10 ${className}`}
            style={style}
        >
            {children}
        </div>
    );
}
