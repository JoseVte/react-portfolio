import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Marquee from '../components/marquee';

const track = () => document.querySelector('[style*="animation-duration"]') as HTMLElement;

describe('Marquee', () => {
    it('renders its children', () => {
        render(<Marquee>Portal 2</Marquee>);

        expect(screen.getAllByText('Portal 2')).toHaveLength(2);
    });

    it('duplicates the content so the loop is seamless, hiding the copy from screen readers', () => {
        render(<Marquee>Portal 2</Marquee>);

        expect(document.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
    });

    it('honours the configured delay', () => {
        render(<Marquee delay={5}>Portal 2</Marquee>);

        expect(track().style.animationDelay).toBe('5s');
    });

    it('derives the duration from the measured width and the speed', () => {
        render(<Marquee speed={50}>Portal 2</Marquee>);

        // jsdom reports a zero width, so the animation stays disabled rather than dividing by it.
        expect(track().style.animationDuration).toBe('0s');
    });

    it('opts out of the animation when the user prefers reduced motion', () => {
        render(<Marquee>Portal 2</Marquee>);

        expect(track().className).toContain('motion-reduce:animate-none');
    });

    it('clips the overflowing content', () => {
        const { container } = render(<Marquee className="w-10">Portal 2</Marquee>);

        expect(container.firstElementChild?.className).toContain('overflow-hidden');
        expect(container.firstElementChild?.className).toContain('w-10');
    });

    it('measures again when the track is resized, so a marquee revealed on hover starts moving', () => {
        const observers: Array<() => void> = [];
        const disconnect = vi.fn();
        vi.stubGlobal(
            'ResizeObserver',
            class {
                constructor(callback: () => void) {
                    observers.push(callback);
                }
                observe() {}
                disconnect = disconnect;
            },
        );
        let width = 0;
        vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(() => width);

        const { unmount } = render(<Marquee speed={50}>Portal 2</Marquee>);

        expect(track().style.animationDuration).toBe('0s');

        width = 400;
        act(() => observers.forEach((callback) => callback()));

        // The track holds the content twice, so one loop covers half of the 400px at 50px per second.
        expect(track().style.animationDuration).toBe('4s');

        width = 1000;
        act(() => window.dispatchEvent(new Event('resize')));

        expect(track().style.animationDuration).toBe('10s');

        unmount();

        expect(disconnect).toHaveBeenCalled();
    });

    it('never divides by a speed below one', () => {
        vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(100);

        render(<Marquee speed={0}>Portal 2</Marquee>);

        expect(track().style.animationDuration).toBe('50s');
    });
});
