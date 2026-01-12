import _ from 'lodash';
import { useEffect, useState } from 'react';

export function useScroll() {
    const [isOnTop, setIsOnTop] = useState<boolean>();

    useEffect(() => {
        const scrollY = _.clamp(window.scrollY, 0, document.body.scrollHeight - window.innerHeight);

        const onChange = () => {
            const scrollY = _.clamp(window.scrollY, 0, document.body.scrollHeight - window.innerHeight);

            setIsOnTop(scrollY === 0);
        };

        document.addEventListener('scroll', onChange);
        setIsOnTop(scrollY === 0);

        return () => document.removeEventListener('scroll', onChange);
    }, []);

    return !!isOnTop;
}
