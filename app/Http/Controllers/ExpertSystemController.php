<?php

namespace App\Http\Controllers;

use App\Models\Detection;
use App\Models\Disease;
use App\Models\Symptom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExpertSystemController extends Controller
{
    public function index()
    {
        $symptoms = Symptom::orderBy('code')->get();
        $diseases = Disease::with(['symptoms', 'treatments'])->get();

        return Inertia::render('expert-system/index', [
            'symptoms' => $symptoms,
            'diseases' => $diseases,
        ]);
    }

    /**
     * Diagnose using Forward Chaining + Certainty Factor method.
     */
    public function diagnose(Request $request)
    {
        $validated = $request->validate([
            'symptom_ids' => 'required|array|min:1',
            'symptom_ids.*' => 'exists:symptoms,id',
        ]);

        $selectedSymptomIds = $validated['symptom_ids'];

        // Get all diseases with their symptoms and weights
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

            // Calculate Certainty Factor using combination formula
            // CF_combine(CF1, CF2) = CF1 + CF2 * (1 - CF1)
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

        // Sort by certainty factor descending
        usort($results, fn ($a, $b) => $b['certainty_factor'] <=> $a['certainty_factor']);

        return response()->json([
            'results' => $results,
            'selected_symptoms' => $selectedSymptomIds,
        ]);
    }

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

        $detection = Detection::create([
            'user_id' => Auth::id(),
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

        return redirect()->route('detection.show', $detection)
            ->with('success', 'Hasil diagnosis berhasil disimpan.');
    }
}
