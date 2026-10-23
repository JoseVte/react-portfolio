import { fireEvent, render, screen } from '@testing-library/react';
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
});
