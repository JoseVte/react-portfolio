import {useEffect} from "react";

export default function LazyImg({image, preImage, alt, className = ''}: Readonly<{
    image: string,
    preImage: string,
    alt: string,
    className?: string
}>) {
    useEffect(() => {
        const imgDefers = document.getElementsByTagName('img');
        for (let imgDefer of imgDefers) {
            if (imgDefer.getAttribute('data-src')) {
                imgDefer.setAttribute('src', imgDefer.getAttribute('data-src') ?? '');
                imgDefer.setAttribute('lazy', 'loaded');
            }
        }
    })

    return (
        <img
            className={className}
            loading="lazy"
            data-src={image}
            src={preImage}
            alt={alt}
        />
    )
}
