import { HTMLAttributes } from 'react';
import { useParallax } from 'react-scroll-parallax';

export default function ImgParallax({ children }: Readonly<HTMLAttributes<HTMLDivElement>>) {
    const parallax = useParallax<HTMLDivElement>({
        translateY: [-100, 60],
    });

    return <div ref={parallax.ref}>{children}</div>;
}
