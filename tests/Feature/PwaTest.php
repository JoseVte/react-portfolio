<?php

use Illuminate\Support\Facades\File;

it('ships a manifest, a service worker and an offline page', function (string $file) {
    expect(File::exists(public_path($file)))->toBeTrue("public/{$file} is missing");
})->with(['manifest.json', 'sw.js', 'offline.html']);

it('ships every icon the manifest points at', function () {
    $manifest = json_decode(File::get(public_path('manifest.json')), true);

    foreach ($manifest['icons'] as $icon) {
        expect(File::exists(public_path(ltrim($icon['src'], '/'))))->toBeTrue("{$icon['src']} is missing");
    }
});

it('keeps the manifest installable', function () {
    $manifest = json_decode(File::get(public_path('manifest.json')), true);

    expect($manifest)
        ->toHaveKeys(['name', 'short_name', 'start_url', 'display', 'background_color', 'theme_color', 'icons'])
        ->and($manifest['display'])->toBeIn(['standalone', 'fullscreen', 'minimal-ui']);

    $sizes = collect($manifest['icons'])->pluck('sizes');

    expect($sizes)->toContain('192x192')->toContain('512x512')
        ->and(collect($manifest['icons'])->pluck('purpose'))->toContain('maskable')
        ->and(collect($manifest['icons'])->pluck('type')->unique()->all())->toBe(['image/png']);
});

it('keeps the manifest in sync with the pwa config', function () {
    $manifest = json_decode(File::get(public_path('manifest.json')), true);

    expect($manifest['name'])->toBe(config('pwa.manifest.name'))
        ->and($manifest['short_name'])->toBe(config('pwa.manifest.short_name'))
        ->and($manifest['theme_color'])->toBe(config('pwa.manifest.theme_color'))
        ->and($manifest['background_color'])->toBe(config('pwa.manifest.background_color'))
        ->and($manifest['display'])->toBe(config('pwa.manifest.display'));
});

it('precaches the offline page in the service worker', function () {
    $serviceWorker = File::get(public_path('sw.js'));

    expect($serviceWorker)
        ->toContain('/offline.html')
        ->toContain("addEventListener('install'")
        ->toContain("addEventListener('activate'")
        ->toContain("addEventListener('fetch'");
});

it('links the manifest and registers the service worker on every page', function () {
    $response = $this->get(route('homepage'));

    $response->assertOk()
        ->assertSee('rel="manifest"', false)
        ->assertSee('navigator.serviceWorker.register', false)
        ->assertSee('name="theme-color"', false);
});

it('serves the service worker as javascript from the site root', function () {
    // The scope of a service worker cannot be broader than its own path.
    expect(File::get(public_path('sw.js')))->toContain('self.location.origin');
});
