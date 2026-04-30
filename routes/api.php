<?php

use App\Http\Controllers\Api\AdminApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\Api\DetectionApiController;
use App\Http\Controllers\Api\DiseaseApiController;
use App\Http\Controllers\Api\ExpertSystemApiController;
use Illuminate\Support\Facades\Route;

// ===================================================================
// PUBLIC API - /public/api/v1/*
// No authentication required
// ===================================================================

Route::prefix('public/api/v1')->group(function () {
    // ===== Authentication =====
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);

    // ===== Knowledge Base (Read-only) =====
    // Diseases
    Route::get('diseases', [DiseaseApiController::class, 'index']);
    Route::get('diseases/{disease:slug}', [DiseaseApiController::class, 'show']);
    
    // Symptoms
    Route::get('symptoms', [ExpertSystemApiController::class, 'symptoms']);
    
    // Detections (Read-only - list all)
    Route::get('detections', [DetectionApiController::class, 'index']);
    Route::get('detections/{detection}', [DetectionApiController::class, 'show']);
});

// ===================================================================
// PRIVATE API - /private/api/v1/*
// Authentication required (auth:sanctum)
// ===================================================================

Route::prefix('private/api/v1')->middleware('auth:sanctum')->group(function () {
    // ===== Authentication =====
    Route::get('user', [AuthController::class, 'user']);
    Route::post('logout', [AuthController::class, 'logout']);

    // ===== Detections (Create, Predict, Delete) =====
    Route::post('detections', [DetectionApiController::class, 'store']);
    Route::post('detections/predict', [DetectionApiController::class, 'predict']);
    Route::delete('detections/{detection}', [DetectionApiController::class, 'destroy']);

    // ===== Expert System =====
    Route::post('expert-system/diagnose', [ExpertSystemApiController::class, 'diagnose']);
    Route::post('expert-system', [ExpertSystemApiController::class, 'store']);

    // ===================================================================
    // ADMIN ROUTES (admin + super_admin roles)
    // ===================================================================
    
    Route::middleware('role:super_admin,admin')->prefix('admin')->group(function () {
        // ===== Dashboard =====
        Route::get('dashboard/stats', [DashboardApiController::class, 'stats']);
        
        // ===== Diseases Management =====
        Route::get('diseases', [AdminApiController::class, 'diseases']);
        Route::post('diseases', [AdminApiController::class, 'storeDisease']);
        Route::put('diseases/{disease}', [AdminApiController::class, 'updateDisease']);
        Route::delete('diseases/{disease}', [AdminApiController::class, 'destroyDisease']);

        // ===== Symptoms Management =====
        Route::get('symptoms', [AdminApiController::class, 'symptoms']);
        Route::post('symptoms', [AdminApiController::class, 'storeSymptom']);
        Route::put('symptoms/{symptom}', [AdminApiController::class, 'updateSymptom']);
        Route::delete('symptoms/{symptom}', [AdminApiController::class, 'destroySymptom']);

        // ===== Treatments Management =====
        Route::get('treatments', [AdminApiController::class, 'treatments']);
        Route::post('treatments', [AdminApiController::class, 'storeTreatment']);
        Route::put('treatments/{treatment}', [AdminApiController::class, 'updateTreatment']);
        Route::delete('treatments/{treatment}', [AdminApiController::class, 'destroyTreatment']);

        // ===== Detections Management =====
        Route::get('detections', [AdminApiController::class, 'detections']);
    });

    // ===================================================================
    // SUPER ADMIN ONLY ROUTES
    // ===================================================================
    
    Route::middleware('role:super_admin')->prefix('admin')->group(function () {
        // ===== Users Management =====
        Route::get('users', [AdminApiController::class, 'users']);
        Route::put('users/{user}', [AdminApiController::class, 'updateUser']);
        Route::delete('users/{user}', [AdminApiController::class, 'destroyUser']);
    });
});
