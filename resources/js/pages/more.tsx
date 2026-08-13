import Container from '@/components/container';
import LazyImg from '@/components/lazy-img';
import { useAppearance } from '@/hooks/use-appearance';
import DefaultLayout from '@/layouts/default-layout';
import { PlayroomGame, SteamInfo } from '@/types';
import { nl2br } from '@/utils';
import { Head } from '@inertiajs/react';
import { Modal, ModalBody, ModalHeader } from 'flowbite-react';
import { useState } from 'react';
import Marquee from 'react-fast-marquee';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';

export default function More() {
    const { t, i18n } = useTranslation();
    const { appearance, updateAppearance } = useAppearance();

    const title = t('layouts.more.title');
    const description = t('layouts.more.description');

    const [steam, setSteam] = useState<SteamInfo>();
    const [loadedSteam, setLoadedSteam] = useState(false);

    const [playroomGames, setPlayroomGames] = useState<PlayroomGame[]>([]);
    const [loadedPlayroomGames, setLoadedPlayroomGames] = useState(false);

    const [isShowModal, setIsShowModal] = useState(false);
    const [playroomGameModal, setPlayroomGameModal] = useState<PlayroomGame>();

    if (!loadedSteam) {
        setLoadedSteam(true);
        fetch(route('steam'))
            .then((res) => res.json())
            .then((data: SteamInfo) => setSteam(data));
    }

    if (!loadedPlayroomGames) {
        setLoadedPlayroomGames(true);
        fetch(route('playroom'))
            .then((res) => res.json())
            .then((data: PlayroomGame[]) => setPlayroomGames(data));
    }

    const openDetailGame = (game: PlayroomGame) => {
        setPlayroomGameModal(game);
        setIsShowModal(true);
    };

    const closeModal = () => {
        setPlayroomGameModal(undefined);
        setIsShowModal(false);
    };

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
                </header>

                <div className="mt-16 space-y-4 sm:mt-20">
                    <h2 className="text-2xl font-semibold text-zinc-700 sm:text-3xl dark:text-zinc-200">{t('playroom.title')}</h2>

                    <div className="text-lg">{t('playroom.description')}</div>

                    <div className="flex flex-wrap gap-4">
                        {playroomGames.map((game, index) => (
                            <div key={index} className="relative cursor-pointer rounded" onClick={() => openDetailGame(game)}>
                                <LazyImg image={game.image_url} preImage={game.image_url} alt={game.name} className="size-32 rounded object-cover" />
                            </div>
                        ))}
                    </div>

                    {playroomGameModal && (
                        <Modal dismissible show={isShowModal} onClose={closeModal}>
                            <ModalHeader>
                                <div className="flex items-center text-xl text-zinc-800 dark:text-zinc-100">{playroomGameModal.name}</div>
                            </ModalHeader>
                            <ModalBody>
                                <div className="mx-auto w-full flex-none overflow-hidden rounded-xl bg-zinc-100 sm:rounded-2xl dark:bg-zinc-800">
                                    <img
                                        src={playroomGameModal.image_url}
                                        className="max-h-80 w-full object-contain filter-none!"
                                        alt={playroomGameModal.name}
                                    />
                                </div>

                                <div className="my-4 w-auto">
                                    <div className="inline-block rounded-full bg-zinc-300 px-4 py-1 text-zinc-800 dark:bg-zinc-600 dark:text-zinc-100">
                                        {i18n.resolvedLanguage === 'es' ? playroomGameModal.category_es : playroomGameModal.category_en}
                                    </div>
                                </div>

                                <p className="text-justify">
                                    {nl2br(i18n.resolvedLanguage === 'es' ? playroomGameModal.description_es : playroomGameModal.description_en)}
                                </p>
                            </ModalBody>
                        </Modal>
                    )}

                    <h2 className="text-2xl font-semibold text-zinc-700 sm:text-3xl dark:text-zinc-200">{t('steam.title')}</h2>

                    <div className="text-lg">{t('steam.description')}</div>

                    <h3 className="text-xl font-semibold text-zinc-700 sm:text-2xl dark:text-zinc-200">{t('recently-played')}</h3>

                    <div className="grid grid-cols-3 gap-4">
                        {steam?.recently_games?.map((game, index) => (
                            <div key={index} className="group relative rounded">
                                <LazyImg image={game.style.image} preImage={game.style.capsule_image} alt={game.name} className="rounded" />

                                <div className="absolute inset-0 hidden items-center justify-center rounded bg-[rgba(0,0,0,0.6)] group-hover:flex">
                                    <a className="block w-full p-4" href={game.steam_url} target="_blank">
                                        <Marquee speed={50} delay={5}>
                                            <span className="px-4 text-sm sm:text-lg sm:font-semibold">{game.name}</span>
                                        </Marquee>

                                        <div className="hidden text-center text-xs md:block lg:text-base">
                                            {t('played-2-weeks')}: {(game.time['2weeks'] / 60).toFixed(2)}h<br />
                                            {t('played-total')}: {(game.time.total / 60).toFixed(2)}h
                                        </div>
                                    </a>
                                </div>

                                <div className="absolute right-4 bottom-2 left-4 hidden h-1.5 rounded bg-gray-500 group-hover:block">
                                    <div
                                        className="h-full rounded"
                                        style={{
                                            backgroundColor: game.achievements.current === game.achievements.total ? 'yellow' : 'orange',
                                            width: (game.achievements.current / game.achievements.total) * 100 + '%',
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h3 className="text-xl font-semibold text-zinc-700 sm:text-2xl dark:text-zinc-200">{t('owned-games')}</h3>

                    <div className="flex flex-wrap justify-between gap-4">
                        {steam?.owned_games?.map((game, key) => (
                            <a
                                key={key}
                                data-tooltip-id="owned-game-tooltip"
                                data-tooltip-content={game.name}
                                data-tooltip-time-2weeks={(game.time['2weeks'] / 60).toFixed(2)}
                                data-tooltip-time-total={(game.time.total / 60).toFixed(2)}
                                className="block rounded"
                                href={game.steam_url}
                                target="_blank"
                            >
                                <LazyImg
                                    className="rounded"
                                    image={game.icon_url}
                                    errorImage={game.default_icon_url}
                                    preImage={game.default_icon_url}
                                    alt={game.name}
                                />
                            </a>
                        ))}
                    </div>
                    <Tooltip
                        id="owned-game-tooltip"
                        render={({ content, activeAnchor }) => (
                            <span>
                                <strong>{content}</strong>
                                <br />
                                {t('played-2-weeks')}: {activeAnchor?.getAttribute('data-tooltip-time-2weeks')}h
                                <br />
                                {t('played-total')}: {activeAnchor?.getAttribute('data-tooltip-time-total')}h
                            </span>
                        )}
                    />
                </div>
            </Container>
        </DefaultLayout>
    );
}
