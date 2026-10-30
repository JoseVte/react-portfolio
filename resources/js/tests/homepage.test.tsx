import { render, screen, waitFor } from '@testing-library/react';
import { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Photos from '../components/sections/photos';
import i18n from '../i18n';
import Homepage from '../pages/homepage';

vi.mock('@/layouts/default-layout', () => ({ default: ({ children }: PropsWithChildren) => <>{children}</> }));
vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

const image = (category: string, index: number) => ({ id: index, path: `${category}/${index}.jpg` });

const PHOTOS: Record<string, ReturnType<typeof image>[]> = {
    '/api/assets.show/cat': [image('cat', 1), image('cat', 2)],
    '/api/assets.show/mountain': [image('mountain', 3)],
    '/api/assets.show/other': [image('other', 4), image('other', 5)],
    '/api/assets.show/travel': [image('travel', 6), image('travel', 7)],
};

const stubPhotos = (photos: Record<string, unknown>) => {
    const fetchMock = vi.fn((url: string) =>
        url in photos ? Promise.resolve(new Response(JSON.stringify(photos[url]))) : new Promise<Response>(() => undefined),
    );
    vi.stubGlobal('fetch', fetchMock);

    return fetchMock;
};

const photoPaths = () => screen.getAllByAltText(/^Photo \d$/).map((img) => img.getAttribute('src'));

/**
 * The sections reveal through react-awesome-reveal, which needs an IntersectionObserver that jsdom lacks.
 */
beforeEach(async () => {
    vi.stubGlobal(
        'IntersectionObserver',
        class {
            observe() {}
            unobserve() {}
            disconnect() {}
        },
    );
    vi.stubGlobal('route', (name: string, param?: string) => (param ? `/api/${name}/${param}` : `/api/${name}`));
    await i18n.changeLanguage('en');
});

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('Photos section', () => {
    it('picks five photos across every category', async () => {
        const fetchMock = stubPhotos(PHOTOS);

        render(<Photos />);

        await waitFor(() => expect(screen.getAllByAltText(/^Photo \d$/)).toHaveLength(5));
        expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(Object.keys(PHOTOS));

        const available = Object.values(PHOTOS)
            .flat()
            .map((photo) => `/assets/${photo.path}`);

        expect(new Set(photoPaths()).size).toBe(5);
        photoPaths().forEach((path) => expect(available).toContain(path));
    });

    it('numbers the photos for screen readers', async () => {
        stubPhotos({ ...PHOTOS, '/api/assets.show/other': [], '/api/assets.show/travel': [] });

        render(<Photos />);

        await waitFor(() => expect(screen.getAllByAltText(/^Photo \d$/)).toHaveLength(3));
        expect(screen.getAllByAltText(/^Photo \d$/).map((img) => img.getAttribute('alt'))).toEqual(['Photo 1', 'Photo 2', 'Photo 3']);
    });

    it('shows no photos when a category fails to load', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn((url: string) =>
                url.endsWith('travel') ? Promise.resolve(new Response('not json', { status: 500 })) : Promise.resolve(new Response('[]')),
            ),
        );

        render(<Photos />);

        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(4));
        expect(screen.queryAllByAltText(/^Photo \d$/)).toHaveLength(0);
    });
});

describe('Homepage', () => {
    it('introduces the author with the translated title and description', () => {
        stubPhotos({});

        render(<Homepage />);

        expect(screen.getByRole('heading', { level: 1, name: i18n.t('layouts.title') })).toBeInTheDocument();
        expect(screen.getByText(`${i18n.t('layouts.description')} ${i18n.t('layouts.description-extended')}`)).toBeInTheDocument();
    });

    it('links every social profile in a new tab', () => {
        stubPhotos({});
        vi.stubEnv('VITE_PUBLIC_TWITTER', 'https://twitter.com/example');
        vi.stubEnv('VITE_PUBLIC_INSTAGRAM', 'https://instagram.com/example');
        vi.stubEnv('VITE_PUBLIC_GITHUB', 'https://github.com/example');
        vi.stubEnv('VITE_PUBLIC_LINKEDIN', 'https://linkedin.com/in/example');

        render(<Homepage />);

        const profiles = {
            Twitter: 'https://twitter.com/example',
            Instagram: 'https://instagram.com/example',
            GitHub: 'https://github.com/example',
            LinkedIn: 'https://linkedin.com/in/example',
        };

        Object.entries(profiles).forEach(([social, url]) => {
            const link = screen.getByRole('link', { name: `Follow on ${social}` });

            expect(link).toHaveAttribute('href', url);
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        });
    });

    it('speaks spanish when the visitor does', async () => {
        stubPhotos({});
        // Without an href the anchor has no link role, and CI has no .env.
        vi.stubEnv('VITE_PUBLIC_GITHUB', 'https://github.com/example');
        await i18n.changeLanguage('es');

        render(<Homepage />);

        expect(screen.getByRole('heading', { level: 1, name: i18n.t('layouts.title') })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Sígueme en GitHub' })).toBeInTheDocument();
    });
});
