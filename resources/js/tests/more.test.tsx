import { fireEvent, render, screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../i18n';
import More from '../pages/more';

vi.mock('@/layouts/default-layout', () => ({ default: ({ children }: PropsWithChildren) => <>{children}</> }));
vi.mock('@inertiajs/react', () => ({ Head: () => null }));

const GAME = {
    id: 1,
    name: 'Terraforming Mars',
    description_en: 'Make Mars habitable.',
    description_es: 'Haz Marte habitable.',
    category_en: 'Strategy',
    category_es: 'Estrategia',
    order: 1,
    image_url: '/assets/playroom/terraforming-mars.jpg',
};

const RECENT_GAME = {
    name: 'Hades',
    steam_url: 'https://store.steampowered.com/app/1145360',
    website: null,
    style: { image: '/hades.jpg', capsule_image: '/hades-small.jpg' },
    time: { '2weeks': 120, total: 600 },
    achievements: { current: 10, total: 49 },
};

/**
 * Answers each API endpoint with its own response, so every section can be put in a different state.
 */
const stubApi = (responses: { steam: () => Promise<Response>; playroom: () => Promise<Response> }) => {
    vi.stubGlobal(
        'fetch',
        vi.fn((url: string) => (url === '/api/steam' ? responses.steam() : responses.playroom())),
    );
};

const json = (body: unknown) => () => Promise.resolve(new Response(JSON.stringify(body)));
const failure = () => Promise.resolve(new Response('', { status: 500 }));
const pending = () => new Promise<Response>(() => undefined);

beforeAll(async () => {
    await i18n.changeLanguage('en');
});

beforeEach(() => {
    vi.stubGlobal('route', (name: string) => `/api/${name}`);
});

describe('More page', () => {
    it('says both collections are loading while the API has not answered', () => {
        stubApi({ steam: pending, playroom: pending });

        render(<More />);

        expect(screen.getByText('Loading the board game collection...')).toBeInTheDocument();
        expect(screen.getByText('Loading Steam games...')).toBeInTheDocument();
    });

    it('explains which collection failed to load', async () => {
        stubApi({ steam: failure, playroom: json([GAME]) });

        render(<More />);

        expect(await screen.findByText(/Steam did not respond/)).toBeInTheDocument();
        expect(screen.queryByText(/board game collection could not be loaded/)).not.toBeInTheDocument();
    });

    it('says so when there are no board games or recent Steam games', async () => {
        stubApi({ steam: json({ recently_games: [], owned_games: [] }), playroom: json([]) });

        render(<More />);

        expect(await screen.findByText('No board games added yet.')).toBeInTheDocument();
        expect(await screen.findByText('No games played in the last two weeks.')).toBeInTheDocument();
        expect(screen.getByText('No games to show.')).toBeInTheDocument();
    });

    it('opens the board game details from a keyboard reachable button', async () => {
        stubApi({ steam: pending, playroom: json([GAME]) });

        render(<More />);

        fireEvent.click(await screen.findByRole('button', { name: GAME.name }));

        expect(await screen.findByText(GAME.description_en)).toBeInTheDocument();
    });

    it('links each recently played game to Steam without needing a hover', async () => {
        stubApi({ steam: json({ recently_games: [RECENT_GAME], owned_games: [] }), playroom: json([]) });

        render(<More />);

        const link = await screen.findByRole('link', { name: RECENT_GAME.name });

        expect(link).toHaveAttribute('href', RECENT_GAME.steam_url);
        expect(link).toHaveAttribute('target', '_blank');
    });
});
