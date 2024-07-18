import Container from "@/Components/Container";
import {Link} from "@inertiajs/react";
import {useTranslation} from "react-i18next";

export default function AppFooter({navLinks}: Readonly<{ navLinks: object }>) {
    const {t} = useTranslation();

    return (
        <footer className="mt-32">
            <Container>
                <div
                    className="border-t border-zinc-100 pb-16 pt-10 dark:border-zinc-700/40 -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12"
                >
                    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                        <div
                            className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-medium text-zinc-800 dark:text-zinc-200"
                        >
                            {Object.entries(navLinks).map(([url, text], key) => (
                                <Link key={url}
                                      className="transition hover:text-teal-500 dark:hover:text-teal-400"
                                      href={url}>
                                    {text}
                                </Link>
                            ))}
                        </div>
                        <p className="text-sm text-zinc-400 dark:text-zinc-500">
                            &copy; {new Date().getFullYear()} Josrom. {t('footer.copy')}
                        </p>
                    </div>
                </div>
            </Container>
        </footer>
    )
}
