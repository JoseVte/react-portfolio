import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../i18n';
import Projects from '../pages/projects';

vi.mock('@/layouts/default-layout', () => ({ default: ({ children }: PropsWithChildren) => <>{children}</> }));
vi.mock('@inertiajs/react', () => ({ Head: () => null }));
vi.mock('react-github-calendar', () => ({ default: () => null }));

/**
 * Replaces the scroll listener with a button, so a test can ask for the next page directly.
 */
vi.mock('react-infinite-scroll-component', () => ({
    default: ({ children, next, hasMore }: PropsWithChildren<{ next: () => void; hasMore: boolean }>) => (
        <div>
            {children}
            {hasMore && <button onClick={next}>next page</button>}
        </div>
    ),
}));

const PROJECT = {
    name: 'react-portfolio',
    description: 'Personal portfolio',
    html_url: 'https://github.com/JoseVte/react-portfolio',
    homepage: null,
    language: 'TypeScript',
    stargazers_count: 2,
    forks_count: 1,
    open_issues_count: 0,
    updated_at: '2026-10-23T10:00:00Z',
    owner: { login: 'JoseVte', avatar_url: '/avatar.png' },
};

const json = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body)));
const failure = () => Promise.resolve(new Response('', { status: 500 }));

/**
 * CI has no .env, so the profile address is pinned here instead of read from the machine.
 */
const GITHUB_PROFILE = 'https://github.com/example';

beforeAll(async () => {
    await i18n.changeLanguage('en');
});

beforeEach(() => {
    vi.stubEnv('VITE_PUBLIC_GITHUB', GITHUB_PROFILE);
    vi.stubGlobal('route', (name: string, params: Record<string, string> = {}) => `/api/${name}?page=${params.page ?? 1}`);
});

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('Projects page', () => {
    it('explains the failure and links to GitHub when the first page fails', async () => {
        vi.stubGlobal('fetch', vi.fn(failure));

        render(<Projects />);

        expect(await screen.findByText(/GitHub did not respond/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'See them on GitHub' })).toHaveAttribute('href', GITHUB_PROFILE);
    });

    it('says there is nothing to show when GitHub returns no projects', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => json([])),
        );

        render(<Projects />);

        expect(await screen.findByText('There are no public projects to show yet.')).toBeInTheDocument();
    });

    it('stops loading and offers a retry when the next page fails, then loads it on retry', async () => {
        const fetchMock = vi
            .fn()
            .mockImplementationOnce(() => json([PROJECT]))
            .mockImplementationOnce(failure)
            .mockImplementationOnce(() => json([{ ...PROJECT, name: 'laravel-logger' }]));
        vi.stubGlobal('fetch', fetchMock);

        render(<Projects />);

        fireEvent.click(await screen.findByRole('button', { name: 'next page' }));

        expect(await screen.findByText(/The next projects could not be loaded/)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'next page' })).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

        expect(await screen.findByRole('link', { name: 'laravel-logger' })).toBeInTheDocument();
        expect(fetchMock).toHaveBeenLastCalledWith('/api/github?page=2');
    });

    it('names the repository counters for screen readers', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => json([PROJECT])),
        );

        render(<Projects />);

        expect(await screen.findByRole('link', { name: '2 stars on GitHub' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '1 fork on GitHub' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '0 open issues on GitHub' })).toBeInTheDocument();
    });

    it.each([
        ['Blade', null],
        ['Dockerfile', 'docker/docker-original.svg'],
        ['HTML', 'html5/html5-original.svg'],
        ['Vue', 'vuejs/vuejs-original.svg'],
        ['Shell', 'bash/bash-original.svg'],
        ['PHP', 'php/php-original.svg'],
    ])('shows the %s language icon', async (language, icon) => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => json([{ ...PROJECT, language }])),
        );

        render(<Projects />);

        await screen.findByRole('link', { name: PROJECT.name });

        if (icon === null) {
            // Blade ships its own inline icon instead of a devicon image.
            expect(screen.queryByAltText(language)).not.toBeInTheDocument();
            expect(screen.queryByAltText('Repository')).not.toBeInTheDocument();
        } else {
            expect(screen.getByAltText(language)).toHaveAttribute('src', expect.stringContaining(icon));
        }
    });

    it('falls back to a generic repository icon when GitHub detected no language', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => json([{ ...PROJECT, language: null }])),
        );

        render(<Projects />);

        expect(await screen.findByAltText('Repository')).toHaveAttribute('src', expect.stringContaining('git/git-original.svg'));
    });

    it('links the project homepage only when it has one', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => json([PROJECT, { ...PROJECT, name: 'recetarium', homepage: 'https://recetarium.io' }])),
        );

        render(<Projects />);

        const homepage = await screen.findByRole('link', { name: 'https://recetarium.io' });

        expect(homepage).toHaveAttribute('href', 'https://recetarium.io');
        expect(homepage).toHaveAttribute('target', '_blank');
        expect(screen.getAllByRole('link', { name: 'https://recetarium.io' })).toHaveLength(1);
    });

    it('formats the last update in the visitor language', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => json([PROJECT])),
        );
        await i18n.changeLanguage('es');

        try {
            render(<Projects />);

            const updated = await screen.findByText(/octubre de 2026/);

            expect(updated).toHaveAttribute('dateTime', PROJECT.updated_at);
            expect(updated).toHaveTextContent('23 de octubre de 2026');
        } finally {
            await i18n.changeLanguage('en');
        }
    });

    it('keeps the query string of the current page when asking GitHub', async () => {
        const fetchMock = vi.fn(() => json([PROJECT]));
        vi.stubGlobal('fetch', fetchMock);
        vi.stubGlobal('route', (name: string, params: Record<string, string> = {}) => `/api/${name}?${new URLSearchParams(params)}`);
        window.history.replaceState({}, '', '/projects?sort=stars');

        try {
            render(<Projects />);
            fireEvent.click(await screen.findByRole('button', { name: 'next page' }));

            expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/github?sort=stars', expect.anything());
            await waitFor(() => expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/github?sort=stars&page=2'));
        } finally {
            window.history.replaceState({}, '', '/');
        }
    });

    it('stops asking for more once GitHub returns an empty page', async () => {
        const fetchMock = vi
            .fn()
            .mockImplementationOnce(() => json([PROJECT]))
            .mockImplementationOnce(() => json([]));
        vi.stubGlobal('fetch', fetchMock);

        render(<Projects />);

        fireEvent.click(await screen.findByRole('button', { name: 'next page' }));

        await waitFor(() => expect(screen.queryByRole('button', { name: 'next page' })).not.toBeInTheDocument());
        expect(screen.queryByText(/The next projects could not be loaded/)).not.toBeInTheDocument();
    });

    it('lets the visitor pick the contribution year', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => new Promise<Response>(() => undefined)),
        );

        render(<Projects />);

        const year = screen.getByRole('combobox');
        const currentYear = `${new Date().getFullYear()}`;

        expect(year).toHaveValue(currentYear);
        expect(screen.getByRole('option', { name: '2013' })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: '2012' })).not.toBeInTheDocument();

        fireEvent.change(year, { target: { value: '2020' } });

        expect(year).toHaveValue('2020');
    });
});
