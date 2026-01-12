import { Image } from '@/types';
import { useForm } from '@inertiajs/react';
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'flowbite-react';
import { useState } from 'react';

interface DeleteImageModalProps {
    image: Image;
    onDeleted: () => void;
    onCloseModal: () => void;
}

export default function DeleteImageModal({ image, onDeleted, onCloseModal }: Readonly<DeleteImageModalProps>) {
    const closeModal = () => {
        onCloseModal();
    };

    const { delete: destroy } = useForm({});
    const [error, setError] = useState<Error | null>(null);

    const deleteImage = async () => {
        destroy(route('assets.destroy', { category: image.category, image: image.id }), {
            onSuccess: onDeleted,
            // @ts-expect-error Error type
            onError: (error: Error) => {
                setError(error);
                console.error(error);
            },
        });
    };

    return (
        <Modal show={true} onClose={closeModal}>
            <ModalHeader>
                <div className="flex items-center text-lg text-zinc-800 dark:text-zinc-100">{image.original_name}</div>
            </ModalHeader>
            <ModalBody>
                {error && <Alert className="mb-5">Error deleting image</Alert>}
                <div className="mb-5">
                    <div className="relative mx-auto aspect-9/10 w-full flex-none overflow-hidden rounded-xl bg-zinc-100 sm:rounded-2xl dark:bg-zinc-800">
                        <img src={image.url} className="absolute inset-0 h-full w-full object-cover filter-none!" alt={image.name} />
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <div className="flex justify-between gap-x-4">
                    <Button color="alternative" onClick={closeModal}>
                        Cancel
                    </Button>
                    <Button color="red" onClick={deleteImage}>
                        Delete
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
}
