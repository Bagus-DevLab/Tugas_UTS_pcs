<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Detection;
use App\Models\Disease;
use App\Models\Symptom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExpertSystemApiController extends Controller
{
    /**
     * GET /api/v1/symptoms
     */
    public function symptoms()
    {
        return response()->json([
            'symptoms' => Symptom::orderBy('code')->get(),
        ]);
    }

    /**
     * POST /api/v1/expert-system/diagnose
     */
    public function diagnose(Request $request)
    {
        $validated = $request->validate([
            'symptom_ids' => 'required|array|min:1',
            'symptom_ids.*' => 'exists:symptoms,id',
        ]);

        $selectedSymptomIds = $validated['symptom_ids'];

        $diseases = Disease::with(['symptoms', 'treatments'])
            ->where('slug', '!=', 'healthy')
            ->get();

        $results = [];

        foreach ($diseases as $disease) {
            $diseaseSymptomIds = $disease->symptoms->pluck('id')->toArray();
            $matchingSymptomIds = array_intersect($selectedSymptomIds, $diseaseSymptomIds);

            if (empty($matchingSymptomIds)) {
                continue;
            }

            $combinedCF = 0;
            foreach ($matchingSymptomIds as $symptomId) {
                $symptom = $disease->symptoms->firstWhere('id', $symptomId);
                $weight = $symptom ? $symptom->pivot->weight : 0;

                if ($combinedCF === 0) {
                    $combinedCF = $weight;
                } else {
                    $combinedCF = $combinedCF + $weight * (1 - $combinedCF);
                }
            }

            $results[] = [
                'disease' => $disease,
                'certainty_factor' => round($combinedCF * 100, 2),
                'matching_symptoms' => count($matchingSymptomIds),
                'total_symptoms' => count($diseaseSymptomIds),
            ];
        }

        usort($results, fn ($a, $b) => $b['certainty_factor'] <=> $a['certainty_factor']);

        return response()->json([
            'results' => $results,
            'selected_symptoms' => $selectedSymptomIds,
        ]);
    }

    /**
     * POST /api/v1/expert-system
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'disease_id' => 'nullable|exists:diseases,id',
            'label' => 'nullable|string|max:255',
            'confidence' => 'nullable|numeric|min:0|max:100',
            'temperature' => 'nullable|numeric|min:-50|max:60',
            'scanned_at' => 'nullable|date',
            'scan_duration_ms' => 'nullable|integer|min:0',
            'latitude' => 'nullable|numeric|min:-90|max:90',
            'longitude' => 'nullable|numeric|min:-180|max:180',
            'connection_status' => 'nullable|string|in:online,offline',
            'selected_symptoms' => 'nullable|json',
            'notes' => 'nullable|string|max:1000',
        ]);

        $detection = new Detection([
            'disease_id' => $validated['disease_id'] ?? null,
            'method' => 'expert_system',
            'label' => $validated['label'] ?? null,
            'confidence' => $validated['confidence'] ?? null,
            'temperature' => $validated['temperature'] ?? null,
            'scanned_at' => $validated['scanned_at'] ?? now(),
            'scan_duration_ms' => $validated['scan_duration_ms'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'connection_status' => $validated['connection_status'] ?? 'online',
            'selected_symptoms' => isset($validated['selected_symptoms']) ? json_decode($validated['selected_symptoms'], true) : null,
            'notes' => $validated['notes'] ?? null,
        ]);
        $detection->user_id = Auth::id();
        $detection->save();

        return response()->json([
            'message' => 'Hasil diagnosis berhasil disimpan.',
            'detection' => $detection->load('disease'),
        ], 201);
    }
}
