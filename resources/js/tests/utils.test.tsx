import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { nl2br } from '../utils';

const html = (value: string | null | undefined) => {
    const { container, unmount } = render(<div>{nl2br(value)}</div>);
    const rendered = (container.firstElementChild as HTMLElement).innerHTML;

    unmount();

    return rendered;
};

describe('nl2br', () => {
    it('leaves a single line untouched', () => {
        expect(html('hello world')).toBe('hello world');
    });

    it('turns a newline into a line break', () => {
        expect(html('first\nsecond')).toBe('first<br>second');
    });

    it('handles windows and classic mac line endings', () => {
        expect(html('a\r\nb')).toBe('a<br>b');
        expect(html('a\rb')).toBe('a<br>b');
    });

    it('keeps consecutive newlines as separate breaks', () => {
        expect(html('a\n\nb')).toBe('a<br><br>b');
    });

    it('is not confused by a second call, so the regex keeps no state', () => {
        expect(html('a\nb')).toBe('a<br>b');
        expect(html('a\nb')).toBe('a<br>b');
        expect(html('a\nb')).toBe('a<br>b');
    });

    it('escapes html instead of rendering it', () => {
        expect(html('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('renders nothing for null and undefined', () => {
        expect(html(null)).toBe('');
        expect(html(undefined)).toBe('');
    });

    it('renders nothing for an empty string', () => {
        expect(html('')).toBe('');
    });
});
