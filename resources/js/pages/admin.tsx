import Container from '@/components/container';
import HomeAssets from '@/components/sections/admin/home-assets';
import Playroom from '@/components/sections/admin/playroom';
import DefaultLayout from '@/layouts/default-layout';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function Admin() {
    const { t } = useTranslation();

    const title = t('layouts.admin.title');
    const description = t('layouts.admin.description');

    return (
        <DefaultLayout>
            <Head title={title}>
                <meta head-key="description" name="description" content={description} />
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <Container className="mt-16 sm:mt-32">
                <header className="flex w-full justify-between">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">{description}</h1>
                </header>

                <HomeAssets />

                <Playroom />
            </Container>
        </DefaultLayout>
    );
}
