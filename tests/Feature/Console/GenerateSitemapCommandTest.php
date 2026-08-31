<?php

use Illuminate\Support\Facades\File;

$originalSitemap = null;

beforeEach(function () {
    global $originalSitemap;

    $originalSitemap = File::exists(public_path('sitemap.xml')) ? File::get(public_path('sitemap.xml')) : null;
});

afterEach(function () {
    global $originalSitemap;

    if ($originalSitemap === null) {
        File::delete(public_path('sitemap.xml'));

        return;
    }

    File::put(public_path('sitemap.xml'), $originalSitemap);
});

it('writes a sitemap containing every public page', function () {
    File::delete(public_path('sitemap.xml'));

    $this->artisan('sitemap:generate')->assertSuccessful();

    expect(File::get(public_path('sitemap.xml')))
        ->toContain(route('homepage'))
        ->toContain(route('about'))
        ->toContain(route('projects'))
        ->toContain(route('more'));
});

it('never lists the admin page', function () {
    $this->artisan('sitemap:generate')->assertSuccessful();

    expect(File::get(public_path('sitemap.xml')))->not->toContain(route('admin'));
});
