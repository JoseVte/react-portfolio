import ChevronRight from '@/components/icons/chevron-right';
import { GitHubRepository } from '@/types';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Projects() {
    const { t, i18n } = useTranslation();
    const [projects, setProjects] = useState([]);
    const [loaded, setLoaded] = useState(false);

    if (!loaded) {
        setLoaded(true);
        fetch(route('github'))
            .then((res) => res.json())
            .then((data) => setProjects(data));
    }

    const formatDate = (dateString: string): string => {
        return new Date(`${dateString}`).toLocaleDateString(i18n.resolvedLanguage, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        });
    };

    return (
        <>
            {projects.map((project: GitHubRepository, index) => (
                <article key={index} className="group group relative flex flex-col items-start">
                    <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                        <div className="absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 sm:-inset-x-6 sm:rounded-2xl dark:bg-zinc-800/50" />
                        <Link href={project.html_url} target="_blank">
                            <span className="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl" />
                            <span className="relative z-10">{project.name}</span>
                        </Link>
                    </h2>
                    <time
                        className="relative z-10 order-first mb-3 flex items-center pl-3.5 text-sm text-zinc-400 dark:text-zinc-500"
                        dateTime={project.updated_at}
                    >
                        <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
                            <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                        </span>
                        {formatDate(project.updated_at)}
                    </time>
                    <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
                    <Link
                        target="_blank"
                        href={project.html_url}
                        aria-hidden="true"
                        className="relative z-10 mt-4 flex items-center text-sm font-medium text-teal-500 group-hover:text-yellow-500 group-hover:underline"
                    >
                        {t('index.see-repository')}
                        <ChevronRight className="ml-1 size-4 stroke-current" />
                    </Link>
                </article>
            ))}
        </>
    );
}
