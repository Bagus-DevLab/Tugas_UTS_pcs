<?php

namespace App\Http\Controllers;

use App\Models\Disease;
use App\Services\MetaTagService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DiseaseController extends Controller
{
    public function index()
    {
        // Conditional query: only load detection count for authenticated users
        // For guest users (SEO), we hide detection count to keep UI clean
        $diseases = Disease::query()
            ->when(Auth::check(), function ($query) {
                // For authenticated users: show their detection count
                $query->withCount(['detections' => function ($q) {
                    $q->where('user_id', Auth::id());
                }]);
            })
            ->get();

        return Inertia::render('diseases/index', [
            'diseases' => $diseases,
            'meta' => MetaTagService::forDiseasesList(),
            'isAuthenticated' => Auth::check(), // Pass auth status to frontend
        ]);
    }

    public function show(Disease $disease)
    {
        $disease->load(['symptoms', 'treatments']);

        return Inertia::render('diseases/show', [
            'disease' => $disease,
            'meta' => MetaTagService::forDisease($disease),
            'isAuthenticated' => Auth::check(), // Pass auth status to frontend
        ]);
    }
}
