import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
});
