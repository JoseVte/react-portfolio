import Container from '@/components/container';
import { DateCalendarSearch, DateCalendarUp } from '@/components/icons/date';
import Forks from '@/components/icons/github/forks';
import Issues from '@/components/icons/github/issues';
import Stargazers from '@/components/icons/github/stargazers';
import HomepageLink from '@/components/icons/homepage-link';
import Blade from '@/components/icons/languages/blade';
import Link from '@/components/icons/link';
import LazyImg from '@/components/lazy-img';
import { useAppearance } from '@/hooks/use-appearance';
import DefaultLayout from '@/layouts/default-layout';
import { GitHubRepository } from '@/types';
import { Head } from '@inertiajs/react';
import { Select } from 'flowbite-react';
import _ from 'lodash';
import React, { JSX, lazy, ReactElement, Suspense, useState } from 'react';
import { Activity, BlockElement, Props as CalendarProps } from 'react-activity-calendar';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ThreeDot } from 'react-loading-indicators';
import { Tooltip as ReactTooltip } from 'react-tooltip';

const GitHubCalendar = lazy(() =>
    import('react-github-calendar').then((module) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        /* @ts-expect-error */
        const component = module.default || module.GitHubCalendar || module;
        return { default: component };
    }),
);
export default function Projects() {
    const { t, i18n } = useTranslation();
    const { appearance, updateAppearance } = useAppearance();

    const [year, setYear] = useState<string>(`${new Date().getFullYear()}`);
    const years = Array.from({ length: new Date().getFullYear() - 2012 }, (_, i) => new Date().getFullYear() - i);

    const title = t('layouts.projects.title');
    const description = t('layouts.projects.description');

    const [projects, setProjects] = useState<GitHubRepository[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    const getSearchParams = (extraParams?: { [key: string]: number | string }) => {
        extraParams = extraParams || {};
        const searchParams = new URL(window.location.href).searchParams;
        const params: { [key: string]: number | string } = {};

        for (const [key, value] of searchParams.entries()) {
            params[key] = value;
        }

        _.forEach(extraParams, (value, key) => {
            params[key] = value.toString();
        });

        return params;
    };

    if (!loaded) {
        setLoaded(true);
        fetch(route('github', { ...getSearchParams() }))
            .then((res) => res.json())
            .then((data: GitHubRepository[]) => setProjects(data));
    }

    const fetchNextPage = () => {
        fetch(route('github', { ...getSearchParams({ page: page + 1 }) }))
            .then((res) => res.json())
            .then((data: GitHubRepository[]) => {
                setProjects([...projects, ...data]);
                setPage(page + 1);
                if (data.length === 0) {
                    setHasMore(false);
                }
            });
    };

    const formatDate = (dateString: string): string => {
        return new Date(`${dateString}`).toLocaleString(i18n.resolvedLanguage, {
            hour: 'numeric',
            minute: 'numeric',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        });
    };

    const getLanguageIcon = (language: string | undefined): JSX.Element => {
        switch (language) {
            case 'Blade':
                return <Blade className="size-6" />;
            case 'Dockerfile':
            case 'DockerFile':
                return (
                    <LazyImg
                        className="size-6"
                        width={24}
                        height={24}
                        image="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg"
                        preImage="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg"
                        alt={language}
                    />
                );
            case 'html':
            case 'HTML':
                return (
                    <LazyImg
                        className="size-6"
                        width={24}
                        height={24}
                        image="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg"
                        preImage="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg"
                        alt={language}
                    />
                );
            case 'vue':
            case 'Vue':
                return (
                    <LazyImg
                        className="size-6"
                        width={24}
                        height={24}
                        image="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg"
                        preImage="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg"
                        alt={language}
                    />
                );
            case 'shell':
            case 'Shell':
                return (
                    <LazyImg
                        className="size-6"
                        width={24}
                        height={24}
                        image="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bash/bash-original.svg"
                        preImage="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bash/bash-original.svg"
                        alt={language}
                    />
                );
            case undefined:
            case null:
                return (
                    <LazyImg
                        className="size-6"
                        width={24}
                        height={24}
                        image={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg`}
                        preImage={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg`}
                        alt="Repository"
                    />
                );
            default:
                return (
                    <LazyImg
                        className="size-6"
                        width={24}
                        height={24}
                        image={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${language.toLowerCase()}/${language.toLowerCase()}-original.svg`}
                        preImage={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${language.toLowerCase()}/${language.toLowerCase()}-original.svg`}
                        alt={language}
                    />
                );
        }
    };

    const labels = {
        months: [
            t('month.1'),
            t('month.2'),
            t('month.3'),
            t('month.4'),
            t('month.5'),
            t('month.6'),
            t('month.7'),
            t('month.8'),
            t('month.9'),
            t('month.10'),
            t('month.11'),
            t('month.12'),
        ],
        weekdays: [t('week.1'), t('week.2'), t('week.3'), t('week.4'), t('week.5'), t('week.6'), t('week.7')],
        totalCount: t('calendar.total'),
        legend: {
            less: t('less'),
            more: t('more'),
        },
    } satisfies CalendarProps['labels'];

    const showTooltip = (block: BlockElement, activity: Activity): ReactElement =>
        React.cloneElement(block, {
            'data-tooltip-id': 'calendar-tooltip',
            'data-tooltip-html': t('calendar.tooltip', { count: activity.count, date: activity.date }),
        });

    return (
        <DefaultLayout appearance={appearance} updateAppearance={updateAppearance}>
            <Head title={title}>
                <meta head-key="description" name="description" content={description} />

                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />

                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
            </Head>

            <Container className="mt-16 sm:mt-32">
                <header className="max-w-2xl">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">{description}</h1>
                    <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">{t('projects.description')}</p>
                </header>
                <div className="mt-16 sm:mt-20">
                    <div className="my-4 flex w-full items-center justify-start gap-4 sm:w-auto sm:justify-end">
                        <Select value={year} icon={DateCalendarSearch} onChange={(e) => setYear(e.target.value)}>
                            <option>Select a year</option>
                            {years.map((year_number) => (
                                <option key={year_number} value={year_number}>
                                    {year_number}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div className="flex w-full items-center justify-center">
                        <Suspense fallback={<div className="h-37.5" />}>
                            <GitHubCalendar
                                labels={labels}
                                weekStart={1}
                                year={parseInt(year)}
                                showColorLegend
                                renderBlock={showTooltip}
                                colorScheme={appearance === 'system' ? undefined : appearance}
                                username="josevte"
                            />
                        </Suspense>
                    </div>
                    <ReactTooltip id="calendar-tooltip" />
                </div>
                <div className="mt-16 sm:mt-20">
                    <InfiniteScroll
                        className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
                        style={{ overflow: 'visible' }}
                        next={fetchNextPage}
                        hasMore={hasMore}
                        loader={
                            <div className="col-span-3 flex items-center justify-center">
                                <ThreeDot variant="bounce" color="oklch(0.852 0.199 91.936)" size="medium" text="" textColor="" />
                            </div>
                        }
                        dataLength={projects.length}
                    >
                        {projects.map((project: GitHubRepository, index) => (
                            <div key={index} className="group relative flex flex-col items-start">
                                <div className="grid grid-cols-[50px_1fr] items-center gap-x-1 gap-y-2">
                                    <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-white shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
                                        <div className="size-8 overflow-hidden rounded-full">
                                            <LazyImg
                                                image={project.owner.avatar_url}
                                                preImage={project.owner.avatar_url}
                                                alt={project.owner.login}
                                                className="size-8"
                                            />
                                        </div>
                                    </div>
                                    <strong className="italic">{project.owner.login}</strong>

                                    <div className="z-10 mx-auto mt-2 flex size-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-700">
                                        {getLanguageIcon(project.language)}
                                    </div>
                                    <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
                                        <div className="absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 sm:-inset-x-6 sm:rounded-2xl dark:bg-zinc-800/50" />
                                        <a className="flex items-center gap-2" target="_blank" href={project.html_url}>
                                            <span className="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl" />
                                            <span className="relative z-10">{project.name}</span>
                                        </a>
                                    </h2>
                                    <div className="col-start-2 flex flex-col items-start">
                                        <p className="relative z-10 text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="relative z-30 my-4 flex justify-between gap-4 rounded-2xl border px-4 py-2 text-sm">
                                            <a target="_blank" href={project.html_url} className="flex items-center gap-2" aria-label="github-link">
                                                <Stargazers className="size-4 fill-current" />
                                                <div>{project.stargazers_count}</div>
                                            </a>
                                            <a
                                                target="_blank"
                                                href={project.html_url + '/fork'}
                                                className="flex items-center gap-2"
                                                aria-label="github-link"
                                            >
                                                <Forks className="size-4 fill-current" />
                                                <div>{project.forks_count}</div>
                                            </a>
                                            <a
                                                target="_blank"
                                                href={project.html_url + '/issues'}
                                                className="flex items-center gap-2"
                                                aria-label="github-link"
                                            >
                                                <Issues className="size-4 fill-current" />
                                                <div>{project.open_issues_count}</div>
                                            </a>
                                        </div>
                                    </div>
                                    {project.homepage && (
                                        <>
                                            <a
                                                href={project.homepage}
                                                target="_blank"
                                                className="relative z-20 mx-auto flex justify-center text-sm font-medium text-zinc-400 transition group-hover:text-teal-500 dark:text-zinc-200 dark:hover:text-yellow-500"
                                            >
                                                <HomepageLink className="size-5 flex-none" />
                                            </a>
                                            <a
                                                href={project.homepage}
                                                title={project.homepage}
                                                target="_blank"
                                                className="relative z-20 block truncate text-sm font-medium text-zinc-400 transition group-hover:text-teal-500 dark:text-zinc-200 dark:hover:text-yellow-500"
                                            >
                                                {project.homepage}
                                            </a>
                                        </>
                                    )}
                                    <Link className="z-10 mx-auto size-6 flex-none" />
                                    <span className="z-10 text-sm font-medium text-zinc-400 transition group-hover:text-teal-500 dark:text-zinc-200 dark:group-hover:text-yellow-500">
                                        github.com
                                    </span>

                                    <DateCalendarUp className="z-10 m-auto size-5 flex-none" />
                                    <time
                                        className="z-10 text-xs text-zinc-400 transition group-hover:text-teal-500 dark:text-zinc-200"
                                        dateTime={project.updated_at}
                                    >
                                        {formatDate(project.updated_at)}
                                    </time>
                                </div>
                            </div>
                        ))}
                    </InfiniteScroll>
                </div>
            </Container>
        </DefaultLayout>
    );
}
