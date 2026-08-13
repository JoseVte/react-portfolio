import LazyImg from '@/components/lazy-img';
import AttachGameModal from '@/components/sections/admin/attach-game-modal';
import UpdateGameModal from '@/components/sections/admin/update-game-modal';
import { PlayroomGame } from '@/types';
import { useForm } from '@inertiajs/react';
import { Button } from 'flowbite-react';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { ReactSortable } from 'react-sortablejs';

export default function Playroom() {
    const [loaded, setLoaded] = useState(false);
    const [games, setGames] = useState<PlayroomGame[]>([]);
    const [isShowModal, setIsShowModal] = useState(false);
    const [isShowModalGame, setIsShowModalGame] = useState(false);
    const [previewGame, setPreviewGame] = useState<PlayroomGame>();
    const { setData, put } = useForm<{ id: number[] }>();

    const categoriesEs = useMemo(() => {
        return _.uniq(_.map(games, (game) => game.category_es));
    }, [games]);

    const categoriesEn = useMemo(() => {
        return _.uniq(_.map(games, (game) => game.category_en));
    }, [games]);

    const uploadedGame = () => {
        setIsShowModal(false);
        refresh().then();
    };
    const openModalGame = (game: PlayroomGame) => {
        setPreviewGame(game);
        setIsShowModalGame(true);
    };

    const updatedGame = () => {
        toast.success('Updated "' + previewGame?.name + '"');
        setIsShowModalGame(false);
        setPreviewGame(undefined);
        refresh().then();
    };

    const deletedGame = () => {
        toast.success('Deleted "' + previewGame?.name + '"');
        setIsShowModalGame(false);
        setPreviewGame(undefined);
        refresh().then();
    };

    const saveGames = (sortedGames: PlayroomGame[]) => {
        setGames(sortedGames);
        setData({ id: sortedGames.map((game) => game.id) });
        put(route('playroom.sort'), {
            onFinish: () => {
                refresh().then();
            },
        });
    };

    const refreshPlayroom = () =>
        fetch(route('playroom.index'))
            .then((res) => res.json())
            .then((res) => setGames(res));

    const refresh = async () => {
        await refreshPlayroom();
    };

    if (!loaded) {
        setLoaded(true);
        refresh().then();
    }

    return (
        <>
            <div className="mt-6 flex w-full justify-between sm:mt-10">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-800 sm:text-3xl dark:text-zinc-100">Playroom</h2>

                <div className="flex items-center gap-4">
                    <Button color="green" className="cursor-pointer" type="button" onClick={refresh}>
                        Refresh
                    </Button>

                    <Button type="button" className="cursor-pointer" onClick={() => setIsShowModal(true)}>
                        Upload
                    </Button>
                </div>
            </div>

            <div className="mt-6 sm:mt-10">
                <Toaster position="top-right" />

                {isShowModal && (
                    <AttachGameModal
                        categoriesEn={categoriesEn}
                        categoriesEs={categoriesEs}
                        onUploaded={uploadedGame}
                        onCloseModal={() => setIsShowModal(false)}
                    />
                )}

                {previewGame && isShowModalGame && (
                    <UpdateGameModal
                        game={previewGame}
                        categoriesEn={categoriesEn}
                        categoriesEs={categoriesEs}
                        onUpdated={updatedGame}
                        onDeleted={deletedGame}
                        onCloseModal={() => setIsShowModalGame(false)}
                    />
                )}

                {games && (
                    <ReactSortable
                        list={games}
                        setList={saveGames}
                        className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    >
                        {games.map((game, index) => (
                            <div key={index} className="group relative flex cursor-pointer flex-col items-start" onClick={() => openModalGame(game)}>
                                <div className="relative mx-auto flex-none overflow-hidden rounded-xl bg-zinc-100 sm:rounded-2xl dark:bg-zinc-800">
                                    <LazyImg
                                        width={192}
                                        height={192}
                                        image={game.image_url}
                                        preImage={game.image_url}
                                        alt={game.name}
                                        className="absolute inset-0 h-full w-full object-cover grayscale group-hover:grayscale-0"
                                    />
                                </div>
                                <h3 className="mx-auto mt-6 text-base font-semibold text-zinc-800 dark:text-zinc-100">
                                    <div className="absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 sm:-inset-x-6 sm:rounded-2xl dark:bg-zinc-800/50" />
                                    <span className="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl" />
                                    <span className="relative z-10 break-all">{game.name}</span>
                                </h3>
                            </div>
                        ))}
                    </ReactSortable>
                )}
            </div>
        </>
    );
}
