import Container from '@/components/container';
import Github from '@/components/icons/github';
import Instagram from '@/components/icons/instagram';
import LinkedIn from '@/components/icons/linkedin';
import Mail from '@/components/icons/mail';
import Twitter from '@/components/icons/twitter';
import LazyImg from '@/components/lazy-img';
import DefaultLayout from '@/layouts/default-layout';
import { Head, Link } from '@inertiajs/react';
import { sample } from 'lodash';
import { useTranslation } from 'react-i18next';
import { ParallaxBanner, ParallaxProvider } from 'react-scroll-parallax';

export default function About() {
    const { t } = useTranslation();

    const title = t('layouts.about.title');
    const description = t('layouts.about.description');

    return (
        <ParallaxProvider>
            <DefaultLayout>
                <Head title={title}>
                    <meta head-key="description" name="description" content={description} />
                </Head>

                <Container className="mt-16 sm:mt-20 lg:mt-32">
                    <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
                        <div className="lg:pl-20">
                            <div className="mx-auto -mt-30 mb-10 h-[420px] max-w-xs px-2.5 lg:mx-0 lg:-mb-20 lg:h-[700px] lg:max-w-none">
                                <ParallaxBanner
                                    className="aspect-[1/1] !overflow-visible"
                                    layers={[
                                        {
                                            translateY: [20, 60],
                                            children: (
                                                <LazyImg
                                                    image="/images/portrait.jpg"
                                                    preImage="/images/portrait-min.jpg"
                                                    alt={t('img-alt.profile')}
                                                    className={`aspect-square rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800 ${sample(['rotate-3', '-rotate-3', 'rotate-2', '-rotate-2'])}`}
                                                />
                                            ),
                                        },
                                        {
                                            translateY: [100, 60],
                                            speed: 10,
                                            children: (
                                                <div className="-mx-4 block h-72 bg-gradient-to-t from-white to-transparent lg:hidden lg:h-60 dark:from-zinc-900" />
                                            ),
                                        },
                                        {
                                            translateY: [100, 75],
                                            speed: 10,
                                            children: (
                                                <div className="-mx-4 hidden h-60 bg-gradient-to-t from-white to-transparent lg:block lg:h-60 dark:from-zinc-900" />
                                            ),
                                        },
                                    ]}
                                />
                            </div>
                        </div>
                        <div className="z-10 lg:order-first lg:row-span-2">
                            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">{description}</h1>
                            <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
                                <p>{t('about.paragraph-1')}</p>
                                <p>{t('about.paragraph-2')}</p>
                                <p>{t('about.paragraph-3')}</p>
                            </div>
                        </div>
                        <div className="z-10 lg:pl-20">
                            <ul role="list">
                                <li className="flex">
                                    <Link
                                        className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-yellow-500"
                                        href={import.meta.env.VITE_PUBLIC_TWITTER}
                                        aria-label={t('follow', { social: 'Twitter' })}
                                    >
                                        <Twitter className="size-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500 dark:group-hover:fill-yellow-500" />
                                        <span className="ml-4">{t('follow', { social: 'Twitter' })}</span>
                                    </Link>
                                </li>
                                <li className="mt-4 flex">
                                    <Link
                                        className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-yellow-500"
                                        href={import.meta.env.VITE_PUBLIC_INSTAGRAM}
                                        aria-label={t('follow', { social: 'Instagram' })}
                                    >
                                        <Instagram className="size-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500 dark:group-hover:fill-yellow-500" />
                                        <span className="ml-4">{t('follow', { social: 'Instagram' })}</span>
                                    </Link>
                                </li>
                                <li className="mt-4 flex">
                                    <Link
                                        className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-yellow-500"
                                        href={import.meta.env.VITE_PUBLIC_GITHUB}
                                        aria-label={t('follow', { social: 'GitHub' })}
                                    >
                                        <Github className="size-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500 dark:group-hover:fill-yellow-500" />
                                        <span className="ml-4">{t('follow', { social: 'GitHub' })}</span>
                                    </Link>
                                </li>
                                <li className="mt-4 flex">
                                    <Link
                                        className="group dark:-hover:text-yellow-500 flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200"
                                        href={import.meta.env.VITE_PUBLIC_LINKEDIN}
                                        aria-label={t('follow', { social: 'LinkedIn' })}
                                    >
                                        <LinkedIn className="size-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500 dark:group-hover:fill-yellow-500" />
                                        <span className="ml-4">{t('follow', { social: 'LinkedIn' })}</span>
                                    </Link>
                                </li>

                                <li className="mt-8 flex border-t border-zinc-100 pt-8 dark:border-zinc-700/40">
                                    <Link
                                        className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-yellow-500"
                                        href={'mailto:' + import.meta.env.VITE_PUBLIC_EMAIL}
                                    >
                                        <Mail className="size-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500 dark:group-hover:fill-yellow-500" />
                                        <span className="ml-4">{import.meta.env.VITE_PUBLIC_EMAIL}</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Container>
            </DefaultLayout>
        </ParallaxProvider>
    );
}
