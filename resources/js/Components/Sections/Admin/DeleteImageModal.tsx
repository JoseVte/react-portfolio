import {Image} from "@/types";
import {Alert, Button, Modal} from "flowbite-react";
import {useForm} from "@inertiajs/react";
import {useState} from "react";

interface DeleteImageModalProps {
    image: Image,
    onDeleted: () => void,
    onCloseModal: () => void
}

export default function DeleteImageModal({image, onDeleted, onCloseModal}: Readonly<DeleteImageModalProps>) {
    const closeModal = () => {
        onCloseModal();
    }

    const {delete: destroy} = useForm({})
    const [error, setError] = useState<Error | null>(null);

    const deleteImage = async () => {
        destroy(route('assets.destroy', {category: image.category, image: image.id}), {
            onSuccess: onDeleted,
            // @ts-ignore
            onError: (error: Error) => {
                setError(error)
                console.error(error);
            }
        })
    }

    return (
        <Modal show={true} onClose={closeModal}>
            <Modal.Header>
                <div className="flex items-center text-lg text-zinc-800 dark:text-zinc-100">
                    {image.original_name}
                </div>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert className="mb-5">Error deleting image</Alert>}
                <div className="mb-5">
                    <div
                        className="relative aspect-[9/10] w-full mx-auto flex-none overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 sm:rounded-2xl">
                        <img
                            src={image.url}
                            className="absolute inset-0 h-full w-full object-cover !filter-none"
                            alt={image.name}/>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="flex justify-between">
                    <Button
                        color="alternative"
                        onClick={closeModal}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="red"
                        onClick={deleteImage}
                    >
                        Delete
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    )
}
