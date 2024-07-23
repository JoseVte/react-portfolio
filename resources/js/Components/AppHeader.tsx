import Container from "@/Components/Container.js";
import AvatarContainer from "@/Components/AvatarContainer.js";
import Avatar from "@/Components/Avatar";
import {useEffect, useRef, useState} from "react";
import {Link, usePage} from "@inertiajs/react";
import {useTranslation} from "react-i18next";
import ChevronDown from "@/Components/Icons/ChevronDown";
import ModeToggle from "@/Components/ModeToggle";

export default function AppHeader({isHomePage, navLinks}: Readonly<{ isHomePage: boolean, navLinks: object }>) {
    const {t, i18n} = useTranslation();

    const currentPage = usePage().url;
    const headerRef = useRef<HTMLDivElement>(null);

    const [isInitial, setIsInitial] = useState(true);
    const [upDelay] = useState(64);
    const [modal, setModal] = useState(false);

    const availableLocale = () => {
        return (i18n.languages).filter(lng => lng !== i18n.language)[0]
    }

    const clamp = (numberOriginal: number, a: number, b: number): number => {
        let min = Math.min(a, b)
        let max = Math.max(a, b)
        return Math.min(Math.max(numberOriginal, min), max)
    }

    const setProperty = (property: string, value: any) => {
        document.documentElement.style.setProperty(property, value)
    }

    const removeProperty = (property: string) => {
        document.documentElement.style.removeProperty(property)
    }

    const isActive = (url: string | number): boolean => {
        return currentPage === url;
    }

    const updateAvatarStyles = () => {
        if (!isHomePage) {
            return
        }

        let scrollY: number = window.scrollY

        if (scrollY === 0) {
            setProperty(
                '--avatar-image-transform',
                `scale(1)`
            )
            setProperty(
                '--avatar-border-transform',
                'translate(1rem, 1rem) scale(2)'
            )
        } else {
            setProperty(
                '--avatar-border-transform',
                'translate(.5rem, .5rem) scale(1.5)'
            )
        }
    }

    const updateHeaderStyles = () => {
        if (headerRef.current !== null) {
            let {top, height} = headerRef.current.getBoundingClientRect()
            let scrollY = clamp(
                window.scrollY,
                0,
                document.body.scrollHeight - window.innerHeight
            )

            if (isInitial) {
                setProperty('--header-position', 'sticky')
            }

            setProperty('--content-offset', `0px`)

            if (isInitial || scrollY < 0) {
                setProperty('--header-height', `${height}px`)
                setProperty('--header-mb', `${-0}px`)
            } else if (top + height < -upDelay) {
                let offset = Math.max(height, scrollY - upDelay)
                setProperty('--header-height', `${offset}px`)
                setProperty('--header-mb', `${height - offset}px`)
            } else if (top === 0) {
                setProperty('--header-height', `${scrollY + height}px`)
                setProperty('--header-mb', `${-scrollY}px`)
            }

            if (top === 0 && scrollY > 0 && scrollY >= 0) {
                setProperty('--header-inner-position', 'fixed')
                removeProperty('--header-top')
                removeProperty('--avatar-top')
            } else {
                removeProperty('--header-inner-position')
                setProperty('--header-top', '0px')
                setProperty('--avatar-top', '0px')
            }
        }
    }


    const updateStyles = () => {
        updateHeaderStyles()
        updateAvatarStyles()
        setIsInitial(false)
    }

    useEffect(() => {
        updateStyles()
    })

    const isServer = typeof window === 'undefined'
    if (!isServer) {
        window.addEventListener('scroll', updateStyles, {passive: true})
        window.addEventListener('resize', updateStyles)
    }

    return (
        <>
            <header
                className="pointer-events-none relative z-50 flex flex-col"
                style={{height: 'var(--header-height)', marginBottom: 'var(--header-mb)'}}
            >
                <div
                    ref={headerRef}
                    className="top-0 z-10 h-16 pt-6"
                    // @ts-ignore
                    style={{position: 'var(--header-position)'}}
                >
                    <Container
                        className="top-[var(--header-top,theme(spacing.6))] w-full"
                        // @ts-ignore
                        style={{position: 'var(--header-inner-position)'}}
                    >
                        <div className="relative flex gap-4">
                            <div className="flex flex-1">
                                <AvatarContainer
                                    className="transition-all"
                                    style={{
                                        transform: 'var(--avatar-border-transform)'
                                    }}>
                                    <Avatar large
                                            style={{transform: 'var(--avatar-image-transform)'}}/>
                                </AvatarContainer>
                            </div>
                            <div className="flex flex-1 justify-end md:justify-center">
                                <div className="pointer-events-auto md:hidden">
                                    <button
                                        type="button"
                                        className="group flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-zinc-800 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10 dark:hover:ring-white/20"
                                        onClick={() => setModal(true)}>
                                        {t('nav.menu')}
                                        <ChevronDown
                                            className="ml-3 h-auto w-2 stroke-zinc-500 group-hover:stroke-zinc-700 dark:group-hover:stroke-zinc-400"/>
                                    </button>

                                    {modal &&
                                        <div
                                            className="fixed inset-0 z-40 bg-zinc-800/40 backdrop-blur-sm dark:bg-black/80 opacity-100"
                                            onClick={() => setModal(false)}
                                        />
                                    }

                                    {modal &&
                                        <div
                                            id="menuNavigation"
                                            aria-hidden="true"
                                            className="fixed inset-x-4 top-8 z-50 origin-top rounded-3xl bg-white p-8 ring-1 ring-zinc-900/5 dark:bg-zinc-900 dark:ring-zinc-800 opacity-100 scale-100"
                                        >
                                            <div className="relative w-full max-w-2xl max-h-full">
                                                <div className="flex flex-row-reverse items-center justify-between">
                                                    <button
                                                        type="button"
                                                        className="-m-1 p-1"
                                                        onClick={() => setModal(false)}
                                                    >
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            aria-hidden="true"
                                                            className="h-6 w-6 text-zinc-500 dark:text-zinc-400"
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
                                                    <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                                        {t('nav.navigation')}
                                                    </h2>
                                                </div>

                                                <div className="mt-6">
                                                    <ul className="-my-2 divide-y divide-zinc-100 text-base text-zinc-800 dark:divide-zinc-100/5 dark:text-zinc-300">
                                                        {Object.entries(navLinks).map(([url, text]) => (
                                                            <li key={url}>
                                                                <Link href={url} className="block py-2">{text}</Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>

                                <nav className="pointer-events-auto hidden md:block">
                                    <ul className="flex rounded-full bg-white/90 px-3 text-sm font-medium text-zinc-800 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10">
                                        {Object.entries(navLinks).map(([url, text]) => (
                                            <li key={url}>
                                                <Link href={url}
                                                      className={`relative block px-3 py-2 transition hover:text-teal-500 dark:hover:text-teal-400 ${isActive(url) ? 'text-teal-500 dark:text-teal-400' : ''}`}>
                                                    {isActive(url) &&
                                                        <span
                                                            className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-teal-500/0 via-teal-500/40 to-teal-500/0 dark:from-teal-400/0 dark:via-teal-400/40 dark:to-teal-400/0"/>
                                                    }
                                                    {text}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                            <div className="flex justify-end md:flex-1">
                                <div className="pointer-events-auto flex gap-4">
                                    {availableLocale() &&
                                        <a
                                            className="capitalize group cursor-pointer rounded-full bg-white/90 px-3 py-2 text-zinc-800 dark:text-zinc-200 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur transition dark:bg-zinc-800/90 dark:ring-white/10 dark:hover:ring-white/20"
                                            onClick={() => i18n.changeLanguage(availableLocale())}
                                        >
                                            {availableLocale()}
                                        </a>
                                    }
                                    <ModeToggle/>
                                </div>
                            </div>
                        </div>
                    </Container>
                </div>
            </header>
            {
                isHomePage &&
                <div style={{height: 'var(--content-offset)'}}/>
            }
        </>
    )
}
