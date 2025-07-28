import Avatar from '@/components/avatar';
import AvatarContainer from '@/components/avatar-container';
import Container from '@/components/container';
import Github from '@/components/icons/github';
import Instagram from '@/components/icons/instagram';
import LinkedIn from '@/components/icons/linkedin';
import Twitter from '@/components/icons/twitter';
import Photos from '@/components/sections/photos';
import Projects from '@/components/sections/projects';
import Work from '@/components/sections/work';
import DefaultLayout from '@/layouts/default-layout';
import { Head, Link } from '@inertiajs/react';
import { Bounce } from 'react-awesome-reveal';
import { useTranslation } from 'react-i18next';

export default function Homepage() {
    const { t } = useTranslation();

    const seoTitle = t('layouts.seo-title');
    const title = t('layouts.title');
    const description = t('layouts.description');
    const descriptionExtended = description + ' ' + t('layouts.description-extended');

    return (
        <DefaultLayout>
            <Head title={seoTitle}>
                <meta head-key="description" name="description" content={description} />

                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={description} />

                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
            </Head>

            <Container className="mt-9">
                <div className="grid grid-cols-1 items-center gap-y-10 lg:grid-cols-[1fr_300px]">
                    <div className="max-w-2xl">
                        <div className="grid items-center gap-y-10 md:grid-cols-[200px_1fr] lg:grid-cols-1">
                            <AvatarContainer className="m-auto hidden size-36 items-center justify-center transition-all md:flex lg:hidden">
                                <Avatar maxSize={144} customAvatarClass="h-[125px] w-[125px]" width={125} height={125} forceLoad />
                            </AvatarContainer>
                            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">{title}</h1>
                        </div>
                        <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">{descriptionExtended}</p>
                        <div className="mt-6 flex gap-6">
                            <Link
                                className="group -m-1 p-1"
                                href={import.meta.env.VITE_PUBLIC_TWITTER}
                                aria-label={t('follow', { social: 'Twitter' })}
                            >
                                <Twitter className="size-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-yellow-300" />
                            </Link>
                            <Link
                                className="group -m-1 p-1"
                                href={import.meta.env.VITE_PUBLIC_INSTAGRAM}
                                aria-label={t('follow', { social: 'Instagram' })}
                            >
                                <Instagram className="size-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-yellow-300" />
                            </Link>
                            <Link className="group -m-1 p-1" href={import.meta.env.VITE_PUBLIC_GITHUB} aria-label={t('follow', { social: 'GitHub' })}>
                                <Github className="size-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-yellow-300" />
                            </Link>
                            <Link
                                className="group -m-1 p-1"
                                href={import.meta.env.VITE_PUBLIC_LINKEDIN}
                                aria-label={t('follow', { social: 'LinkedIn' })}
                            >
                                <LinkedIn className="size-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-yellow-300" />
                            </Link>
                        </div>
                    </div>
                    <AvatarContainer className="m-auto hidden size-60 items-center justify-center transition-all lg:flex">
                        <Avatar maxSize={256} customAvatarClass="h-[220px] w-[220px]" width={220} height={220} forceLoad />
                    </AvatarContainer>
                </div>
            </Container>
            <Photos />
            <Container className="mt-24 md:mt-28">
                <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
                    <Bounce triggerOnce cascade damping={0.2} fraction={0.25}>
                        <div className="flex flex-col gap-16">
                            <Projects />
                        </div>
                        <div className="space-y-10 lg:pl-16 xl:pl-24">
                            <Work />
                        </div>
                    </Bounce>
                </div>
            </Container>
        </DefaultLayout>
    );
}
