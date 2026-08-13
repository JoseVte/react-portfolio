<?php

use App\Http\Controllers\GitHubController;
use App\Http\Controllers\PlayroomController;
use App\Http\Controllers\SteamController;

Route::get('github', GitHubController::class)->name('github');

Route::get('steam', SteamController::class)->name('steam');

Route::get('playroom', PlayroomController::class)->name('playroom');
