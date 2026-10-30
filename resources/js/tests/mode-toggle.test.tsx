import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import ModeToggle from '../components/mode-toggle';
import i18n from '../i18n';

beforeAll(async () => {
    await i18n.changeLanguage('en');
});

const renderToggle = (appearance: string) => {
    const updateAppearance = vi.fn();

    render(<ModeToggle appearance={appearance} updateAppearance={updateAppearance} />);

    return { updateAppearance, trigger: screen.getByRole('button', { expanded: false }) };
};

/**
 * The icons carry no text, so each one is told apart by the shape it draws.
 */
const iconPath = (element: Element) => element.querySelector('svg')?.innerHTML;

describe('ModeToggle', () => {
    it('shows a different icon for each appearance', () => {
        const icons = ['light', 'dark', 'system'].map((appearance) => {
            const { trigger } = renderToggle(appearance);
            const icon = iconPath(trigger);
            cleanup();

            return icon;
        });

        expect(new Set(icons).size).toBe(3);
    });

    it.each([
        [0, 'light'],
        [1, 'dark'],
        [2, 'system'],
    ] as const)('switches to the option at position %i (%s)', async (index, appearance) => {
        const user = userEvent.setup();
        const { trigger, updateAppearance } = renderToggle('system');

        await user.click(trigger);
        await user.click(screen.getAllByRole('menuitem')[index].querySelector('button')!);

        expect(updateAppearance).toHaveBeenCalledExactlyOnceWith(appearance);
    });

    it('highlights the option that is active', async () => {
        const user = userEvent.setup();
        const { trigger } = renderToggle('dark');

        await user.click(trigger);

        const highlighted = screen.getAllByRole('menuitem').map((item) => item.querySelector('svg')!.classList.contains('stroke-yellow-500'));

        expect(highlighted).toEqual([false, true, false]);
    });

    it('names the trigger for screen readers', () => {
        render(<ModeToggle appearance="system" updateAppearance={vi.fn()} />);

        expect(screen.getByRole('button', { name: 'Change appearance' })).toBeInTheDocument();
    });

    it('names each option for screen readers', async () => {
        const user = userEvent.setup();
        const { trigger } = renderToggle('system');

        await user.click(trigger);

        expect(screen.getAllByRole('menuitem').map((item) => item.textContent || item.querySelector('button')?.getAttribute('aria-label'))).toEqual([
            'Light',
            'Dark',
            'System',
        ]);
        expect(screen.getByRole('button', { name: 'Dark' })).toBeInTheDocument();
    });
});
