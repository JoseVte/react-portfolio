<?php

use App\Http\Controllers\HandleImageController;
use App\Http\Middleware\IpMiddleware;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'homepage')->name('homepage');
Route::inertia('about', 'about')->name('about');
Route::inertia('projects', 'projects')->name('projects');
Route::inertia('more', 'more')->name('more');

Route::middleware(IpMiddleware::class)->group(function () {
    include 'admin.php';
});

Route::get('assets/{image:path}', HandleImageController::class)->name('assets')->where('image', '.*');

Route::get('images/{image:path}', HandleImageController::class)->name('images')->where('image', '.*');
