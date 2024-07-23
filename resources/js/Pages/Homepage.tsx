import {Link, Head} from '@inertiajs/react';
import DefaultLayout from "@/Layouts/DefaultLayout";
import Container from "@/Components/Container";
import {useTranslation} from "react-i18next";
import Twitter from "@/Components/Icons/Twitter";
import Instagram from "@/Components/Icons/Instagram";
import GitHub from "@/Components/Icons/GitHub";
import LinkedIn from "@/Components/Icons/LinkedIn";
import Photos from "@/Components/Sections/Photos";
import Projects from "@/Components/Sections/Projects";
import Work from "@/Components/Sections/Work";

export default function Homepage() {
    const {t} = useTranslation();

    const title = t('layouts.title')
    const description = t('layouts.description')
    const descriptionExtended = description + ' ' + t('layouts.description-extended')

    return (
        <DefaultLayout>
            <Head title={title} />

            <Container className="mt-9">
                <div className="max-w-2xl">
                    <h1
                        className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
                        {title}
                    </h1>
                    <p
                        className="mt-6 text-base text-zinc-600 dark:text-zinc-400"
                    >
                        {descriptionExtended}
                    </p>
                    <div className="mt-6 flex gap-6">
                        <Link
                            className="group -m-1 p-1"
                            href={import.meta.env.VITE_PUBLIC_TWITTER}
                            aria-label={t('follow', {social: 'Twitter'})}
                        >
                            <Twitter
                                className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300"/>
                        </Link>
                        <Link
                            className="group -m-1 p-1"
                            href={import.meta.env.VITE_PUBLIC_INSTAGRAM}
                            aria-label={t('follow', {social: 'Instagram'})}
                        >
                            <Instagram
                                className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300"/>
                        </Link>
                        <Link
                            className="group -m-1 p-1"
                            href={import.meta.env.VITE_PUBLIC_GITHUB}
                            aria-label={t('follow', {social: 'GitHub'})}
                        >
                            <GitHub
                                className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300"/>
                        </Link>
                        <Link
                            className="group -m-1 p-1"
                            href={import.meta.env.VITE_PUBLIC_LINKEDIN}
                            aria-label={t('follow', {social: 'LinkedIn'})}
                        >
                            <LinkedIn
                                className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300"/>
                        </Link>
                    </div>
                </div>
            </Container>
            <Photos />
            <Container className="mt-24 md:mt-28">
                <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
                    <div className="flex flex-col gap-16">
                        <Projects />
                    </div>
                    <div className="space-y-10 lg:pl-16 xl:pl-24">
                        <Work />
                    </div>
                </div>
            </Container>
        </DefaultLayout>
    );
}
