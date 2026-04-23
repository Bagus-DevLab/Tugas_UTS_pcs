<?php

namespace App\Http\Controllers;

use App\Models\Disease;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DiseaseController extends Controller
{
    public function index()
    {
        $diseases = Disease::withCount(['detections' => function ($query) {
            $query->where('user_id', Auth::id());
        }])->get();

        return Inertia::render('diseases/index', [
            'diseases' => $diseases,
        ]);
    }

    public function show(Disease $disease)
    {
        $disease->load(['symptoms', 'treatments']);

        return Inertia::render('diseases/show', [
            'disease' => $disease,
        ]);
    }
}
