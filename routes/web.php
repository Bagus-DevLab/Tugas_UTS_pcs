<?php

use App\Http\Controllers\Admin\DetectionManagementController;
use App\Http\Controllers\Admin\DiseaseManagementController;
use App\Http\Controllers\Admin\SymptomManagementController;
use App\Http\Controllers\Admin\TreatmentManagementController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DetectionController;
use App\Http\Controllers\DiseaseController;
use App\Http\Controllers\ExpertSystemController;
use App\Http\Controllers\WeatherController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index'])->name('home');

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

    // Knowledge Base (Diseases) - read-only for all users
    Route::get('diseases', [DiseaseController::class, 'index'])->name('diseases.index');
    Route::get('diseases/{disease:slug}', [DiseaseController::class, 'show'])->name('diseases.show');

    // Weather API Proxy (hides API key from frontend)
    Route::get('api/weather', [WeatherController::class, 'show'])->middleware('throttle:30,1')->name('api.weather');

    // ===================================================================
    // Knowledge Base Management (pakar + super_admin)
    // ===================================================================
    Route::middleware(['role:super_admin,pakar'])->prefix('admin/knowledge-base')->name('admin.knowledge-base.')->group(function () {
        // Disease Management (CRUD)
        Route::get('diseases', [DiseaseManagementController::class, 'index'])->name('diseases.index');
        Route::get('diseases/create', [DiseaseManagementController::class, 'create'])->name('diseases.create');
        Route::post('diseases', [DiseaseManagementController::class, 'store'])->name('diseases.store');
        Route::get('diseases/{disease}/edit', [DiseaseManagementController::class, 'edit'])->name('diseases.edit');
        Route::put('diseases/{disease}', [DiseaseManagementController::class, 'update'])->name('diseases.update');
        Route::delete('diseases/{disease}', [DiseaseManagementController::class, 'destroy'])->name('diseases.destroy');

        // Symptom Management (CRUD)
        Route::get('symptoms', [SymptomManagementController::class, 'index'])->name('symptoms.index');
        Route::post('symptoms', [SymptomManagementController::class, 'store'])->name('symptoms.store');
        Route::put('symptoms/{symptom}', [SymptomManagementController::class, 'update'])->name('symptoms.update');
        Route::delete('symptoms/{symptom}', [SymptomManagementController::class, 'destroy'])->name('symptoms.destroy');

        // Treatment Management (CRUD)
        Route::get('treatments', [TreatmentManagementController::class, 'index'])->name('treatments.index');
        Route::post('treatments', [TreatmentManagementController::class, 'store'])->name('treatments.store');
        Route::put('treatments/{treatment}', [TreatmentManagementController::class, 'update'])->name('treatments.update');
        Route::delete('treatments/{treatment}', [TreatmentManagementController::class, 'destroy'])->name('treatments.destroy');
    });

    // ===================================================================
    // System Management (admin + super_admin)
    // ===================================================================
    Route::middleware(['role:super_admin,admin'])->prefix('admin/system')->name('admin.system.')->group(function () {
        // User Management (super_admin only)
        Route::middleware(['role:super_admin'])->group(function () {
            Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
            Route::get('users/{user}/edit', [UserManagementController::class, 'edit'])->name('users.edit');
            Route::put('users/{user}', [UserManagementController::class, 'update'])->name('users.update');
            Route::delete('users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');
        });
    });

    // ===================================================================
    // Shared Admin Routes (all admin-level roles)
    // ===================================================================
    Route::middleware(['role:super_admin,admin,pakar'])->prefix('admin')->name('admin.')->group(function () {
        // All Detections (view all users' detections)
        Route::get('detections', [DetectionManagementController::class, 'index'])->name('detections.index');
        Route::get('detections/{detection}', [DetectionManagementController::class, 'show'])->name('detections.show');
        Route::delete('detections/{detection}', [DetectionManagementController::class, 'destroy'])->name('detections.destroy');
    });
});

require __DIR__.'/settings.php';
