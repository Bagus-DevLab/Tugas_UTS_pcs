<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Disease;
use App\Models\Symptom;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DiseaseManagementController extends Controller
{
    public function index()
    {
        $diseases = Disease::withCount(['symptoms', 'treatments', 'detections'])->get();

        return Inertia::render('admin/diseases/index', [
            'diseases' => $diseases,
        ]);
    }

    public function create()
    {
        $symptoms = Symptom::orderBy('code')->get();

        return Inertia::render('admin/diseases/create', [
            'symptoms' => $symptoms,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'latin_name' => 'nullable|string|max:255',
            'description' => 'required|string',
            'cause' => 'required|string',
            'symptoms' => 'nullable|array',
            'symptoms.*.id' => 'exists:symptoms,id',
            'symptoms.*.weight' => 'numeric|min:0|max:1',
        ]);

        $disease = Disease::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'latin_name' => $validated['latin_name'] ?? null,
            'description' => $validated['description'],
            'cause' => $validated['cause'],
        ]);

        // Attach symptoms with weights
        if (! empty($validated['symptoms'])) {
            foreach ($validated['symptoms'] as $symptom) {
                $disease->symptoms()->attach($symptom['id'], [
                    'weight' => $symptom['weight'] ?? 1.00,
                ]);
            }
        }

        return redirect()->route('admin.diseases.index')
            ->with('success', 'Penyakit berhasil ditambahkan.');
    }

    public function edit(Disease $disease)
    {
        $disease->load(['symptoms', 'treatments']);
        $symptoms = Symptom::orderBy('code')->get();

        return Inertia::render('admin/diseases/edit', [
            'disease' => $disease,
            'symptoms' => $symptoms,
        ]);
    }

    public function update(Request $request, Disease $disease)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'latin_name' => 'nullable|string|max:255',
            'description' => 'required|string',
            'cause' => 'required|string',
            'symptoms' => 'nullable|array',
            'symptoms.*.id' => 'exists:symptoms,id',
            'symptoms.*.weight' => 'numeric|min:0|max:1',
        ]);

        $disease->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'latin_name' => $validated['latin_name'] ?? null,
            'description' => $validated['description'],
            'cause' => $validated['cause'],
        ]);

        // Sync symptoms with weights
        $syncData = [];
        if (! empty($validated['symptoms'])) {
            foreach ($validated['symptoms'] as $symptom) {
                $syncData[$symptom['id']] = ['weight' => $symptom['weight'] ?? 1.00];
            }
        }
        $disease->symptoms()->sync($syncData);

        return redirect()->route('admin.diseases.index')
            ->with('success', 'Penyakit berhasil diperbarui.');
    }

    public function destroy(Disease $disease)
    {
        $disease->delete();

        return redirect()->route('admin.diseases.index')
            ->with('success', 'Penyakit berhasil dihapus.');
    }
}
