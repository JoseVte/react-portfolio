import { render, screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '../i18n';
import About from '../pages/about';

vi.mock('@/layouts/default-layout', () => ({ default: ({ children }: PropsWithChildren) => <>{children}</> }));
vi.mock('@inertiajs/react', () => ({ Head: () => null }));

beforeAll(async () => {
    await i18n.changeLanguage('en');
});

describe('About page', () => {
    it.each(['Twitter', 'Instagram', 'GitHub', 'LinkedIn'])('opens %s in a new tab instead of an in-app visit', (social) => {
        render(<About />);

        const link = screen.getByRole('link', { name: `Follow on ${social}` });

        expect(link.tagName).toBe('A');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('links the email address with mailto', () => {
        render(<About />);

        const link = screen.getByRole('link', { name: import.meta.env.VITE_PUBLIC_EMAIL ?? '' });

        expect(link.getAttribute('href')).toMatch(/^mailto:/);
        expect(link).not.toHaveAttribute('target');
    });
});
