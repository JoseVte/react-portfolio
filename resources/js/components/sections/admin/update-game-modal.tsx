import InputAutocomplete from '@/components/input-autocomplete';
import InputError from '@/components/input-error';
import { PlayroomGame } from '@/types';
import { useForm } from '@inertiajs/react';
import { Alert, Button, FileInput, Modal, ModalBody, ModalFooter, ModalHeader, Textarea, TextInput } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';

interface UpdatePlayroomModalProps {
    game: PlayroomGame;
    categoriesEn: Array<string>;
    categoriesEs: Array<string>;
    onUpdated: () => void;
    onDeleted: () => void;
    onCloseModal: () => void;
}

export default function UpdateGameModal({
    game,
    categoriesEn,
    categoriesEs,
    onUpdated,
    onDeleted,
    onCloseModal,
}: Readonly<UpdatePlayroomModalProps>) {
    const { data, setData, post, errors } = useForm<{
        name: string;
        description_en: string;
        description_es: string;
        category_en: string;
        category_es: string;
        file?: Blob;
    }>({
        name: game.name,
        description_en: game.description_en,
        description_es: game.description_es,
        category_en: game.category_en,
        category_es: game.category_es,
        file: undefined,
    });

    const { delete: destroy } = useForm({});
    const [hasDeleteError, setHasDeleteError] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    // Object URLs stay alive until revoked, so release the previous one on every change.
    useEffect(() => {
        if (!previewUrl) {
            return;
        }

        return () => URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    const pickFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        setData('file', file ?? undefined);
        setPreviewUrl(file ? URL.createObjectURL(file) : '');
    };

    const submitForm = () => {
        post(route('playroom.update', game.id), {
            onSuccess: onUpdated,
        });
    };

    const deleteGame = () => {
        destroy(route('playroom.destroy', game.id), {
            onSuccess: onDeleted,
            onError: () => setHasDeleteError(true),
        });
    };

    return (
        <Modal show={true} onClose={onCloseModal}>
            <ModalHeader>
                <div className="flex w-full flex-row items-center text-lg text-zinc-800 dark:text-zinc-100">
                    <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    <InputError message={errors.name} className="mt-2" />
                </div>
            </ModalHeader>
            <ModalBody>
                {hasDeleteError && <Alert className="mb-5">Error deleting game</Alert>}
                <div className="mb-5">
                    <div className="mx-auto w-full flex-none overflow-hidden rounded-xl bg-zinc-100 sm:rounded-2xl dark:bg-zinc-800">
                        <img src={previewUrl || game.image_url} className="max-h-80 w-full object-contain" alt={game.name} />
                    </div>

                    <div className="mt-2 mb-2 border-t border-gray-500 pt-2 text-lg font-semibold">Replace image</div>
                    <FileInput accept="image/*" onChange={pickFile} />
                    <InputError message={errors.file} className="mt-2" />

                    <div className="mt-2 mb-2 border-t border-gray-500 pt-2 text-lg font-semibold">Description (EN)</div>
                    <div>
                        <Textarea id="description_en" value={data.description_en} onChange={(e) => setData('description_en', e.target.value)} />
                        <InputError message={errors.description_en} className="mt-2" />
                    </div>
                    <div className="mt-2 mb-2 text-lg font-semibold">Description (ES)</div>
                    <div>
                        <Textarea id="description_es" value={data.description_es} onChange={(e) => setData('description_es', e.target.value)} />
                        <InputError message={errors.description_es} className="mt-2" />
                    </div>
                    <div className="mt-2 mb-2 text-lg font-semibold">Category (EN)</div>
                    <div>
                        <InputAutocomplete
                            value={data.category_en}
                            onChange={(e) => setData('category_en', e.target.value)}
                            autocompleteValues={categoriesEn}
                        />
                        <InputError message={errors.category_en} className="mt-2" />
                    </div>
                    <div className="mt-2 mb-2 text-lg font-semibold">Category (ES)</div>
                    <div>
                        <InputAutocomplete
                            value={data.category_es}
                            onChange={(e) => setData('category_es', e.target.value)}
                            autocompleteValues={categoriesEs}
                        />
                        <InputError message={errors.category_es} className="mt-2" />
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <div className="flex w-full justify-between gap-x-4">
                    <div className="flex items-center justify-center gap-x-4">
                        <Button color="alternative" onClick={onCloseModal}>
                            Cancel
                        </Button>
                        <Button color="red" onClick={deleteGame}>
                            Delete
                        </Button>
                    </div>
                    <Button color="green" onClick={submitForm}>
                        Update
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
}
