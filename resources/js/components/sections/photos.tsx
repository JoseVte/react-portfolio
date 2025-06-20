import LazyImg from '@/components/lazy-img';
import { Image } from '@/types';
import _ from 'lodash';
import { useState } from 'react';
import { Rotate, Slide } from 'react-awesome-reveal';
import { useTranslation } from 'react-i18next';

export default function Photos() {
    const { t } = useTranslation();

    const rotations = ['rotate-2', '-rotate-2'];
    const [images, setImages] = useState<Image[]>([]);
    const [loaded, setLoaded] = useState(false);

    const getImages = async (type: string): Promise<Array<Image>> => {
        return await (await fetch(route('assets.show', type))).json();
    };

    if (!loaded) {
        setLoaded(true);
        Promise.all([getImages('cat'), getImages('mountain'), getImages('other'), getImages('travel')]).then((response) => {
            setImages(_.sampleSize(response[0].concat(response[1], response[2], response[3]), 5));
        });
    }

    return (
        <div className="mt-16 sm:mt-20">
            <Slide direction="up" triggerOnce>
                <div className="-my-4 flex justify-center gap-5 overflow-hidden py-4 sm:gap-8">
                    <Rotate triggerOnce cascade damping={0.2}>
                        {images.map((image, i) => (
                            <div
                                key={i}
                                className={`relative aspect-[9/10] w-44 flex-none overflow-hidden rounded-xl bg-zinc-100 sm:w-72 sm:rounded-2xl dark:bg-zinc-800 ${_.sample(rotations)}`}
                            >
                                <LazyImg
                                    image={`/assets/${image.path}`}
                                    preImage={`/assets/${image.path}`}
                                    className="absolute inset-0 h-full w-full object-cover"
                                    alt={t('img-alt.photo', { photo: i + 1 })}
                                />
                            </div>
                        ))}
                    </Rotate>
                </div>
            </Slide>
        </div>
    );
}
