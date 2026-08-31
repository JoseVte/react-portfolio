import { act, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import LazyImg from '../components/lazy-img';
import i18n from '../i18n';

beforeAll(async () => {
    await i18n.changeLanguage('en');
});

const realImage = (alt = 'Cat') => screen.getByAltText(alt) as HTMLImageElement;

describe('LazyImg', () => {
    it('renders the target image lazily by default', () => {
        render(<LazyImg image="/cat.png" preImage="/cat.png" alt="Cat" />);

        expect(realImage()).toHaveAttribute('src', '/cat.png');
        expect(realImage()).toHaveAttribute('loading', 'lazy');
        expect(realImage()).toHaveAttribute('decoding', 'async');
    });

    it('loads eagerly when asked to', () => {
        render(<LazyImg image="/cat.png" preImage="/cat.png" alt="Cat" forceLoad />);

        expect(realImage()).toHaveAttribute('loading', 'eager');
    });

    it('shows a loading placeholder until the image loads', () => {
        render(<LazyImg image="/cat.png" preImage="/cat.png" alt="Cat" />);

        expect(screen.getByText('Loading Cat...')).toBeInTheDocument();

        act(() => realImage().dispatchEvent(new Event('load')));

        expect(screen.queryByText('Loading Cat...')).not.toBeInTheDocument();
    });

    it('reveals the image once it has loaded', () => {
        render(<LazyImg image="/cat.png" preImage="/cat.png" alt="Cat" />);

        expect(realImage()).toHaveStyle({ opacity: '0' });

        act(() => realImage().dispatchEvent(new Event('load')));

        expect(realImage()).toHaveStyle({ opacity: '1' });
    });

    it('renders a distinct preview instead of the text placeholder', () => {
        render(<LazyImg image="/full.png" preImage="/tiny.png" alt="Cat" />);

        expect(document.querySelector('img[aria-hidden="true"]')).toHaveAttribute('src', '/tiny.png');
        expect(screen.queryByText('Loading Cat...')).not.toBeInTheDocument();
    });

    it('drops the preview once the real image is visible', () => {
        render(<LazyImg image="/full.png" preImage="/tiny.png" alt="Cat" />);

        expect(document.querySelector('img[aria-hidden="true"]')).not.toBeNull();

        act(() => realImage().dispatchEvent(new Event('load')));

        // The preview is absolutely positioned, so leaving it mounted would keep it
        // painted on top of the image it is meant to stand in for.
        expect(document.querySelector('img[aria-hidden="true"]')).toBeNull();
        expect(realImage()).toHaveStyle({ opacity: '1' });
    });

    it('does not render a preview when it is the same url as the image', () => {
        render(<LazyImg image="/cat.png" preImage="/cat.png" alt="Cat" />);

        expect(document.querySelector('img[aria-hidden="true"]')).toBeNull();
    });

    it('swaps to the error image when loading fails', () => {
        render(<LazyImg image="/missing.png" preImage="/missing.png" errorImage="/fallback.png" alt="Cat" />);

        act(() => realImage().dispatchEvent(new Event('error')));

        expect(realImage()).toHaveAttribute('src', '/fallback.png');
        expect(screen.queryByText('Error loading image')).not.toBeInTheDocument();
    });

    it('shows an error message when there is no error image', () => {
        render(<LazyImg image="/missing.png" preImage="/missing.png" alt="Cat" />);

        act(() => realImage().dispatchEvent(new Event('error')));

        expect(screen.getByText('Error loading image')).toBeInTheDocument();
    });

    it('resets its state when it is pointed at another image', () => {
        const { rerender } = render(<LazyImg image="/one.png" preImage="/one.png" alt="Cat" />);

        act(() => realImage().dispatchEvent(new Event('load')));
        expect(realImage()).toHaveStyle({ opacity: '1' });

        rerender(<LazyImg image="/two.png" preImage="/two.png" alt="Cat" />);

        expect(realImage()).toHaveAttribute('src', '/two.png');
        expect(realImage()).toHaveStyle({ opacity: '0' });
        expect(screen.getByText('Loading Cat...')).toBeInTheDocument();
    });

    it('renders only the placeholder when there is no source at all', () => {
        render(<LazyImg image={null} preImage={null} alt="Cat" />);

        expect(screen.queryByAltText('Cat')).toBeNull();
        expect(screen.getByText('Loading Cat...')).toBeInTheDocument();
    });

    it('never mutates images outside of its own tree', () => {
        const stranger = document.createElement('img');
        stranger.setAttribute('data-src', '/should-not-be-touched.png');
        document.body.append(stranger);

        render(<LazyImg image="/cat.png" preImage="/cat.png" alt="Cat" />);

        expect(stranger.getAttribute('src')).toBeNull();

        stranger.remove();
    });

    it('forwards sizing, title and class name', () => {
        render(<LazyImg image="/cat.png" preImage="/cat.png" alt="Cat" title="A cat" className="size-8" width={32} height={32} />);

        expect(realImage()).toHaveAttribute('title', 'A cat');
        expect(realImage()).toHaveClass('size-8');
        expect(realImage()).toHaveAttribute('width', '32');
        expect(realImage()).toHaveAttribute('height', '32');
    });
});
