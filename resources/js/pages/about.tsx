import Container from '@/components/container';
import Github from '@/components/icons/github';
import Instagram from '@/components/icons/instagram';
import LinkedIn from '@/components/icons/linkedin';
import Mail from '@/components/icons/mail';
import Twitter from '@/components/icons/twitter';
import LazyImg from '@/components/lazy-img';
import DefaultLayout from '@/layouts/default-layout';
import { Head } from '@inertiajs/react';
import { sample } from 'lodash';
import { useTranslation } from 'react-i18next';
import { ParallaxBanner, ParallaxProvider } from 'react-scroll-parallax';

export default function About() {
    const { t } = useTranslation();

    const title = t('layouts.about.title');
    const description = t('layouts.about.description');

    const socialLinks = [
        { name: 'Twitter', href: import.meta.env.VITE_PUBLIC_TWITTER, Icon: Twitter },
        { name: 'Instagram', href: import.meta.env.VITE_PUBLIC_INSTAGRAM, Icon: Instagram },
        { name: 'GitHub', href: import.meta.env.VITE_PUBLIC_GITHUB, Icon: Github },
        { name: 'LinkedIn', href: import.meta.env.VITE_PUBLIC_LINKEDIN, Icon: LinkedIn },
    ];
    const linkClass =
        'group flex py-2.5 text-sm font-medium text-zinc-800 transition hover:text-teal-700 dark:text-zinc-200 dark:hover:text-yellow-500';
    const iconClass = 'size-6 flex-none fill-zinc-500 transition group-hover:fill-teal-700 dark:group-hover:fill-yellow-500';

    return (
        <ParallaxProvider>
            <DefaultLayout>
                <Head title={title}>
                    <meta head-key="description" name="description" content={description} />

                    <meta property="og:title" content={title} />
                    <meta property="og:description" content={description} />

                    <meta name="twitter:title" content={title} />
                    <meta name="twitter:description" content={description} />
                </Head>

                <Container className="mt-16 sm:mt-20 lg:mt-32">
                    <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
                        <div className="lg:pl-20">
                            <div className="mx-auto -mt-30 mb-10 h-105 max-w-xs px-2.5 lg:mx-0 lg:-mb-20 lg:h-175 lg:max-w-none">
                                <ParallaxBanner
                                    className="aspect-square overflow-visible!"
                                    layers={[
                                        {
                                            translateY: [20, 60],
                                            children: (
                                                <LazyImg
                                                    image="/images/portrait.jpg"
                                                    preImage="/images/portrait-min.jpg"
                                                    alt={t('img-alt.profile')}
                                                    title={t('img-alt.profile')}
                                                    forceLoad
                                                    withOverflow
                                                    className={`aspect-square w-full max-w-100 rounded-2xl bg-zinc-100 object-cover 2xl:max-w-125 dark:bg-zinc-800 ${sample(['rotate-3', '-rotate-3', 'rotate-2', '-rotate-2'])}`}
                                                />
                                            ),
                                        },
                                        {
                                            translateY: [100, 60],
                                            speed: 10,
                                            children: (
                                                <div className="-mx-4 block h-72 w-[calc(100%+2rem)] max-w-110 bg-linear-to-t from-white to-transparent lg:hidden lg:h-60 2xl:max-w-132 dark:from-zinc-900" />
                                            ),
                                        },
                                        {
                                            translateY: [100, 75],
                                            speed: 10,
                                            children: (
                                                <div className="-mx-4 hidden h-60 w-[calc(100%+2rem)] max-w-110 bg-linear-to-t from-white to-transparent lg:block lg:h-60 2xl:max-w-132 dark:from-zinc-900" />
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
                                {socialLinks.map(({ name, href, Icon }) => (
                                    <li key={name} className="flex">
                                        <a className={linkClass} href={href} target="_blank" rel="noopener noreferrer">
                                            <Icon className={iconClass} />
                                            <span className="ml-4">{t('follow', { social: name })}</span>
                                        </a>
                                    </li>
                                ))}

                                <li className="mt-8 flex border-t border-zinc-100 pt-8 dark:border-zinc-700/40">
                                    <a className={linkClass} href={'mailto:' + import.meta.env.VITE_PUBLIC_EMAIL}>
                                        <Mail className={iconClass} />
                                        <span className="ml-4">{import.meta.env.VITE_PUBLIC_EMAIL}</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Container>
            </DefaultLayout>
        </ParallaxProvider>
    );
}
