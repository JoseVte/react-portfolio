import { HTMLAttributes } from 'react';

export default function Container({ children, className = '', style }: Readonly<HTMLAttributes<HTMLDivElement>>) {
    return (
        <div className={`sm:px-8 ${className}`} style={style}>
            <div className="mx-auto max-w-7xl lg:px-8">
                <div className="relative px-4 sm:px-8 lg:px-12">
                    <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
                </div>
            </div>
        </div>
    );
}
