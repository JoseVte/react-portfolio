import InputError from '@/components/input-error';
import { Category } from '@/types';
import { useForm } from '@inertiajs/react';
import { Button, FileInput, Label, Modal, ModalBody, ModalFooter, ModalHeader, Select } from 'flowbite-react';
import React, { ChangeEvent, useState } from 'react';

interface UploadImageModalProps {
    categories: Array<Category>;
    onUploaded: () => void;
    onCloseModal: () => void;
}

export default function UploadImageModal({ categories, onUploaded, onCloseModal }: Readonly<UploadImageModalProps>) {
    const { data, setData, post, errors, reset } = useForm<{
        category: string;
        file?: Blob;
    }>({
        category: '',
        file: undefined,
    });

    const [previewUrl, setPreviewUrl] = useState('');

    const getPreview = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target?.files ? e.target?.files[0] : null;
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/api/assets', {
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
                    <div className="flex items-center text-lg text-zinc-800 dark:text-zinc-100">Upload file</div>
                </ModalHeader>
                <ModalBody>
                    <div className="mb-5">
                        <div className="mb-2 block">
                            <Label
                                htmlFor="categories"
                                className={errors.category ? 'text-red-700 dark:text-red-500' : 'text-gray-900 dark:text-white'}
                            >
                                Select image category
                            </Label>
                        </div>
                        <Select id="categories" value={data.category} onChange={(e) => setData('category', e.target.value)}>
                            <option>Select a category</option>
                            {categories.map((category) => (
                                <option key={category.value} value={category.value}>
                                    {category.name}
                                </option>
                            ))}
                        </Select>
                        <InputError message={errors.category} className="mt-2" />
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
                            File
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
                            Upload
                        </Button>
                    </div>
                </ModalFooter>
            </form>
        </Modal>
    );
}
