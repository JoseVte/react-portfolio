import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AttachGameModal from '../components/sections/admin/attach-game-modal';
import { form, lastVisit, resetForm, route, stubObjectUrls } from './support/fake-form';

vi.mock('@inertiajs/react', async () => ({ useForm: (await import('./support/fake-form')).useFakeForm }));

const renderModal = () => {
    const onUploaded = vi.fn();
    const onCloseModal = vi.fn();

    render(
        <AttachGameModal
            categoriesEn={['Strategy', 'Party']}
            categoriesEs={['Estrategia', 'Fiesta']}
            onUploaded={onUploaded}
            onCloseModal={onCloseModal}
        />,
    );

    return { onUploaded, onCloseModal };
};

const fileInput = () => document.querySelector<HTMLInputElement>('input[type="file"]')!;

beforeEach(() => {
    resetForm();
    vi.stubGlobal('route', route);
});

describe('AttachGameModal', () => {
    it('sends every field to the store route and reports back once it is saved', async () => {
        const user = userEvent.setup();
        const { onUploaded } = renderModal();
        const [categoryEn, categoryEs] = screen.getAllByRole('textbox').filter((input) => !input.id);

        await user.type(screen.getByLabelText('Name'), 'Wingspan');
        await user.type(screen.getByLabelText('Description (EN)'), 'Birds');
        await user.type(screen.getByLabelText('Description (ES)'), 'Pájaros');
        fireEvent.change(categoryEn, { target: { value: 'Family' } });
        fireEvent.change(categoryEs, { target: { value: 'Familia' } });
        await user.upload(fileInput(), new File(['png'], 'wingspan.png', { type: 'image/png' }));
        await user.click(screen.getByRole('button', { name: 'Attach' }));

        const { url, options } = lastVisit(form.post);

        expect(url).toBe('/admin/playroom.store');
        expect(form.setData).toHaveBeenCalledWith('name', 'Wingspan');
        expect(form.setData).toHaveBeenCalledWith('description_es', 'Pájaros');
        expect(form.setData).toHaveBeenCalledWith('category_en', 'Family');
        expect(form.setData).toHaveBeenCalledWith('category_es', 'Familia');
        expect(form.setData).toHaveBeenCalledWith('file', expect.objectContaining({ name: 'wingspan.png' }));
        expect(onUploaded).not.toHaveBeenCalled();

        options.onSuccess?.();

        expect(onUploaded).toHaveBeenCalledOnce();
    });

    it('previews the picked image and releases the previous preview when it changes', async () => {
        const user = userEvent.setup();
        const { revokeObjectURL } = stubObjectUrls();
        renderModal();

        expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();

        await user.upload(fileInput(), new File(['a'], 'first.png', { type: 'image/png' }));

        expect(screen.getByAltText('Preview')).toHaveAttribute('src', 'blob:first.png');

        await user.upload(fileInput(), new File(['b'], 'second.png', { type: 'image/png' }));

        expect(screen.getByAltText('Preview')).toHaveAttribute('src', 'blob:second.png');
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:first.png');
    });

    it('drops the preview when the picked file is cleared', () => {
        stubObjectUrls();
        renderModal();

        fireEvent.change(fileInput(), { target: { files: [new File(['a'], 'first.png', { type: 'image/png' })] } });
        expect(screen.getByAltText('Preview')).toBeInTheDocument();

        fireEvent.change(fileInput(), { target: { files: [] } });

        expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
        expect(form.setData).toHaveBeenLastCalledWith('file', undefined);
    });

    it('shows the validation errors the server returned', () => {
        form.errors = { name: 'The name field is required.', file: 'The file must be an image.' };

        renderModal();

        expect(screen.getByText('The name field is required.')).toBeInTheDocument();
        expect(screen.getByText('The file must be an image.')).toBeInTheDocument();
        expect(screen.getByText('Name')).toHaveClass('text-red-700');
        expect(screen.getByText('Description (EN)')).not.toHaveClass('text-red-700');
    });

    it('clears the form when it is cancelled', async () => {
        const user = userEvent.setup();
        const { onCloseModal } = renderModal();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(form.reset).toHaveBeenCalledOnce();
        expect(onCloseModal).toHaveBeenCalledOnce();
        expect(form.post).not.toHaveBeenCalled();
    });

    it('stores the suggested category when a known prefix is typed', () => {
        renderModal();
        const [categoryEn] = screen.getAllByRole('textbox').filter((input) => !input.id);

        fireEvent.change(categoryEn, { target: { value: 'Str' } });

        expect(form.setData).toHaveBeenLastCalledWith('category_en', 'Strategy');
        expect(categoryEn).toHaveValue('Strategy');
    });
});
