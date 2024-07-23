import {PropsWithChildren, useEffect} from 'react';
import AppHeader from "@/Components/AppHeader";
import {useTranslation} from "react-i18next";
import AppFooter from "@/Components/AppFooter";
import {Head, usePage} from "@inertiajs/react";
import gravatar from "gravatar";
import {CookieConsent, Cookies, getCookieConsentValue} from "react-cookie-consent";
import ReactGA from "react-ga4";

export default function DefaultLayout({children}: Readonly<PropsWithChildren>) {
    const {t} = useTranslation();

    const navLinks = {
        '/about': t('nav.about'),
        '/projects': t('nav.projects'),
    }

    const handleAcceptCookie = () => {
        if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
            ReactGA.initialize(import.meta.env.VITE_GOOGLE_ANALYTICS_ID);
        }
    }
    const handleDeclineCookie = () => {
        //remove google analytics cookies
        Cookies.remove("_ga")
        Cookies.remove("_gat")
        Cookies.remove("_gid")
    };

    useEffect(() => {
        const isConsent = getCookieConsentValue();
        if (isConsent === "true") {
            handleAcceptCookie();
        }
    }, []);

    return (
        <>
            <Head title={t('layouts.title')}>
                <meta head-key="description" name="description" content={t('layouts.description')}></meta>
                <link rel="icon" type="image/png" href={gravatar.url(import.meta.env.VITE_PUBLIC_EMAIL, {s: '64'})}/>
            </Head>

            <div className="flex h-full flex-col bg-zinc-50 dark:bg-black">
                <div className="fixed inset-0 flex justify-center sm:px-8">
                    <div className="flex w-full max-w-7xl lg:px-8">
                        <div className="w-full bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20"/>
                    </div>
                </div>
                <div className="relative">
                    <AppHeader isHomePage={usePage().url === '/'} navLinks={navLinks}/>
                    <main>
                        {children}
                    </main>
                    <AppFooter navLinks={navLinks}/>
                </div>
            </div>
            <CookieConsent enableDeclineButton
                           buttonClasses="!rounded"
                           declineButtonClasses="!rounded"
                           declineButtonText={t('cookie-consent.decline')}
                           buttonText={t('cookie-consent.accept')}
                           onAccept={handleAcceptCookie}
                           onDecline={handleDeclineCookie}>
                {t('cookie-consent.text')}
            </CookieConsent>
        </>
    );
}
