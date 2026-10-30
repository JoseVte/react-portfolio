import { render, screen, within } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import resumeEn from '../../assets/resume/en.json';
import resumeEs from '../../assets/resume/es.json';
import Work from '../components/sections/work';
import i18n from '../i18n';

beforeAll(async () => {
    await i18n.changeLanguage('en');
});

describe('Work section', () => {
    it('opens every company page in a new tab instead of an in-app visit', () => {
        render(<Work />);

        const links = screen.getAllByRole('link');

        expect(links).toHaveLength(resumeEn.work.length);
        links.forEach((link, index) => {
            expect(link).toHaveAttribute('href', resumeEn.work[index].url);
            expect(link).toHaveAttribute('target', '_blank');
        });
    });

    it('writes date ranges with words instead of an em dash', () => {
        render(<Work />);

        screen.getAllByRole('listitem').forEach((item, index) => {
            const role = resumeEn.work[index];

            expect(within(item).getByText(role.position)).toBeInTheDocument();
            expect(item).toHaveTextContent(`${role.startDate} to ${role.endDate || 'Present'}`);
        });
        expect(document.body.textContent).not.toContain('—');
    });

    it('says Present for a role that has not ended', async () => {
        vi.resetModules();
        vi.doMock('../../assets/resume/en.json', () => ({
            default: { work: [{ ...resumeEn.work[0], endDate: '' }] },
        }));

        try {
            const { default: WorkWithCurrentRole } = await import('../components/sections/work');

            render(<WorkWithCurrentRole />);

            expect(screen.getByRole('listitem')).toHaveTextContent(`${resumeEn.work[0].startDate} to Present`);
        } finally {
            vi.doUnmock('../../assets/resume/en.json');
            vi.resetModules();
        }
    });

    it('reads the spanish resume when the visitor speaks spanish', async () => {
        await i18n.changeLanguage('es');

        try {
            render(<Work />);

            const [current] = screen.getAllByRole('listitem');

            expect(screen.getAllByRole('listitem')).toHaveLength(resumeEs.work.length);
            expect(within(current).getByRole('link')).toHaveAttribute('href', resumeEs.work[0].url);
            expect(within(current).getByText(resumeEs.work[0].position)).toBeInTheDocument();
            expect(current).toHaveTextContent(`${resumeEs.work[0].startDate} a ${resumeEs.work[0].endDate || 'Presente'}`);
        } finally {
            await i18n.changeLanguage('en');
        }
    });
});
