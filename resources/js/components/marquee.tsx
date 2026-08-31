import { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';

/**
 * Scrolls its content horizontally, looping seamlessly.
 *
 * Replaces react-fast-marquee, which ships CommonJS only and does not survive the
 * bundler's interop, and needs a lot more JavaScript than a CSS animation.
 */
export default function Marquee({
    children,
    speed = 50,
    delay = 0,
    className = '',
}: Readonly<
    PropsWithChildren<{
        /** Pixels per second. */
        speed?: number;
        /** Seconds to wait before scrolling. */
        delay?: number;
        className?: string;
    }>
>) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [duration, setDuration] = useState(0);

    const measure = useCallback(() => {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        // The track holds the content twice, so a full loop is half of its width.
        setDuration(track.scrollWidth / 2 / Math.max(speed, 1));
    }, [speed]);

    useEffect(() => {
        measure();

        window.addEventListener('resize', measure);

        // The track is often rendered inside a hidden hover overlay, where it measures 0
        // until it is shown. A ResizeObserver picks that moment up, a resize listener does not.
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
        const track = trackRef.current;

        if (observer && track) {
            observer.observe(track);
        }

        return () => {
            window.removeEventListener('resize', measure);
            observer?.disconnect();
        };
    }, [measure, children]);

    return (
        <div className={`overflow-hidden ${className}`}>
            <div
                ref={trackRef}
                className="flex w-max animate-[marquee_linear_infinite] motion-reduce:animate-none"
                style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
            >
                <div className="flex shrink-0">{children}</div>
                <div className="flex shrink-0" aria-hidden>
                    {children}
                </div>
            </div>
        </div>
    );
}
