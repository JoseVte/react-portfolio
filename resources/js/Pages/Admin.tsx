import {Head} from '@inertiajs/react';
import DefaultLayout from "@/Layouts/DefaultLayout";
import {useTranslation} from "react-i18next";
import Container from "@/Components/Container";
import LazyImg from "@/Components/LazyImg";
import { Button } from "flowbite-react";
import {useState} from "react";
import {Category, Image} from "@/types";
import {toast, Toaster} from "react-hot-toast";
import UploadImageModal from "@/Components/Sections/Admin/UploadImageModal";
import DeleteImageModal from "@/Components/Sections/Admin/DeleteImageModal";

export default function Admin() {
    const {t} = useTranslation();

    const title = t('layouts.admin.title')
    const description = t('layouts.admin.description')

    const [loaded, setLoaded] = useState(false);
    const [isShowModal, setIsShowModal] = useState(false);
    const [isShowModalImage, setIsShowModalImage] = useState(false);

    const [previewImage, setPreviewImage] = useState<Image>()
    const [imagesByCategory, setImagesByCategory] = useState<{ [key: string]: Image[] }>({});
    const [categories, setCategories] = useState<Category[]>([]);
    const refreshImages = () => fetch(route('assets.index')).then((res) => res.json()).then(res => setImagesByCategory(res));
    const refreshCategories = () => fetch(route('categories')).then((res) => res.json()).then(res => setCategories(res));

    const refresh = async () => {
        await refreshCategories();
        await refreshImages();
    }

    const uploadedImage = () => {
        setIsShowModal(false)
        refresh().then();
    }
    const openModalImage = (image: Image) => {
        setPreviewImage(image)
        setIsShowModalImage(true)
    }
    const deletedImage = () => {
        toast.success('Deleted "' + previewImage?.original_name + '"')
        setIsShowModalImage(false)
        refresh().then();
    }

    if (!loaded) {
        setLoaded(true);
        refresh().then()
    }

    return (
        <DefaultLayout>
            <Head title={title}>
                <meta head-key="description" name="description" content={description}/>
            </Head>

            <Container className="mt-16 sm:mt-32">
                <header className="w-full flex justify-between">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
                        {description}
                    </h1>

                    <div className="flex items-center gap-4">
                        <Button color="green" type="button" onClick={refresh}>Refresh</Button>

                        <Button type="button" onClick={() => setIsShowModal(true)}>Upload</Button>
                    </div>
                </header>

                <div className="mt-6 sm:mt-10">
                    <Toaster position="top-right"/>

                    {isShowModal &&
                        <UploadImageModal categories={categories}
                                          onUploaded={uploadedImage}
                                          onCloseModal={() => setIsShowModal(false)}/>
                    }

                    {previewImage && isShowModalImage &&
                        <DeleteImageModal image={previewImage}
                                          onDeleted={deletedImage}
                                          onCloseModal={() => setIsShowModalImage(false)}/>
                    }

                    {Object.entries(imagesByCategory).map(([category, images]) => (
                        <div key={category}>
                            <h2
                                className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-3xl pt-6 pb-3 mb-6 sm:pt-10 sm:pb-5 sm:mb-10 capitalize w-full border-b"
                            >
                                {category}
                            </h2>
                            <ul
                                role="list"
                                className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                            >
                                {images.map((image, index) => (
                                    <li key={index}
                                        className="group relative flex flex-col items-start cursor-pointer"
                                        onClick={() => openModalImage(image)}>
                                        <div
                                            className="relative aspect-[9/10] w-full flex-none overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 sm:rounded-2xl">
                                            <LazyImg
                                                image={`/assets/${image.path}`}
                                                preImage={`/assets/${image.path}`}
                                                alt={image.original_name}
                                                className="absolute inset-0 h-full w-full object-cover grayscale group-hover:grayscale-0"
                                            />
                                        </div>
                                        <h3 className="mt-6 text-base font-semibold text-zinc-800 dark:text-zinc-100">
                                            <div
                                                className="absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 dark:bg-zinc-800/50 sm:-inset-x-6 sm:rounded-2xl"/>
                                            <span
                                                className="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl"/>
                                            <span className="relative z-10 break-all">{image.original_name}</span>
                                        </h3>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </Container>
        </DefaultLayout>
    )
}
