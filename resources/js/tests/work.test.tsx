import { render, screen, within } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import resumeEn from '../../assets/resume/en.json';
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

        const [current, previous] = screen.getAllByRole('listitem');

        expect(within(current).getByText(/to Present/)).toBeInTheDocument();
        expect(previous).toHaveTextContent(`${resumeEn.work[1].startDate} to ${resumeEn.work[1].endDate}`);
        expect(document.body.textContent).not.toContain('—');
    });
});
