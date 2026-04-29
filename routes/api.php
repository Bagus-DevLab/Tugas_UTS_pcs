<?php

use App\Http\Controllers\Api\AdminApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\Api\DetectionApiController;
use App\Http\Controllers\Api\ExpertSystemApiController;
use App\Models\Disease;
use Illuminate\Support\Facades\Route;

// ===================================================================
// API v1
// ===================================================================

Route::prefix('v1')->group(function () {
    // ----- Public (no auth) -----
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);

    // ----- Authenticated (Sanctum token) -----
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);

        // Dashboard
        Route::get('dashboard/stats', [DashboardApiController::class, 'stats']);

        // Detections (CRUD)
        Route::get('detections', [DetectionApiController::class, 'index']);
        Route::post('detections', [DetectionApiController::class, 'store']);
        Route::get('detections/{detection}', [DetectionApiController::class, 'show']);
        Route::delete('detections/{detection}', [DetectionApiController::class, 'destroy']);

        // Expert System
        Route::get('symptoms', [ExpertSystemApiController::class, 'symptoms']);
        Route::post('expert-system/diagnose', [ExpertSystemApiController::class, 'diagnose']);
        Route::post('expert-system', [ExpertSystemApiController::class, 'store']);

        // Knowledge Base (read-only)
        Route::get('diseases', function () {
            return response()->json([
                'diseases' => Disease::with(['symptoms', 'treatments'])->get(),
            ]);
        });
        Route::get('diseases/{disease:slug}', function (Disease $disease) {
            return response()->json([
                'disease' => $disease->load(['symptoms', 'treatments']),
            ]);
        });

        // ===== Admin routes (admin + super_admin) =====
        Route::middleware('role:super_admin,admin')->prefix('admin')->group(function () {
            Route::get('diseases', [AdminApiController::class, 'diseases']);
            Route::post('diseases', [AdminApiController::class, 'storeDisease']);
            Route::put('diseases/{disease}', [AdminApiController::class, 'updateDisease']);
            Route::delete('diseases/{disease}', [AdminApiController::class, 'destroyDisease']);

            Route::get('symptoms', [AdminApiController::class, 'symptoms']);
            Route::post('symptoms', [AdminApiController::class, 'storeSymptom']);
            Route::put('symptoms/{symptom}', [AdminApiController::class, 'updateSymptom']);
            Route::delete('symptoms/{symptom}', [AdminApiController::class, 'destroySymptom']);

            Route::get('treatments', [AdminApiController::class, 'treatments']);
            Route::post('treatments', [AdminApiController::class, 'storeTreatment']);
            Route::put('treatments/{treatment}', [AdminApiController::class, 'updateTreatment']);
            Route::delete('treatments/{treatment}', [AdminApiController::class, 'destroyTreatment']);

            Route::get('detections', [AdminApiController::class, 'detections']);
        });

        // ===== Super Admin only =====
        Route::middleware('role:super_admin')->prefix('admin')->group(function () {
            Route::get('users', [AdminApiController::class, 'users']);
            Route::put('users/{user}', [AdminApiController::class, 'updateUser']);
            Route::delete('users/{user}', [AdminApiController::class, 'destroyUser']);
        });
    });
});
