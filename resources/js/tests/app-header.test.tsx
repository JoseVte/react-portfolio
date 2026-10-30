import { fireEvent, render, screen } from '@testing-library/react';
import { AnchorHTMLAttributes } from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import AppHeader from '../components/app-header';
import i18n from '../i18n';

vi.mock('@inertiajs/react', () => ({
    usePage: () => ({ url: '/about' }),
    Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

const NAV_LINKS = { '/about': 'About', '/projects': 'Projects', '/more': 'More' };

const renderHeader = () => render(<AppHeader isHomePage={false} navLinks={NAV_LINKS} appearance="light" updateAppearance={vi.fn()} />);

const openMenu = () => {
    const menuButton = screen.getByRole('button', { name: 'Menu' });
    fireEvent.click(menuButton);

    return menuButton;
};

beforeAll(async () => {
    await i18n.changeLanguage('en');
});

/**
 * The avatar fades in through react-awesome-reveal, which needs an IntersectionObserver that jsdom lacks.
 */
beforeEach(() => {
    vi.stubGlobal(
        'IntersectionObserver',
        class {
            observe() {}
            unobserve() {}
            disconnect() {}
        },
    );
});

describe('AppHeader mobile menu', () => {
    it('opens as a labelled dialog that screen readers can see', () => {
        renderHeader();

        const menuButton = openMenu();

        expect(menuButton).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('dialog', { name: 'Navigation' })).toBeVisible();
    });

    it('moves focus into the dialog when it opens', () => {
        renderHeader();

        openMenu();

        expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    });

    it('closes with Escape and returns focus to the menu button', () => {
        renderHeader();

        const menuButton = openMenu();
        fireEvent.keyDown(document, { key: 'Escape' });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(menuButton).toHaveAttribute('aria-expanded', 'false');
        expect(menuButton).toHaveFocus();
    });

    it('marks the current page in the navigation', () => {
        renderHeader();

        openMenu();

        const currentLinks = screen.getAllByRole('link', { current: 'page' });

        expect(currentLinks.length).toBeGreaterThan(0);
        currentLinks.forEach((link) => expect(link).toHaveAttribute('href', '/about'));
    });

    it('closes from its close button and returns focus to the menu button', () => {
        renderHeader();

        const menuButton = openMenu();
        fireEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(menuButton).toHaveAttribute('aria-expanded', 'false');
        expect(menuButton).toHaveFocus();
    });
});
