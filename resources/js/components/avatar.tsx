import LazyImg from '@/components/lazy-img';
import { Link } from '@inertiajs/react';
import gravatar from 'gravatar';
import { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

export default function Avatar({
    large = false,
    className = '',
    customAvatarClass = '',
    maxSize = 64,
    style,
}: Readonly<
    {
        large?: boolean;
        maxSize?: number;
        customAvatarClass?: string;
    } & HTMLAttributes<HTMLDivElement>
>) {
    const { t } = useTranslation();
    const email = import.meta.env.VITE_PUBLIC_EMAIL;
    let iconSize = large ? 'h-16 w-16' : 'h-9 w-9';
    if (customAvatarClass) {
        iconSize = customAvatarClass;
    }

    return (
        <Link href="/" aria-label="Home" className={`pointer-events-auto ${className}`} style={style}>
            <LazyImg
                image={gravatar.url(email, { s: `${maxSize}` })}
                preImage={gravatar.url(email, { s: '16' })}
                alt={t('img-alt.home')}
                className={`max-h-full max-w-full rounded-full bg-zinc-100 object-cover dark:bg-zinc-800 ${iconSize}`}
            />
        </Link>
    );
}
