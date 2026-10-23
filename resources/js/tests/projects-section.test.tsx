import { render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import Projects from '../components/sections/projects';
import i18n from '../i18n';

const PROJECT = {
    name: 'react-portfolio',
    description: 'Personal portfolio',
    html_url: 'https://github.com/JoseVte/react-portfolio',
    updated_at: '2026-10-23T10:00:00Z',
};

const respondWith = (response: Promise<Response>) =>
    vi.stubGlobal(
        'fetch',
        vi.fn(() => response),
    );

beforeAll(async () => {
    await i18n.changeLanguage('en');
});

beforeEach(() => {
    vi.stubGlobal('route', (name: string) => `/api/${name}`);
});

describe('Projects section', () => {
    it('says it is loading while GitHub has not answered', () => {
        respondWith(new Promise(() => undefined));

        render(<Projects />);

        expect(screen.getByRole('status')).toHaveTextContent('Loading projects from GitHub...');
    });

    it('explains the failure and links to GitHub when the request fails', async () => {
        respondWith(Promise.resolve(new Response('', { status: 502 })));

        render(<Projects />);

        expect(await screen.findByText(/GitHub did not respond/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'See them on GitHub' })).toHaveAttribute('target', '_blank');
    });

    it('says there is nothing to show when GitHub returns no projects', async () => {
        respondWith(Promise.resolve(new Response('[]')));

        render(<Projects />);

        expect(await screen.findByText('There are no public projects to show yet.')).toBeInTheDocument();
    });

    it('opens each repository in a new tab instead of an in-app visit', async () => {
        respondWith(Promise.resolve(new Response(JSON.stringify([PROJECT]))));

        render(<Projects />);

        const link = await screen.findByRole('link', { name: PROJECT.name });

        expect(link).toHaveAttribute('href', PROJECT.html_url);
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
});
