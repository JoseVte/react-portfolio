import InputAutocomplete from '@/components/input-autocomplete';
import InputError from '@/components/input-error';
import { useForm } from '@inertiajs/react';
import { Button, FileInput, Label, Modal, ModalBody, ModalFooter, ModalHeader, Textarea, TextInput } from 'flowbite-react';
import React, { ChangeEvent, useState } from 'react';

interface UploadPlayroomModalProps {
    categoriesEn: Array<string>;
    categoriesEs: Array<string>;
    onUploaded: () => void;
    onCloseModal: () => void;
}

export default function AttachGameModal({ categoriesEn, categoriesEs, onUploaded, onCloseModal }: Readonly<UploadPlayroomModalProps>) {
    const { data, setData, post, errors, reset } = useForm<{
        name: string;
        description_en: string;
        description_es: string;
        category_en: string;
        category_es: string;
        file?: Blob;
    }>({
        name: '',
        description_en: '',
        description_es: '',
        category_en: '',
        category_es: '',
        file: undefined,
    });

    const [previewUrl, setPreviewUrl] = useState('');

    const getPreview = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target?.files ? e.target?.files[0] : null;
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const submitForm = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('playroom.store'), {
            onSuccess: onUploaded,
        });
    };

    const closeModal = () => {
        reset();
        onCloseModal();
    };

    return (
        <Modal show={true} onClose={closeModal}>
            <form onSubmit={submitForm}>
                <ModalHeader>
                    <div className="flex items-center text-lg text-zinc-800 dark:text-zinc-100">Attach playroom</div>
                </ModalHeader>
                <ModalBody>
                    <div className="mb-5">
                        <div className="mb-2 block">
                            <Label htmlFor="name" className={errors.name ? 'text-red-700 dark:text-red-500' : 'text-gray-900 dark:text-white'}>
                                Name
                            </Label>
                        </div>
                        <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mb-5">
                        <div className="mb-2 block">
                            <Label
                                htmlFor="description_en"
                                className={errors.description_en ? 'text-red-700 dark:text-red-500' : 'text-gray-900 dark:text-white'}
                            >
                                Description (EN)
                            </Label>
                        </div>
                        <Textarea id="description_en" value={data.description_en} onChange={(e) => setData('description_en', e.target.value)} />
                        <InputError message={errors.description_en} className="mt-2" />
                    </div>

                    <div className="mb-5">
                        <div className="mb-2 block">
                            <Label
                                htmlFor="description_es"
                                className={errors.description_es ? 'text-red-700 dark:text-red-500' : 'text-gray-900 dark:text-white'}
                            >
                                Description (ES)
                            </Label>
                        </div>
                        <Textarea id="description_es" value={data.description_es} onChange={(e) => setData('description_es', e.target.value)} />
                        <InputError message={errors.description_es} className="mt-2" />
                    </div>

                    <div className="mb-5">
                        <div className="mb-2 block">
                            <Label
                                htmlFor="category_en"
                                className={errors.category_en ? 'text-red-700 dark:text-red-500' : 'text-gray-900 dark:text-white'}
                            >
                                Category (EN)
                            </Label>
                        </div>
                        <InputAutocomplete
                            value={data.category_en}
                            onChange={(e) => setData('category_en', e.target.value)}
                            autocompleteValues={categoriesEn}
                        />
                        <InputError message={errors.category_en} className="mt-2" />
                    </div>

                    <div className="mb-5">
                        <div className="mb-2 block">
                            <Label
                                htmlFor="category_es"
                                className={errors.category_es ? 'text-red-700 dark:text-red-500' : 'text-gray-900 dark:text-white'}
                            >
                                Category (ES)
                            </Label>
                        </div>
                        <InputAutocomplete
                            value={data.category_es}
                            onChange={(e) => setData('category_es', e.target.value)}
                            autocompleteValues={categoriesEs}
                        />
                        <InputError message={errors.category_es} className="mt-2" />
                    </div>

                    {previewUrl && (
                        <div id="preview" className="mb-5">
                            <div className="relative mx-auto aspect-9/10 h-48 flex-none overflow-hidden rounded-xl bg-zinc-100 sm:rounded-2xl dark:bg-zinc-800">
                                <img src={previewUrl} className="absolute inset-0 h-full w-full object-cover filter-none!" alt="Preview" />
                            </div>
                        </div>
                    )}

                    <label>
                        <span
                            className={
                                `mb-2 block text-sm font-medium ` + (errors.file ? 'text-red-700 dark:text-red-500' : 'text-gray-900 dark:text-white')
                            }
                        >
                            Image
                        </span>
                    </label>

                    <FileInput
                        onChange={(e) => {
                            setData('file', e.target.files ? e.target.files[0] : undefined);
                            getPreview(e);
                        }}
                    />
                    <InputError message={errors.file} className="mt-2" />
                </ModalBody>
                <ModalFooter>
                    <div className="flex justify-between gap-x-4">
                        <Button color="alternative" type={'button'} onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button color="green" type="submit">
                            Attach
                        </Button>
                    </div>
                </ModalFooter>
            </form>
        </Modal>
    );
}
