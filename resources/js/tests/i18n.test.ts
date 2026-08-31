import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import i18n from '../i18n';

const LOCALES = ['en', 'es'] as const;

const bundleFor = (locale: (typeof LOCALES)[number]) => i18n.getResourceBundle(locale, 'translation') as Record<string, string>;

describe('translations', () => {
    it('ships both locales', () => {
        LOCALES.forEach((locale) => expect(Object.keys(bundleFor(locale)).length).toBeGreaterThan(0));
    });

    it('defines exactly the same keys in every locale', () => {
        const [reference, ...others] = LOCALES.map((locale) => ({ locale, keys: Object.keys(bundleFor(locale)).sort() }));

        others.forEach((other) => {
            expect(
                other.keys.filter((key) => !reference.keys.includes(key)),
                `extra keys in ${other.locale}`,
            ).toEqual([]);
            expect(
                reference.keys.filter((key) => !other.keys.includes(key)),
                `missing keys in ${other.locale}`,
            ).toEqual([]);
        });
    });

    it('never leaves a translation empty', () => {
        LOCALES.forEach((locale) => {
            Object.entries(bundleFor(locale)).forEach(([key, value]) => {
                expect(value.trim(), `${locale}.${key} is empty`).not.toBe('');
            });
        });
    });

    it('keeps the same interpolation placeholders across locales', () => {
        const placeholders = (value: string) => (value.match(/{{\s*\w+\s*}}/g) ?? []).sort();

        Object.entries(bundleFor('en')).forEach(([key, english]) => {
            expect(placeholders(bundleFor('es')[key]), `placeholders differ for ${key}`).toEqual(placeholders(english));
        });
    });

    it('translates every key that the application actually asks for', () => {
        const sourceRoot = resolve(import.meta.dirname, '..');
        const files = import.meta.glob('../**/*.tsx', { query: '?raw', eager: true, import: 'default' }) as Record<string, string>;

        const usedKeys = new Set<string>();

        Object.entries(files).forEach(([path, contents]) => {
            if (path.includes('/tests/')) {
                return;
            }

            for (const match of contents.matchAll(/\bt\(\s*'([^']+)'/g)) {
                usedKeys.add(match[1]);
            }
        });

        expect(usedKeys.size, `no t() calls found under ${sourceRoot}`).toBeGreaterThan(0);

        LOCALES.forEach((locale) => {
            const bundle = bundleFor(locale);
            const missing = [...usedKeys].filter((key) => !(key in bundle));

            expect(missing, `missing ${locale} translations`).toEqual([]);
        });
    });

    it('falls back to english rather than to spanish', () => {
        expect(i18n.options.fallbackLng).toEqual(['en']);
    });

    it('does not try to push missing keys to a backend', () => {
        expect(i18n.options.saveMissing).toBeFalsy();
    });

    it('resolves regional variants to their base language', () => {
        expect(i18n.options.supportedLngs).toEqual(expect.arrayContaining(['en', 'es']));
        expect(i18n.options.nonExplicitSupportedLngs).toBe(true);
    });
});

describe('translation source file', () => {
    it('has no duplicate keys inside a locale', () => {
        const source = readFileSync(resolve(import.meta.dirname, '../i18n.tsx'), 'utf8');
        const [, english = '', spanish = ''] = source.split(/^\s{4}(?:en|es): \{$/m);

        [english, spanish].forEach((block) => {
            const keys = [...block.matchAll(/^\s{12}'?([\w.-]+)'?:/gm)].map((match) => match[1]);

            expect(keys.length).toBe(new Set(keys).size);
        });
    });
});
