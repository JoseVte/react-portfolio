import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomeAssets from '../components/sections/admin/home-assets';
import Playroom from '../components/sections/admin/playroom';
import { PlayroomGame } from '../types';
import { form, lastVisit, resetForm, route } from './support/fake-form';

vi.mock('@inertiajs/react', async () => ({ useForm: (await import('./support/fake-form')).useFakeForm }));

/**
 * Sortable drags cannot be simulated in jsdom, so a button stands in for "drop the last game first".
 */
vi.mock('react-sortablejs', () => ({
    ReactSortable: ({ children, list, setList }: PropsWithChildren<{ list: PlayroomGame[]; setList: (list: PlayroomGame[]) => void }>) => (
        <div>
            {children}
            <button type="button" onClick={() => setList([...list].reverse())}>
                move last game first
            </button>
        </div>
    ),
}));

const image = (id: number, category: string, originalName: string) => ({
    id,
    name: `${id}.jpg`,
    category,
    original_name: originalName,
    path: `${category}/${id}.jpg`,
    mimetype: 'image/jpeg',
    url: `/assets/${category}/${id}.jpg`,
    created_at: new Date(),
    updated_at: new Date(),
});

const game = (id: number, name: string, categoryEn: string, categoryEs: string): PlayroomGame => ({
    id,
    name,
    description_en: `${name} in english`,
    description_es: `${name} en español`,
    category_en: categoryEn,
    category_es: categoryEs,
    order: id,
    image_url: `/assets/playroom/${id}.jpg`,
});

const json = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body)));

/**
 * Answers each endpoint from a table that a test can change between requests.
 */
const stubApi = (responses: Record<string, unknown>) => {
    const fetchMock = vi.fn((url: string) => json(responses[url]));
    vi.stubGlobal('fetch', fetchMock);

    return fetchMock;
};

beforeEach(() => {
    resetForm();
    vi.stubGlobal('route', route);
});

describe('HomeAssets', () => {
    const CATEGORIES = [{ name: 'Cat', value: 'cat' }];

    it('lists the images grouped by category', async () => {
        stubApi({
            '/admin/categories': CATEGORIES,
            '/admin/assets.index': {
                cat: [image(1, 'cat', 'kitten.jpg')],
                travel: [image(2, 'travel', 'rome.jpg'), image(3, 'travel', 'paris.jpg')],
            },
        });

        render(<HomeAssets />);

        const travel = (await screen.findByRole('heading', { name: 'travel' })).parentElement!;

        expect(screen.getByRole('heading', { name: 'cat' })).toBeInTheDocument();
        expect(within(travel).getAllByRole('listitem')).toHaveLength(2);
        expect(within(travel).getByText('paris.jpg')).toBeInTheDocument();
    });

    it('offers the loaded categories when uploading an image', async () => {
        const user = userEvent.setup();
        stubApi({ '/admin/categories': CATEGORIES, '/admin/assets.index': {} });

        render(<HomeAssets />);
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

        await user.click(screen.getByRole('button', { name: 'Upload' }));

        expect(await screen.findByRole('option', { name: 'Cat' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(screen.queryByText('Upload file')).not.toBeInTheDocument();
    });

    it('reloads the list after an upload', async () => {
        const user = userEvent.setup();
        const responses: Record<string, unknown> = { '/admin/categories': CATEGORIES, '/admin/assets.index': {} };
        stubApi(responses);

        render(<HomeAssets />);
        await user.click(screen.getByRole('button', { name: 'Upload' }));
        await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Upload' }));

        responses['/admin/assets.index'] = { cat: [image(9, 'cat', 'new.jpg')] };
        lastVisit(form.post).options.onSuccess?.();

        expect(await screen.findByText('new.jpg')).toBeInTheDocument();
        expect(screen.queryByText('Upload file')).not.toBeInTheDocument();
    });

    it('asks before deleting an image and confirms once it is gone', async () => {
        const user = userEvent.setup();
        const responses: Record<string, unknown> = {
            '/admin/categories': CATEGORIES,
            '/admin/assets.index': { cat: [image(1, 'cat', 'kitten.jpg')] },
        };
        stubApi(responses);

        render(<HomeAssets />);
        await user.click(await screen.findByText('kitten.jpg'));

        expect(screen.getByRole('dialog')).toHaveTextContent('kitten.jpg');

        await user.click(screen.getByRole('button', { name: 'Delete' }));
        responses['/admin/assets.index'] = {};
        lastVisit(form.destroy).options.onSuccess?.();

        expect(await screen.findByText('Deleted "kitten.jpg"')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        await waitFor(() => expect(screen.queryByRole('heading', { name: 'cat' })).not.toBeInTheDocument());
    });

    it('closes the delete prompt without deleting when cancelled', async () => {
        const user = userEvent.setup();
        stubApi({ '/admin/categories': CATEGORIES, '/admin/assets.index': { cat: [image(1, 'cat', 'kitten.jpg')] } });

        render(<HomeAssets />);
        await user.click(await screen.findByText('kitten.jpg'));
        await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }));

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(form.destroy).not.toHaveBeenCalled();
        expect(screen.getByText('kitten.jpg')).toBeInTheDocument();
    });

    it('reloads both lists on demand', async () => {
        const user = userEvent.setup();
        const fetchMock = stubApi({ '/admin/categories': CATEGORIES, '/admin/assets.index': {} });

        render(<HomeAssets />);
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

        await user.click(screen.getByRole('button', { name: 'Refresh' }));

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    });
});

describe('Playroom', () => {
    const GAMES = [game(1, 'Wingspan', 'Strategy', 'Estrategia'), game(2, 'Dixit', 'Party', 'Fiesta'), game(3, 'Azul', 'Strategy', 'Estrategia')];

    it('lists the games in their saved order', async () => {
        stubApi({ '/admin/playroom.index': GAMES });

        render(<Playroom />);

        expect(await screen.findByText('Wingspan')).toBeInTheDocument();
        expect(screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual(['Wingspan', 'Dixit', 'Azul']);
    });

    it('saves the new order and reloads once the server has it', async () => {
        const user = userEvent.setup();
        const fetchMock = stubApi({ '/admin/playroom.index': GAMES });

        render(<Playroom />);
        await screen.findByText('Wingspan');

        await user.click(screen.getByRole('button', { name: 'move last game first' }));

        expect(screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual(['Azul', 'Dixit', 'Wingspan']);
        expect(form.setData).toHaveBeenCalledWith({ id: [3, 2, 1] }, undefined);

        const { url, options } = lastVisit(form.put);
        expect(url).toBe('/admin/playroom.sort');

        options.onFinish?.();

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    });

    it('opens the attach form and closes it again without saving', async () => {
        const user = userEvent.setup();
        stubApi({ '/admin/playroom.index': GAMES });

        render(<Playroom />);
        await screen.findByText('Wingspan');

        await user.click(screen.getByRole('button', { name: 'Upload' }));

        const dialog = await screen.findByRole('dialog');
        expect(within(dialog).getByText('Attach playroom')).toBeInTheDocument();

        await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(form.post).not.toHaveBeenCalled();
    });

    it('closes the attach form and reloads after a game is attached', async () => {
        const user = userEvent.setup();
        const responses: Record<string, unknown> = { '/admin/playroom.index': GAMES };
        stubApi(responses);

        render(<Playroom />);
        await screen.findByText('Wingspan');
        await user.click(screen.getByRole('button', { name: 'Upload' }));
        await user.click(await screen.findByRole('button', { name: 'Attach' }));

        responses['/admin/playroom.index'] = [...GAMES, game(4, 'Catan', 'Strategy', 'Estrategia')];
        lastVisit(form.post).options.onSuccess?.();

        expect(await screen.findByText('Catan')).toBeInTheDocument();
        expect(screen.queryByText('Attach playroom')).not.toBeInTheDocument();
    });

    it('edits a game and confirms once it is saved', async () => {
        const user = userEvent.setup();
        stubApi({ '/admin/playroom.index': GAMES });

        render(<Playroom />);
        await user.click(await screen.findByText('Dixit'));

        expect(screen.getByDisplayValue('Dixit in english')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Update' }));
        expect(lastVisit(form.post).url).toBe('/admin/playroom.update/2');
        lastVisit(form.post).options.onSuccess?.();

        expect(await screen.findByText('Updated "Dixit"')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByDisplayValue('Dixit in english')).not.toBeInTheDocument());
    });

    it('deletes a game and confirms once it is gone', async () => {
        const user = userEvent.setup();
        const responses: Record<string, unknown> = { '/admin/playroom.index': GAMES };
        stubApi(responses);

        render(<Playroom />);
        await user.click(await screen.findByText('Azul'));
        await user.click(screen.getByRole('button', { name: 'Delete' }));

        responses['/admin/playroom.index'] = GAMES.slice(0, 2);
        lastVisit(form.destroy).options.onSuccess?.();

        expect(await screen.findByText('Deleted "Azul"')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByRole('heading', { name: 'Azul' })).not.toBeInTheDocument());
    });

    it('closes the edit form without saving when cancelled', async () => {
        const user = userEvent.setup();
        stubApi({ '/admin/playroom.index': GAMES });

        render(<Playroom />);
        await user.click(await screen.findByText('Wingspan'));
        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(form.post).not.toHaveBeenCalled();
    });
});
