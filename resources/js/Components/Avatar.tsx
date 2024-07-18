import {Link} from "@inertiajs/react";
import gravatar from "gravatar";
import LazyImg from "@/Components/LazyImg";
import {useTranslation} from "react-i18next";
import {HTMLAttributes} from "react";

export default function Avatar({large = false, className = '', style}: Readonly<{ large?: boolean } & HTMLAttributes<HTMLDivElement>>) {
    const {t} = useTranslation();
    const email = import.meta.env.VITE_PUBLIC_EMAIL;

    return (
        <Link
            href="/"
            aria-label="Home"
            className={`pointer-events-auto ${className}`}
            style={style}
        >
            <LazyImg
                image={gravatar.url(email, {s: '64'})}
                preImage={gravatar.url(email, {s: '16'})}
                alt={t('img-alt.home')}
                className={`rounded-full bg-zinc-100 object-cover dark:bg-zinc-800 max-h-full max-w-full ${large ? 'h-16 w-16' : 'h-9 w-9'}`}
            />
        </Link>
    )
}
