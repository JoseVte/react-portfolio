import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UpdateGameModal from '../components/sections/admin/update-game-modal';
import { form, lastVisit, resetForm, route, stubObjectUrls } from './support/fake-form';

vi.mock('@inertiajs/react', async () => ({ useForm: (await import('./support/fake-form')).useFakeForm }));

const GAME = {
    id: 7,
    name: 'Terraforming Mars',
    description_en: 'Make Mars habitable.',
    description_es: 'Haz Marte habitable.',
    category_en: 'Strategy',
    category_es: 'Estrategia',
    order: 1,
    image_url: '/assets/playroom/terraforming-mars.jpg',
};

const renderModal = () => {
    const callbacks = { onUpdated: vi.fn(), onDeleted: vi.fn(), onCloseModal: vi.fn() };

    render(<UpdateGameModal game={GAME} categoriesEn={['Strategy']} categoriesEs={['Estrategia']} {...callbacks} />);

    return callbacks;
};

const fileInput = () => document.querySelector<HTMLInputElement>('input[type="file"]')!;

beforeEach(() => {
    resetForm();
    vi.stubGlobal('route', route);
});

describe('UpdateGameModal', () => {
    it('starts from the current game', () => {
        renderModal();

        expect(screen.getByDisplayValue(GAME.name)).toBeInTheDocument();
        expect(screen.getByDisplayValue(GAME.description_en)).toBeInTheDocument();
        expect(screen.getByDisplayValue(GAME.description_es)).toBeInTheDocument();
        expect(screen.getByDisplayValue(GAME.category_en)).toBeInTheDocument();
        expect(screen.getByDisplayValue(GAME.category_es)).toBeInTheDocument();
        expect(screen.getByAltText(GAME.name)).toHaveAttribute('src', GAME.image_url);
    });

    it('posts the edited game to its update route and reports back once it is saved', async () => {
        const user = userEvent.setup();
        const { onUpdated } = renderModal();

        const name = screen.getByDisplayValue(GAME.name);
        await user.clear(name);
        await user.type(name, 'Ark Nova');
        fireEvent.change(screen.getByDisplayValue(GAME.description_en), { target: { value: 'Build a zoo.' } });
        fireEvent.change(screen.getByDisplayValue(GAME.description_es), { target: { value: 'Construye un zoo.' } });
        fireEvent.change(screen.getByDisplayValue(GAME.category_en), { target: { value: 'Euro' } });
        fireEvent.change(screen.getByDisplayValue(GAME.category_es), { target: { value: 'Eurogame' } });
        await user.click(screen.getByRole('button', { name: 'Update' }));

        const { url, options } = lastVisit(form.post);

        expect(url).toBe(`/admin/playroom.update/${GAME.id}`);
        expect(form.setData).toHaveBeenCalledWith('name', 'Ark Nova');
        expect(form.setData).toHaveBeenCalledWith('description_en', 'Build a zoo.');
        expect(form.setData).toHaveBeenCalledWith('description_es', 'Construye un zoo.');
        expect(form.setData).toHaveBeenCalledWith('category_en', 'Euro');
        expect(form.setData).toHaveBeenCalledWith('category_es', 'Eurogame');

        options.onSuccess?.();

        expect(onUpdated).toHaveBeenCalledOnce();
    });

    it('shows the replacement image instead of the current one', async () => {
        const user = userEvent.setup();
        stubObjectUrls();
        renderModal();

        await user.upload(fileInput(), new File(['png'], 'new-cover.png', { type: 'image/png' }));

        expect(screen.getByAltText(GAME.name)).toHaveAttribute('src', 'blob:new-cover.png');

        fireEvent.change(fileInput(), { target: { files: [] } });

        expect(screen.getByAltText(GAME.name)).toHaveAttribute('src', GAME.image_url);
    });

    it('deletes the game and reports back once it is gone', async () => {
        const user = userEvent.setup();
        const { onDeleted } = renderModal();

        await user.click(screen.getByRole('button', { name: 'Delete' }));

        const { url, options } = lastVisit(form.destroy);

        expect(url).toBe(`/admin/playroom.destroy/${GAME.id}`);

        options.onSuccess?.();

        expect(onDeleted).toHaveBeenCalledOnce();
    });

    it('says so when the game could not be deleted', async () => {
        const user = userEvent.setup();
        const { onDeleted } = renderModal();

        expect(screen.queryByText('Error deleting game')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Delete' }));
        lastVisit(form.destroy).options.onError?.();

        expect(await screen.findByText('Error deleting game')).toBeInTheDocument();
        expect(onDeleted).not.toHaveBeenCalled();
    });

    it('shows the validation errors the server returned', () => {
        form.errors = { name: 'The name field is required.', category_es: 'The category es field is required.' };

        renderModal();

        expect(screen.getByText('The name field is required.')).toBeInTheDocument();
        expect(screen.getByText('The category es field is required.')).toBeInTheDocument();
    });

    it('closes without saving when cancelled', async () => {
        const user = userEvent.setup();
        const { onCloseModal } = renderModal();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onCloseModal).toHaveBeenCalledOnce();
        expect(form.post).not.toHaveBeenCalled();
        expect(form.destroy).not.toHaveBeenCalled();
    });

    it('stores the suggested category when a known prefix is typed', () => {
        renderModal();
        const categoryEn = screen.getByDisplayValue(GAME.category_en);

        fireEvent.change(categoryEn, { target: { value: '' } });
        fireEvent.change(categoryEn, { target: { value: 'Str' } });

        expect(form.setData).toHaveBeenLastCalledWith('category_en', 'Strategy');
        expect(categoryEn).toHaveValue('Strategy');
    });
});
