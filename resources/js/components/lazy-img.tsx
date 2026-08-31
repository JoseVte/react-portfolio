import { useIsDarkMode } from '@/hooks/use-dark-mode';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const PLACEHOLDER_COLORS = {
    dark: { backgroundColor: '#27272a', textColor: '#d4d4d8' },
    light: { backgroundColor: '#f4f4f5', textColor: '#52525b' },
} as const;

export default function LazyImg({
    image,
    preImage,
    errorImage = undefined,
    alt,
    className = '',
    title = '',
    width = undefined,
    height = undefined,
    forceLoad = false,
    withOverflow = false,
}: Readonly<{
    image?: string | null;
    preImage?: string | null;
    errorImage?: string;
    alt: string;
    className?: string;
    title?: string;
    width?: number;
    height?: number;
    forceLoad?: boolean;
    withOverflow?: boolean;
}>) {
    const { t } = useTranslation();
    const isDark = useIsDarkMode();

    const [isLoaded, setIsLoaded] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);

    // Reset the loading state whenever the component is pointed at another image.
    useEffect(() => {
        setIsLoaded(false);
        setHasFailed(false);
    }, [image]);

    const source = (hasFailed && errorImage ? errorImage : image) ?? '';
    const preview = preImage && preImage !== source ? preImage : '';
    const showPlaceholder = !source || (hasFailed ? !errorImage : !isLoaded && !preview);
    const { backgroundColor, textColor } = PLACEHOLDER_COLORS[isDark ? 'dark' : 'light'];

    return (
        <div style={{ position: 'relative', width, height, overflow: withOverflow ? 'visible' : 'hidden' }}>
            {/* Blurred stand-in, dropped once the real image is visible: a positioned element
                would otherwise keep painting on top of its in-flow sibling whatever the DOM
                order is. */}
            {preview && !isLoaded && (
                <img
                    aria-hidden
                    alt=""
                    width={width}
                    height={height}
                    className={className}
                    src={preview}
                    style={{ position: 'absolute', top: 0, left: 0, filter: 'blur(16px)' }}
                />
            )}

            {source && (
                <img
                    width={width}
                    height={height}
                    className={className}
                    loading={forceLoad ? 'eager' : 'lazy'}
                    decoding="async"
                    src={source}
                    alt={alt}
                    title={title}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasFailed(true)}
                    style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 200ms ease-in-out' }}
                />
            )}

            {showPlaceholder && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor,
                        color: textColor,
                        fontSize: '14px',
                        textAlign: 'center',
                        padding: '10px',
                        fontWeight: '500',
                    }}
                >
                    {hasFailed ? t('lazy-img.error') : t('lazy-img.loading', { alt })}
                </div>
            )}
        </div>
    );
}
