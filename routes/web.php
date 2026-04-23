<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DetectionController;
use App\Http\Controllers\DiseaseController;
use App\Http\Controllers\ExpertSystemController;
use App\Http\Controllers\WeatherController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Detection (ML-based)
    Route::get('detection', [DetectionController::class, 'index'])->name('detection.index');
    Route::post('detection', [DetectionController::class, 'store'])->middleware('throttle:10,1')->name('detection.store');
    Route::get('detection/history', [DetectionController::class, 'history'])->name('detection.history');
    Route::get('detection/{detection}', [DetectionController::class, 'show'])->name('detection.show');

    // Expert System
    Route::get('expert-system', [ExpertSystemController::class, 'index'])->name('expert-system.index');
    Route::post('expert-system/diagnose', [ExpertSystemController::class, 'diagnose'])->middleware('throttle:20,1')->name('expert-system.diagnose');
    Route::post('expert-system', [ExpertSystemController::class, 'store'])->middleware('throttle:10,1')->name('expert-system.store');

    // Weather API Proxy (hides API key from frontend)
    Route::get('api/weather', [WeatherController::class, 'show'])->middleware('throttle:30,1')->name('api.weather');

    // Knowledge Base (Diseases)
    Route::get('diseases', [DiseaseController::class, 'index'])->name('diseases.index');
    Route::get('diseases/{disease:slug}', [DiseaseController::class, 'show'])->name('diseases.show');
});

require __DIR__.'/settings.php';
