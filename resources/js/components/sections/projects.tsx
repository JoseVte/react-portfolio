import ChevronRight from '@/components/icons/chevron-right';
import StatusMessage from '@/components/status-message';
import { useFetch } from '@/hooks/use-fetch';
import { GitHubRepository } from '@/types';
import { useTranslation } from 'react-i18next';

export default function Projects() {
    const { t, i18n } = useTranslation();
    const { data: projects, status } = useFetch<GitHubRepository[]>(route('github'));

    const formatDate = (dateString: string): string => {
        return new Date(`${dateString}`).toLocaleDateString(i18n.resolvedLanguage, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        });
    };

    if (status === 'loading') {
        return <StatusMessage>{t('status.projects.loading')}</StatusMessage>;
    }

    if (status === 'error') {
        return (
            <StatusMessage>
                {t('status.projects.error')}{' '}
                <a
                    className="font-medium text-teal-700 underline hover:text-yellow-700 dark:text-teal-500 dark:hover:text-yellow-400"
                    href={import.meta.env.VITE_PUBLIC_GITHUB}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {t('status.projects.see-on-github')}
                </a>
            </StatusMessage>
        );
    }

    if (!projects?.length) {
        return <StatusMessage>{t('status.projects.empty')}</StatusMessage>;
    }

    return (
        <>
            {projects.map((project, index) => (
                <article key={index} className="group group relative flex flex-col items-start">
                    <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                        <div className="absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 sm:-inset-x-6 sm:rounded-2xl dark:bg-zinc-800/50" />
                        <a href={project.html_url} target="_blank" rel="noopener noreferrer">
                            <span className="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl" />
                            <span className="relative z-10">{project.name}</span>
                        </a>
                    </h2>
                    <time
                        className="relative z-10 order-first mb-3 flex items-center pl-3.5 text-sm text-zinc-500 dark:text-zinc-400"
                        dateTime={project.updated_at}
                    >
                        <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
                            <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                        </span>
                        {formatDate(project.updated_at)}
                    </time>
                    <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={project.html_url}
                        aria-hidden="true"
                        tabIndex={-1}
                        className="relative z-10 mt-4 flex items-center text-sm font-medium text-teal-700 group-hover:text-yellow-700 group-hover:underline dark:text-teal-500 dark:group-hover:text-yellow-400"
                    >
                        {t('index.see-repository')}
                        <ChevronRight className="ml-1 size-4 stroke-current" />
                    </a>
                </article>
            ))}
        </>
    );
}
