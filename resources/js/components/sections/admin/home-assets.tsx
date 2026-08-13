import LazyImg from '@/components/lazy-img';
import DeleteImageModal from '@/components/sections/admin/delete-image-modal';
import UploadImageModal from '@/components/sections/admin/upload-image-modal';
import { Category, Image } from '@/types';
import { Button } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';

export default function HomeAssets() {
    const [isShowModal, setIsShowModal] = useState(false);
    const [isShowModalImage, setIsShowModalImage] = useState(false);

    const [previewImage, setPreviewImage] = useState<Image>();
    const [imagesByCategory, setImagesByCategory] = useState<{ [key: string]: Image[] }>({});
    const [categories, setCategories] = useState<Category[]>([]);

    const uploadedImage = () => {
        setIsShowModal(false);
        refresh().then();
    };
    const openModalImage = (image: Image) => {
        setPreviewImage(image);
        setIsShowModalImage(true);
    };
    const deletedImage = () => {
        toast.success('Deleted "' + previewImage?.original_name + '"');
        setIsShowModalImage(false);
        refresh().then();
    };

    const refreshImages = () =>
        fetch(route('assets.index'))
            .then((res) => res.json())
            .then((res) => setImagesByCategory(res));
    const refreshCategories = () =>
        fetch(route('categories'))
            .then((res) => res.json())
            .then((res) => setCategories(res));

    const refresh = async () => {
        await refreshCategories();
        await refreshImages();
    };

    useEffect(() => {
        refresh().then();
    }, []);

    return (
        <>
            <div className="mt-6 flex w-full justify-between sm:mt-10">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-800 sm:text-3xl dark:text-zinc-100">Assets</h2>

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

                {isShowModal && <UploadImageModal categories={categories} onUploaded={uploadedImage} onCloseModal={() => setIsShowModal(false)} />}

                {previewImage && isShowModalImage && (
                    <DeleteImageModal image={previewImage} onDeleted={deletedImage} onCloseModal={() => setIsShowModalImage(false)} />
                )}

                {Object.entries(imagesByCategory).map(([category, images]) => (
                    <div key={category}>
                        <h2 className="mb-6 w-full border-b pt-6 pb-3 text-2xl font-bold tracking-tight text-zinc-800 capitalize sm:mb-10 sm:pt-10 sm:pb-5 sm:text-3xl dark:text-zinc-100">
                            {category}
                        </h2>
                        <ul role="list" className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {images.map((image, index) => (
                                <li
                                    key={index}
                                    className="group relative flex cursor-pointer flex-col items-start"
                                    onClick={() => openModalImage(image)}
                                >
                                    <div className="relative mx-auto flex-none overflow-hidden rounded-xl bg-zinc-100 sm:rounded-2xl dark:bg-zinc-800">
                                        <LazyImg
                                            width={192}
                                            height={192}
                                            image={`/assets/${image.path}`}
                                            preImage={`/assets/${image.path}`}
                                            alt={image.original_name}
                                            className="absolute inset-0 h-full w-full object-cover grayscale group-hover:grayscale-0"
                                        />
                                    </div>
                                    <h3 className="mx-auto mt-6 text-base font-semibold text-zinc-800 dark:text-zinc-100">
                                        <div className="absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 sm:-inset-x-6 sm:rounded-2xl dark:bg-zinc-800/50" />
                                        <span className="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl" />
                                        <span className="relative z-10 break-all">{image.original_name}</span>
                                    </h3>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </>
    );
}
