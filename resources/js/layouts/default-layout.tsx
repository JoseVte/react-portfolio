import AppFooter from '@/components/app-footer';
import AppHeader from '@/components/app-header';
import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { Head, usePage } from '@inertiajs/react';
import { theme as BaseTheme, createTheme, ThemeProvider } from 'flowbite-react';
import gravatar from 'gravatar';
import { PropsWithChildren, useEffect } from 'react';
import { CookieConsent, Cookies, getCookieConsentValue } from 'react-cookie-consent';
import ReactGA from 'react-ga4';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import { SharedData } from '@/types';

export default function DefaultLayout({
    children,
    appearance = undefined,
    updateAppearance = undefined,
}: Readonly<
    PropsWithChildren & {
        appearance?: string;
        updateAppearance?: (appearance: Appearance) => void;
    }
>) {
    const { t, i18n } = useTranslation();
    const data = useAppearance();
    if (appearance === undefined) {
        appearance = data.appearance;
    }
    if (updateAppearance === undefined) {
        updateAppearance = data.updateAppearance;
    }

    const navLinks = {
        '/about': t('nav.about'),
        '/projects': t('nav.projects'),
    };

    const handleAcceptCookie = () => {
        if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
            ReactGA.initialize(import.meta.env.VITE_GOOGLE_ANALYTICS_ID);
        }
    };
    const handleDeclineCookie = () => {
        //remove Google Analytics cookies
        Cookies.remove('_ga');
        Cookies.remove('_gat');
        Cookies.remove('_gid');
    };

    useEffect(() => {
        const isConsent = getCookieConsentValue();
        if (isConsent === 'true') {
            handleAcceptCookie();
        }
    }, []);

    useEffect(() => {
        document.documentElement.lang = i18n.resolvedLanguage ?? i18n.language;
    }, [i18n.language, i18n.resolvedLanguage]);


    const replaceTheme = (classes: string, oldColor: string, newColor: string) => {
        return twMerge(classes, classes.replaceAll(oldColor, newColor));
    };

    const theme = createTheme({
        select: {
            field: {
                select: {
                    colors: {
                        gray: twMerge(
                            replaceTheme(BaseTheme.select.field.select.colors.gray, 'gray', 'zinc'),
                            'dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100',
                        ),
                    },
                },
            },
        },
        fileInput: {
            base: twMerge(
                replaceTheme(BaseTheme.fileInput.base, 'gray', 'zinc'),
                'dark:file:bg-zinc-700 dark:hover:file:bg-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100',
            ),
            colors: {
                gray: twMerge(
                    replaceTheme(BaseTheme.fileInput.colors.gray, 'gray', 'zinc'),
                    'dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100',
                ),
            },
        },
        dropdown: {
            floating: {
                style: {
                    dark: twMerge(
                        replaceTheme(BaseTheme.dropdown.floating.style.dark, 'gray', 'zinc'),
                        'dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100',
                    ),
                    auto: twMerge(
                        replaceTheme(BaseTheme.dropdown.floating.style.auto, 'gray', 'zinc'),
                        'dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100',
                    ),
                },
                item: {
                    base: twMerge(
                        replaceTheme(BaseTheme.dropdown.floating.item.base, 'gray', 'zinc'),
                        'dark:hover:bg-zinc-700 dark:hover:text-zinc-100',
                    ),
                },
            },
        },
        modal: {
            content: {
                inner: twMerge(replaceTheme(BaseTheme.modal.content.inner, 'gray', 'zinc'), 'dark:bg-zinc-800 dark:text-zinc-100'),
            },
            header: {
                base: twMerge(replaceTheme(BaseTheme.modal.header.base, 'gray', 'zinc'), 'dark:border-zinc-700 dark:text-zinc-100'),
                close: {
                    base: twMerge(
                        replaceTheme(BaseTheme.modal.header.close.base, 'gray', 'zinc'),
                        'text-zinc-400 hover:text-zinc-900 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 cursor-pointer',
                    ),
                },
            },
            footer: {
                base: twMerge(replaceTheme(BaseTheme.modal.footer.base, 'gray', 'zinc'), 'border-zinc-200 dark:border-zinc-700 dark:text-zinc-100'),
            },
        },
        button: {
            base: twMerge(BaseTheme.button.base, 'cursor-pointer'),
            color: {
                alternative: twMerge(
                    replaceTheme(BaseTheme.button.color.alternative, 'gray', 'zinc'),
                    'dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-zinc-100',
                ),
            },
        },
    });

    return (
        <>
            <ThemeProvider theme={theme}>
                <Head title={t('layouts.seo-title')}>
                    <meta head-key="description" name="description" content={t('layouts.description')} />
                    <link rel="icon" type="image/png" href={gravatar.url(import.meta.env.VITE_PUBLIC_EMAIL, { s: '64' })} />
                    <link rel="canonical" href={usePage<SharedData>().props.ziggy.url} />

                    <meta property="og:title" content={t('layouts.seo-title')} />
                    <meta property="og:description" content={t('layouts.description')} />
                    <meta property="og:type" content="website" />
                    <meta property="og:url" content={usePage().url} />
                    <meta property="og:image" content={gravatar.url(import.meta.env.VITE_PUBLIC_EMAIL, { s: '1200' })} />

                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:creator" content={import.meta.env.VITE_PUBLIC_TWITTER_USERNAME} />
                    <meta name="twitter:title" content={t('layouts.seo-title')} />
                    <meta name="twitter:description" content={t('layouts.description')} />
                    <meta name="twitter:image" content={gravatar.url(import.meta.env.VITE_PUBLIC_EMAIL, { s: '1200' })} />
                    <meta name="twitter:image:alt" content={t('layouts.seo-title')} />

                    <meta name="robots" content="index, follow" />
                </Head>

                <div className="flex h-full flex-col bg-zinc-50 dark:bg-black">
                    <div className="fixed inset-0 flex justify-center sm:px-8">
                        <div className="flex w-full max-w-7xl lg:px-8">
                            <div className="w-full bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20" />
                        </div>
                    </div>
                    <div className="relative">
                        <AppHeader
                            isHomePage={usePage().url === '/'}
                            navLinks={navLinks}
                            appearance={appearance}
                            updateAppearance={updateAppearance}
                        />
                        <main>{children}</main>
                        <AppFooter navLinks={navLinks} />
                    </div>
                </div>
                <CookieConsent
                    enableDeclineButton
                    buttonClasses="!rounded"
                    declineButtonClasses="!rounded"
                    declineButtonText={t('cookie-consent.decline')}
                    buttonText={t('cookie-consent.accept')}
                    onAccept={handleAcceptCookie}
                    onDecline={handleDeclineCookie}
                >
                    {t('cookie-consent.text')}
                </CookieConsent>
            </ThemeProvider>
        </>
    );
}
