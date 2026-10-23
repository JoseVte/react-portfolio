import { render, screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../i18n';
import About from '../pages/about';

vi.mock('@/layouts/default-layout', () => ({ default: ({ children }: PropsWithChildren) => <>{children}</> }));
vi.mock('@inertiajs/react', () => ({ Head: () => null }));

/**
 * CI has no .env, so the profile addresses are pinned here instead of read from the machine.
 */
const PROFILES = {
    Twitter: ['VITE_PUBLIC_TWITTER', 'https://twitter.com/example'],
    Instagram: ['VITE_PUBLIC_INSTAGRAM', 'https://www.instagram.com/example'],
    GitHub: ['VITE_PUBLIC_GITHUB', 'https://github.com/example'],
    LinkedIn: ['VITE_PUBLIC_LINKEDIN', 'https://www.linkedin.com/in/example'],
} as const;
const EMAIL = 'hello@example.com';

beforeAll(async () => {
    await i18n.changeLanguage('en');
});

beforeEach(() => {
    Object.values(PROFILES).forEach(([key, url]) => vi.stubEnv(key, url));
    vi.stubEnv('VITE_PUBLIC_EMAIL', EMAIL);
});

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('About page', () => {
    it.each(Object.entries(PROFILES))('opens %s in a new tab instead of an in-app visit', (social, [, url]) => {
        render(<About />);

        const link = screen.getByRole('link', { name: `Follow on ${social}` });

        expect(link).toHaveAttribute('href', url);
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('links the email address with mailto', () => {
        render(<About />);

        const link = screen.getByRole('link', { name: EMAIL });

        expect(link).toHaveAttribute('href', `mailto:${EMAIL}`);
        expect(link).not.toHaveAttribute('target');
    });
});
