import Avatar from '@/components/avatar';
import AvatarContainer from '@/components/avatar-container';
import Container from '@/components/container';
import ChevronDown from '@/components/icons/chevron-down';
import ModeToggle from '@/components/mode-toggle';
import { Appearance } from '@/hooks/use-appearance';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScroll } from '@/hooks/use-scroll';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Fade } from 'react-awesome-reveal';
import { useTranslation } from 'react-i18next';

export default function AppHeader({
    isHomePage,
    navLinks,
    appearance,
    updateAppearance,
}: Readonly<{
    isHomePage: boolean;
    navLinks: object;
    appearance: string;
    updateAppearance: (appearance: Appearance) => void;
}>) {
    const { t, i18n } = useTranslation();
    const isOnTop = useScroll();
    const isMobile = useIsMobile();

    const currentPage = usePage().url;

    const [modal, setModal] = useState(false);

    const availableLocale = () => {
        return i18n.languages.filter((lng) => lng !== i18n.language)[0];
    };

    const isActive = (url: string | number): boolean => {
        return currentPage === url;
    };

    const transitionStyles = {
        enter: {
            transform: 'translateY(-100%)',
        },
        exit: {
            transform: 'translateY(0%)',
        },
    };

    return (
        <>
            <header className="pointer-events-none relative z-50 flex h-16 flex-col">
                <div className="fixed inset-x-0 top-0 z-10 flex h-20 items-center">
                    <div
                        className="absolute inset-0 w-full transition-all ease-in-out sm:px-8"
                        style={{
                            ...transitionStyles[isOnTop ? 'enter' : 'exit'],
                        }}
                    >
                        <div className="mx-auto h-full max-w-7xl lg:px-8">
                            <div className="h-full bg-linear-to-b from-zinc-200 to-transparent dark:from-zinc-700"></div>
                        </div>
                    </div>
                    <Container className="inset-0 w-full">
                        <div className="relative flex gap-4">
                            <div className="flex flex-1">
                                {(!isOnTop || isMobile || !isHomePage) && (
                                    <Fade>
                                        <AvatarContainer className={isOnTop && isMobile ? 'size-16 transition-all' : 'transition-all'}>
                                            <Avatar large={isOnTop && isMobile} width={64} height={64} forceLoad />
                                        </AvatarContainer>
                                    </Fade>
                                )}
                            </div>
                            <div className="flex flex-1 items-center justify-end md:justify-center">
                                <div className="pointer-events-auto md:hidden">
                                    <button
                                        type="button"
                                        className="group flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-zinc-800 shadow-lg ring-1 shadow-zinc-800/5 ring-zinc-900/5 backdrop-blur dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10 dark:hover:ring-white/20"
                                        onClick={() => setModal(true)}
                                    >
                                        {t('nav.menu')}
                                        <ChevronDown className="ml-3 h-auto w-2 stroke-zinc-500 group-hover:stroke-zinc-700 dark:group-hover:stroke-zinc-400" />
                                    </button>

                                    {modal && (
                                        <div
                                            className="fixed inset-0 z-40 bg-zinc-800/40 opacity-100 backdrop-blur-sm dark:bg-black/80"
                                            onClick={() => setModal(false)}
                                        />
                                    )}

                                    {modal && (
                                        <div
                                            id="menuNavigation"
                                            aria-hidden="true"
                                            className="fixed inset-x-4 top-8 z-50 origin-top scale-100 rounded-3xl bg-white p-8 opacity-100 ring-1 ring-zinc-900/5 dark:bg-zinc-900 dark:ring-zinc-800"
                                        >
                                            <div className="relative max-h-full w-full max-w-2xl">
                                                <div className="flex flex-row-reverse items-center justify-between">
                                                    <button type="button" className="-m-1 p-1" onClick={() => setModal(false)}>
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            aria-hidden="true"
                                                            className="size-6 text-zinc-500 dark:text-zinc-400"
                                                        >
                                                            <path
                                                                d="m17.25 6.75-10.5 10.5M6.75 6.75l10.5 10.5"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                        <span className="sr-only">{t('close')}</span>
                                                    </button>
                                                    <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{t('nav.navigation')}</h2>
                                                </div>

                                                <div className="mt-6">
                                                    <ul className="-my-2 divide-y divide-zinc-100 text-base text-zinc-800 dark:divide-zinc-100/5 dark:text-zinc-300">
                                                        {Object.entries(navLinks).map(([url, text]) => (
                                                            <li key={url}>
                                                                <Link
                                                                    href={url}
                                                                    className={`block py-2 transition hover:text-teal-500 dark:hover:text-teal-400 ${isActive(url) ? 'text-yellow-500 dark:text-yellow-400' : ''}`}
                                                                >
                                                                    {text}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <nav className="pointer-events-auto hidden md:block">
                                    <ul className="flex rounded-full bg-white/90 px-3 text-sm font-medium text-zinc-800 shadow-lg ring-1 shadow-zinc-800/5 ring-zinc-900/5 backdrop-blur dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10">
                                        {Object.entries(navLinks).map(([url, text]) => (
                                            <li key={url}>
                                                <Link
                                                    href={url}
                                                    className={`relative block px-3 py-2 transition hover:text-teal-500 dark:hover:text-teal-400 ${isActive(url) ? 'text-yellow-500 dark:text-yellow-400' : ''}`}
                                                >
                                                    {isActive(url) && (
                                                        <span className="absolute inset-x-1 -bottom-px h-px bg-linear-to-r from-teal-500/0 via-teal-500/40 to-teal-500/0 dark:from-teal-400/0 dark:via-teal-400/40 dark:to-teal-400/0" />
                                                    )}
                                                    {text}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                            <div className="flex items-center justify-end md:flex-1">
                                <div className="pointer-events-auto flex gap-4">
                                    {availableLocale() && (
                                        <button
                                            type="button"
                                            className="group cursor-pointer rounded-full bg-white/90 px-3 py-2 text-zinc-800 capitalize shadow-lg ring-1 shadow-zinc-800/5 ring-zinc-900/5 backdrop-blur transition dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10 dark:hover:ring-white/20"
                                            onClick={() => i18n.changeLanguage(availableLocale())}
                                        >
                                            {availableLocale()}
                                        </button>
                                    )}
                                    <ModeToggle appearance={appearance} updateAppearance={updateAppearance} />
                                </div>
                            </div>
                        </div>
                    </Container>
                </div>
            </header>
            {isHomePage && <div className="h-8" />}
        </>
    );
}
