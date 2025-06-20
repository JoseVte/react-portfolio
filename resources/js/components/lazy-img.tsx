import { useEffect } from 'react';

export default function LazyImg({
    image,
    preImage,
    alt,
    className = '',
    width = undefined,
    height = undefined,
}: Readonly<{
    image: string;
    preImage: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
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

    return <img width={width} height={height} className={className} loading="lazy" data-src={image} src={preImage} alt={alt} />;
}
