import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DeleteImageModal from '../components/sections/admin/delete-image-modal';
import UploadImageModal from '../components/sections/admin/upload-image-modal';
import { form, lastVisit, resetForm, route, stubObjectUrls } from './support/fake-form';

vi.mock('@inertiajs/react', async () => ({ useForm: (await import('./support/fake-form')).useFakeForm }));

const CATEGORIES = [
    { name: 'Cat', value: 'cat' },
    { name: 'Mountain', value: 'mountain' },
];

const IMAGE = {
    id: 3,
    name: 'abc.jpg',
    category: 'cat',
    original_name: 'kitten.jpg',
    path: 'cat/abc.jpg',
    mimetype: 'image/jpeg',
    url: '/assets/cat/abc.jpg',
    created_at: new Date(),
    updated_at: new Date(),
};

const fileInput = () => document.querySelector<HTMLInputElement>('input[type="file"]')!;

beforeEach(() => {
    resetForm();
    vi.stubGlobal('route', route);
});

describe('UploadImageModal', () => {
    const renderModal = () => {
        const callbacks = { onUploaded: vi.fn(), onCloseModal: vi.fn() };

        render(<UploadImageModal categories={CATEGORIES} {...callbacks} />);

        return callbacks;
    };

    it('offers every category and uploads the picked file to it', async () => {
        const user = userEvent.setup();
        stubObjectUrls();
        const { onUploaded } = renderModal();

        expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Select a category', 'Cat', 'Mountain']);

        await user.selectOptions(screen.getByLabelText('Select image category'), 'mountain');
        await user.upload(fileInput(), new File(['jpg'], 'peak.jpg', { type: 'image/jpeg' }));

        expect(screen.getByAltText('Preview')).toHaveAttribute('src', 'blob:peak.jpg');

        await user.click(screen.getByRole('button', { name: 'Upload' }));

        const { url, options } = lastVisit(form.post);

        expect(url).toBe('/admin/assets.store');
        expect(form.setData).toHaveBeenCalledWith('category', 'mountain');
        expect(form.setData).toHaveBeenCalledWith('file', expect.objectContaining({ name: 'peak.jpg' }));

        options.onSuccess?.();

        expect(onUploaded).toHaveBeenCalledOnce();
    });

    it('highlights the fields the server rejected', () => {
        form.errors = { category: 'The category field is required.', file: 'The file field is required.' };

        renderModal();

        expect(screen.getByText('The category field is required.')).toBeInTheDocument();
        expect(screen.getByText('The file field is required.')).toBeInTheDocument();
        expect(screen.getByText('Select image category')).toHaveClass('text-red-700');
        expect(screen.getByText('File')).toHaveClass('text-red-700');
    });

    it('clears the form when it is cancelled', async () => {
        const user = userEvent.setup();
        const { onCloseModal } = renderModal();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(form.reset).toHaveBeenCalledOnce();
        expect(onCloseModal).toHaveBeenCalledOnce();
        expect(form.post).not.toHaveBeenCalled();
    });
});

describe('DeleteImageModal', () => {
    const renderModal = () => {
        const callbacks = { onDeleted: vi.fn(), onCloseModal: vi.fn() };

        render(<DeleteImageModal image={IMAGE} {...callbacks} />);

        return callbacks;
    };

    it('shows the image it is about to delete', () => {
        renderModal();

        expect(screen.getByText(IMAGE.original_name)).toBeInTheDocument();
        expect(screen.getByAltText(IMAGE.name)).toHaveAttribute('src', IMAGE.url);
    });

    it('deletes the image from its category and reports back once it is gone', async () => {
        const user = userEvent.setup();
        const { onDeleted } = renderModal();

        await user.click(screen.getByRole('button', { name: 'Delete' }));

        const { url, options } = lastVisit(form.destroy);

        expect(url).toBe('/admin/assets.destroy/{"category":"cat","image":3}');

        options.onSuccess?.();

        expect(onDeleted).toHaveBeenCalledOnce();
    });

    it('says so when the image could not be deleted', async () => {
        const user = userEvent.setup();
        const { onDeleted } = renderModal();

        await user.click(screen.getByRole('button', { name: 'Delete' }));
        lastVisit(form.destroy).options.onError?.();

        expect(await screen.findByText('Error deleting image')).toBeInTheDocument();
        expect(onDeleted).not.toHaveBeenCalled();
    });

    it('closes without deleting when cancelled', async () => {
        const user = userEvent.setup();
        const { onCloseModal } = renderModal();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onCloseModal).toHaveBeenCalledOnce();
        expect(form.destroy).not.toHaveBeenCalled();
    });
});
