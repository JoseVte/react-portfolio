import {Head, Link} from '@inertiajs/react';
import DefaultLayout from "@/Layouts/DefaultLayout";
import {useTranslation} from "react-i18next";
import Container from "@/Components/Container";
import LazyImg from "@/Components/LazyImg";
import Twitter from "@/Components/Icons/Twitter";
import Instagram from "@/Components/Icons/Instagram";
import GitHub from "@/Components/Icons/GitHub";
import LinkedIn from "@/Components/Icons/LinkedIn";
import Mail from "@/Components/Icons/Mail";
import _ from "lodash";

export default function About() {
    const {t} = useTranslation();

    const title = t('layouts.about.title')
    const description = t('layouts.about.description')

    return (
        <DefaultLayout>
            <Head title={title}>
                <meta head-key="description" name="description" content={description}/>
            </Head>

            <Container className="mt-16 sm:mt-32">
                <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
                    <div className="lg:pl-20">
                        <div className="max-w-xs px-2.5 lg:max-w-none">
                            <LazyImg
                                image="/images/portrait.jpg"
                                preImage="/images/portrait-min.jpg"
                                alt={t('img-alt.profile')}
                                className={`aspect-square rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800 ${_.sample(['rotate-3', '-rotate-3', 'rotate-2', '-rotate-2'])}`}
                            />
                        </div>
                    </div>
                    <div className="lg:order-first lg:row-span-2">
                        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
                            {description}
                        </h1>
                        <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
                            <p>
                                {t('about.paragraph-1')}
                            </p>
                            <p>
                                {t('about.paragraph-2')}
                            </p>
                            <p>
                                {t('about.paragraph-3')}
                            </p>
                        </div>
                    </div>
                    <div className="lg:pl-20">
                        <ul role="list">
                            <li className="flex">
                                <Link
                                    className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
                                    href={import.meta.env.VITE_PUBLIC_TWITTER}
                                    aria-label={t('follow', {social: 'Twitter'})}
                                >
                                    <Twitter
                                        className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500"/>
                                    <span className="ml-4">{t('follow', {social: 'Twitter'})}</span>
                                </Link>
                            </li>
                            <li className="flex mt-4">
                                <Link
                                    className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
                                    href={import.meta.env.VITE_PUBLIC_INSTAGRAM}
                                    aria-label={t('follow', {social: 'Instagram'})}
                                >
                                    <Instagram
                                        className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500"/>
                                    <span className="ml-4">{t('follow', {social: 'Instagram'})}</span>
                                </Link>
                            </li>
                            <li className="flex mt-4">
                                <Link
                                    className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
                                    href={import.meta.env.VITE_PUBLIC_GITHUB}
                                    aria-label={t('follow', {social: 'GitHub'})}
                                >
                                    <GitHub
                                        className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500"/>
                                    <span className="ml-4">{t('follow', {social: 'GitHub'})}</span>
                                </Link>
                            </li>
                            <li className="flex mt-4">
                                <Link
                                    className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
                                    href={import.meta.env.VITE_PUBLIC_LINKEDIN}
                                    aria-label={t('follow', {social: 'LinkedIn'})}
                                >
                                    <LinkedIn
                                        className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500"/>
                                    <span className="ml-4">{t('follow', {social: 'LinkedIn'})}</span>
                                </Link>
                            </li>

                            <li className="flex mt-8 border-t border-zinc-100 pt-8 dark:border-zinc-700/40">
                                <Link
                                    className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
                                    href={'mailto:' + import.meta.env.VITE_PUBLIC_EMAIL}
                                >
                                    <Mail
                                        className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500"/>
                                    <span className="ml-4">{import.meta.env.VITE_PUBLIC_EMAIL}</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </Container>
        </DefaultLayout>
    )
}
