import {Head, Link as ReactLink} from '@inertiajs/react';
import DefaultLayout from "@/Layouts/DefaultLayout";
import {useTranslation} from "react-i18next";
import Container from "@/Components/Container";
import LazyImg from "@/Components/LazyImg";
import Link from "@/Components/Icons/Link";
import {useState} from "react";
import {GitHubRepository} from "@/types";

export default function Projects() {
    const {t} = useTranslation();

    const title = t('layouts.projects.title')
    const description = t('layouts.projects.description')

    const [projects, setProjects] = useState([]);
    const [loaded, setLoaded] = useState(false);

    if (!loaded) {
        setLoaded(true)
        fetch(route('github')).then((res) => res.json()).then((data) => setProjects(data));
    }

    return (
        <DefaultLayout>
            <Head title={title}>
                <meta head-key="description" name="description" content={description}/>
            </Head>

            <Container className="mt-16 sm:mt-32">
                <header className="max-w-2xl">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
                        {description}
                    </h1>
                    <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
                        {t('projects.description')}
                    </p>
                </header>
                <div className="mt-16 sm:mt-20">
                    <ul
                        role="list"
                        className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {projects.map((project: GitHubRepository, index) => (
                            <li key={index}
                                className="group relative flex flex-col items-start"
                            >
                                <div
                                    className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
                                    <div className="h-8 w-8 overflow-hidden rounded-full">
                                        <LazyImg
                                            image={project.owner.avatar_url}
                                            preImage={project.owner.avatar_url}
                                            alt={project.name}
                                            className="h-8 w-8"
                                        />
                                    </div>
                                </div>
                                <h2 className="mt-6 text-base font-semibold text-zinc-800 dark:text-zinc-100">
                                    <div
                                        className="absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 dark:bg-zinc-800/50 sm:-inset-x-6 sm:rounded-2xl"/>
                                    <ReactLink
                                        target="_blank"
                                        href={project.html_url}
                                    >
                                        <span
                                            className="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl"/>
                                        <span className="relative z-10">{project.name}</span>
                                    </ReactLink>
                                </h2>
                                <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    {project.description}
                                </p>
                                <p className="relative z-10 mt-6 flex text-sm font-medium text-zinc-400 transition group-hover:text-teal-500 dark:text-zinc-200">
                                    <Link className="h-6 w-6 flex-none"/>
                                    <span className="ml-2">github.com</span>
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </Container>
        </DefaultLayout>
    )
}
