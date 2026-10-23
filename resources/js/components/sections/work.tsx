import Briefcase from '@/components/icons/briefcase';
import LazyImg from '@/components/lazy-img';
import type { ResumeSchema } from '@kurone-kito/jsonresume-types';
import { useTranslation } from 'react-i18next';
import _resumeEn from '../../../assets/resume/en.json';
import _resumeEs from '../../../assets/resume/es.json';

export default function Work() {
    const { t, i18n } = useTranslation();
    const resumeEn = _resumeEn as ResumeSchema;
    const resumeEs = _resumeEs as ResumeSchema;
    const resume = i18n.resolvedLanguage === 'en' ? resumeEn.work : resumeEs.work;

    return (
        <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
            <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                <Briefcase className="size-6 flex-none" />
                <span className="ml-3">{t('index.work')}</span>
            </h2>
            <ol className="mt-6 space-y-4">
                {resume?.map((role, index) => (
                    <li key={index} className="group flex gap-4">
                        <div className="relative mt-1 flex size-10 flex-none items-center justify-center overflow-hidden rounded-full shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
                            <div className="size-7 overflow-hidden rounded-full">
                                <LazyImg
                                    width={200}
                                    height={200}
                                    title={role.name ?? ''}
                                    image={`/images/logos/${role.name}.jpeg`}
                                    preImage={`/images/logos/${role.name}.jpeg`}
                                    alt=""
                                    className="size-7"
                                />
                            </div>
                        </div>
                        <dl className="flex flex-auto flex-wrap gap-x-2">
                            <dt className="sr-only">{t('index.company')}</dt>
                            <dd className="w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {role.url ? (
                                    <a
                                        href={role.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="transition-all group-hover:text-yellow-700 dark:group-hover:text-yellow-400"
                                    >
                                        {role.name}
                                    </a>
                                ) : (
                                    role.name
                                )}
                            </dd>
                            <dt className="sr-only">{t('index.role')}</dt>
                            <dd className="text-xs text-zinc-500 dark:text-zinc-300">{role.position}</dd>
                            <dt className="sr-only">{t('index.date')}</dt>
                            <dd className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
                                <time dateTime={role.startDate}>{role.startDate}</time> {t('index.until')}{' '}
                                {role.endDate ? <time dateTime={role.endDate}>{role.endDate}</time> : t('index.present')}
                            </dd>
                        </dl>
                    </li>
                ))}
            </ol>
        </div>
    );
}
