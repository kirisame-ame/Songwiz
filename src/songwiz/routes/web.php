<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TrackController;
use App\Http\Controllers\ZipUploadController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});
Route::get('/index',[TrackController::class,'index']);
Route::get('/search',[TrackController::class,'search']);

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::post('/upload-json', [TrackController::class, 'store'])->name('tracks.store');
Route::get('/download-json', [TrackController::class, 'download'])->name('tracks.download');
Route::post('/cache', [ZipUploadController::class, 'cache'])->name('cache');
Route::post('/image-query', [TrackController::class, 'extractImageFeatures'])->name('image-query');
Route::post('/midi-query', [TrackController::class, 'extractMidiFeatures'])->name('midi-query');
Route::post('/audio-query', [TrackController::class, 'extractAudioFeatures'])->name('audio-query');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/database', function () {
    return Inertia::render('Database');
})->name('database');

require __DIR__.'/auth.php';
