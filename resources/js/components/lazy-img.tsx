import { useEffect } from 'react';

export default function LazyImg({
    image,
    preImage,
    alt,
    className = '',
    title = '',
    width = undefined,
    height = undefined,
    forceLoad = false,
}: Readonly<{
    image: string;
    preImage: string;
    alt: string;
    className?: string;
    title?: string;
    width?: number;
    height?: number;
    forceLoad?: boolean;
}>) {
    useEffect(() => {
        const imgDefers = document.getElementsByTagName('img');
        for (const imgDefer of imgDefers) {
            if (imgDefer.getAttribute('data-src')) {
                imgDefer.setAttribute('src', imgDefer.getAttribute('data-src') ?? '');
                imgDefer.setAttribute('lazy', 'loaded');
            }
        }
    });

    return (
        <img
            width={width}
            height={height}
            className={className}
            loading={forceLoad ? 'eager' : 'lazy'}
            data-src={image}
            src={preImage}
            alt={alt}
            title={title}
        />
    );
}
