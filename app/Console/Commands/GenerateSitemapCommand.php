<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

class GenerateSitemapCommand extends Command
{
    protected $signature = 'sitemap:generate';

    protected $description = 'Generate the sitemap.';

    public function handle(): void
    {
        $sitemap = Sitemap::create()
            ->add(Url::create(route('homepage'))->setPriority(1.0))
            ->add(Url::create(route('projects'))->setPriority(1.0))
            ->add(Url::create(route('about'))->setPriority(1.0));

        $sitemap->writeToFile(public_path('sitemap.xml'));
    }
}
