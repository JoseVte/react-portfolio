import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    image: string;
    preImage: string;
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
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [imageToLoad, setImageToLoad] = useState(image);

    useEffect(() => {
        // Detect initial theme
        const isDarkMode = document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);

        // Watch for theme changes
        const observer = new MutationObserver(() => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            setIsDark(isDarkMode);
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const imgDefers = document.getElementsByTagName('img');
        for (const imgDefer of imgDefers) {
            if (imgDefer.getAttribute('data-src')) {
                imgDefer.setAttribute('src', imgDefer.getAttribute('data-src') ?? '');
                imgDefer.setAttribute('lazy', 'loaded');
            }
        }
    });

    const getThemeColors = () => {
        if (isDark) {
            return {
                backgroundColor: '#27272a', // zinc-800
                textColor: '#d4d4d8', // zinc-300
            };
        }
        return {
            backgroundColor: '#f4f4f5', // zinc-100
            textColor: '#52525b', // zinc-600
        };
    };

    const themeColors = getThemeColors();

    const changeToErrorImage = () => {
        setImageError(true);
        if (errorImage) {
            setImageToLoad(errorImage);
        }
    };

    return (
        <div style={{ position: 'relative', width, height, overflow: withOverflow ? 'visible' : 'hidden' }}>
            <img
                width={width}
                height={height}
                className={className}
                loading={forceLoad ? 'eager' : 'lazy'}
                data-src={imageToLoad}
                src={preImage}
                alt={alt}
                title={title}
                onLoad={() => setImageLoaded(true)}
                onError={() => changeToErrorImage()}
                style={{ opacity: imageLoaded ? 1 : 0.5 }}
            />
            {(!imageLoaded || (imageError && !errorImage)) && (
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
                        backgroundColor: themeColors.backgroundColor,
                        color: themeColors.textColor,
                        fontSize: '14px',
                        textAlign: 'center',
                        padding: '10px',
                        fontWeight: '500',
                    }}
                >
                    {imageError ? t('lazy-img.error') : t('lazy-img.loading', { alt })}
                </div>
            )}
        </div>
    );
}
