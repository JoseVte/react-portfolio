import { render, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import AppFooter from '../components/app-footer';
import i18n from '../i18n';

const NAV_LINKS = { '/about': 'About', '/projects': 'Projects', '/more': 'More' };

beforeAll(async () => {
    await i18n.changeLanguage('en');
});

describe('AppFooter', () => {
    it('renders one link per navigation entry', () => {
        render(<AppFooter navLinks={NAV_LINKS} />);

        Object.entries(NAV_LINKS).forEach(([href, label]) => {
            expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href);
        });
    });

    it('renders the translated copyright notice', () => {
        render(<AppFooter navLinks={NAV_LINKS} />);

        expect(screen.getByText(/All rights reserved\./)).toBeInTheDocument();
    });

    it('renders the copyright notice in spanish too', async () => {
        await i18n.changeLanguage('es');

        render(<AppFooter navLinks={NAV_LINKS} />);

        expect(screen.getByText(/Todos los derechos reservados\./)).toBeInTheDocument();

        await i18n.changeLanguage('en');
    });

    it('fills in the current year only after hydration, so the markup matches the server', async () => {
        render(<AppFooter navLinks={NAV_LINKS} />);

        await waitFor(() => expect(screen.getByText(new RegExp(`${new Date().getFullYear()}`))).toBeInTheDocument());
    });

    it('renders nothing extra for an empty navigation', () => {
        render(<AppFooter navLinks={{}} />);

        expect(screen.queryAllByRole('link')).toHaveLength(0);
    });
});
