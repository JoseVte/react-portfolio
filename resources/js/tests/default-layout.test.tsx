import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnchorHTMLAttributes } from 'react';
import ReactGA from 'react-ga4';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../i18n';
import DefaultLayout from '../layouts/default-layout';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
    usePage: () => ({ url: '/about', props: { ziggy: { url: 'https://example.com/about' } } }),
}));

vi.mock('react-ga4', () => ({ default: { initialize: vi.fn() } }));

const renderLayout = () =>
    render(
        <DefaultLayout>
            <p>Page content</p>
        </DefaultLayout>,
    );

/**
 * The header fades in through react-awesome-reveal, which needs an IntersectionObserver that jsdom lacks.
 */
beforeEach(async () => {
    vi.stubGlobal(
        'IntersectionObserver',
        class {
            observe() {}
            unobserve() {}
            disconnect() {}
        },
    );
    vi.mocked(ReactGA.initialize).mockClear();
    await i18n.changeLanguage('en');
});

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('DefaultLayout', () => {
    it('renders the page inside the main landmark, between the header and the footer navigation', () => {
        renderLayout();

        expect(screen.getByRole('main')).toHaveTextContent('Page content');
        expect(screen.getAllByRole('link', { name: 'Projects' }).length).toBeGreaterThan(0);
        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('keeps the document language in sync with the selected locale', async () => {
        renderLayout();

        expect(document.documentElement.lang).toBe('en');

        await act(() => i18n.changeLanguage('es'));

        expect(document.documentElement.lang).toBe('es');
        expect(screen.getAllByRole('link', { name: 'Proyectos' }).length).toBeGreaterThan(0);
    });

    it('switches back to english from the header', async () => {
        const user = userEvent.setup();
        await i18n.changeLanguage('es');
        renderLayout();

        await user.click(screen.getByRole('button', { name: 'en' }));

        expect(i18n.language).toBe('en');
        expect(document.documentElement.lang).toBe('en');
    });

    it('offers spanish to an english visitor', () => {
        renderLayout();

        expect(screen.getByRole('button', { name: 'es' })).toBeInTheDocument();
    });

    it('asks for cookie consent with translated buttons', async () => {
        await i18n.changeLanguage('es');
        renderLayout();

        expect(screen.getByText('Este sitio usa cookies para mejorar la experiencia de usuario.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Aceptar cookies' })).toHaveTextContent('Aceptar');
        expect(screen.getByRole('button', { name: 'Declinar cookies' })).toHaveTextContent('Declinar');
    });

    it('names the consent buttons in the visitor language', async () => {
        await i18n.changeLanguage('es');
        renderLayout();

        expect(screen.getByRole('button', { name: /Aceptar/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Declinar/ })).toBeInTheDocument();
    });

    it('starts Google Analytics once the visitor accepts cookies', async () => {
        const user = userEvent.setup();
        vi.stubEnv('VITE_GOOGLE_ANALYTICS_ID', 'G-TEST');
        renderLayout();

        expect(ReactGA.initialize).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Accept cookies' }));

        expect(ReactGA.initialize).toHaveBeenCalledExactlyOnceWith('G-TEST');
        expect(screen.queryByRole('button', { name: 'Accept cookies' })).not.toBeInTheDocument();
    });

    it('does not start Google Analytics without a measurement id', async () => {
        const user = userEvent.setup();
        vi.stubEnv('VITE_GOOGLE_ANALYTICS_ID', '');
        renderLayout();

        await user.click(screen.getByRole('button', { name: 'Accept cookies' }));

        expect(ReactGA.initialize).not.toHaveBeenCalled();
    });

    it('starts Google Analytics on load when consent was given on an earlier visit', () => {
        vi.stubEnv('VITE_GOOGLE_ANALYTICS_ID', 'G-TEST');
        document.cookie = 'CookieConsent=true;path=/';

        renderLayout();

        expect(ReactGA.initialize).toHaveBeenCalledExactlyOnceWith('G-TEST');
        expect(screen.queryByRole('button', { name: 'Accept cookies' })).not.toBeInTheDocument();
    });

    it('removes the Google Analytics cookies when the visitor declines', async () => {
        const user = userEvent.setup();
        vi.stubEnv('VITE_GOOGLE_ANALYTICS_ID', 'G-TEST');
        document.cookie = '_ga=GA1.1.1;path=/';
        document.cookie = '_gid=GA1.1.2;path=/';
        renderLayout();

        await user.click(screen.getByRole('button', { name: 'Decline cookies' }));

        expect(document.cookie).not.toMatch(/_ga=|_gid=/);
        expect(document.cookie).toContain('CookieConsent=false');
        expect(ReactGA.initialize).not.toHaveBeenCalled();
    });
});
