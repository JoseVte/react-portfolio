import Container from '@/components/container';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function AppFooter({ navLinks }: Readonly<{ navLinks: object }>) {
    const { t } = useTranslation();

    const [isServer, setIsServer] = useState(true);
    useEffect(() => setIsServer(false), []);

    return (
        <footer className="mt-32">
            <Container>
                <div className="-mx-4 border-t border-zinc-100 px-4 pt-10 pb-16 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 dark:border-zinc-700/40">
                    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            {Object.entries(navLinks).map(([url, text]) => (
                                <Link key={url} className="transition hover:text-yellow-500 dark:hover:text-yellow-400" href={url}>
                                    {text}
                                </Link>
                            ))}
                        </div>
                        <p className="text-sm text-zinc-400 dark:text-zinc-500">
                            &copy; {isServer ? '' : new Date().getFullYear()} Josrom. {t('footer.copy')}
                        </p>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
