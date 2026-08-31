<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

class GenerateSitemapCommand extends Command
{
    /**
     * Public routes that belong in the sitemap, keyed by route name.
     */
    private const ROUTES = ['homepage', 'about', 'projects', 'more'];

    protected $signature = 'sitemap:generate';

    protected $description = 'Generate the sitemap.';

    public function handle(): void
    {
        $sitemap = Sitemap::create();

        foreach (self::ROUTES as $routeName) {
            $sitemap->add(
                Url::create(route($routeName))
                    ->setPriority(1.0)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
            );
        }

        $sitemap->writeToFile(public_path('sitemap.xml'));

        $this->info('Sitemap written to '.public_path('sitemap.xml'));
    }
}
