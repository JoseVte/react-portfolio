import React from 'react';

export function DateCalendarUp(props: Readonly<React.SVGProps<SVGSVGElement>>) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="m14 18 4-4 4 4" />
            <path d="M16 2v4" />
            <path d="M18 22v-8" />
            <path d="M21 11.343V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9" />
            <path d="M3 10h18" />
            <path d="M8 2v4" />
        </svg>
    );
}

export function DateCalendarSearch(props: Readonly<React.SVGProps<SVGSVGElement>>) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M16 2v4" />
            <path d="M21 11.75V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7.25" />
            <path d="m22 22-1.875-1.875" />
            <path d="M3 10h18" />
            <path d="M8 2v4" />
            <circle cx="18" cy="18" r="3" />
        </svg>
    );
}
