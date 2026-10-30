import { render, screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../i18n';
import Admin from '../pages/admin';
import { resetForm, route } from './support/fake-form';

vi.mock('@/layouts/default-layout', () => ({ default: ({ children }: PropsWithChildren) => <>{children}</> }));
vi.mock('@inertiajs/react', async () => ({ Head: () => null, useForm: (await import('./support/fake-form')).useFakeForm }));

beforeEach(() => {
    resetForm();
    vi.stubGlobal('route', route);
    vi.stubGlobal(
        'fetch',
        vi.fn(() => new Promise<Response>(() => undefined)),
    );
});

describe('Admin page', () => {
    it('titles the page and loads both admin sections', async () => {
        await i18n.changeLanguage('en');

        render(<Admin />);

        expect(screen.getByRole('heading', { level: 1, name: 'Admin - Jose Vicente' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Assets' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Playroom' })).toBeInTheDocument();
        expect(fetch).toHaveBeenCalledWith('/admin/categories');
        expect(fetch).toHaveBeenCalledWith('/admin/assets.index');
        expect(fetch).toHaveBeenCalledWith('/admin/playroom.index');
    });
});
