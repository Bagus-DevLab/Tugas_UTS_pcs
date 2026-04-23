<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Disease;
use App\Models\Treatment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TreatmentManagementController extends Controller
{
    public function index()
    {
        $treatments = Treatment::with('disease:id,name,slug')
            ->orderBy('disease_id')
            ->orderBy('type')
            ->orderBy('priority')
            ->get();

        $diseases = Disease::orderBy('name')->get(['id', 'name', 'slug']);

        return Inertia::render('admin/treatments/index', [
            'treatments' => $treatments,
            'diseases' => $diseases,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'disease_id' => 'required|exists:diseases,id',
            'type' => 'required|in:prevention,chemical,biological,cultural',
            'description' => 'required|string',
            'dosage' => 'nullable|string|max:50',
            'dosage_unit' => 'nullable|required_with:dosage|string|max:50',
            'priority' => 'integer|min:0',
        ]);

        Treatment::create($validated);

        return redirect()->route('admin.treatments.index')
            ->with('success', 'Penanganan berhasil ditambahkan.');
    }

    public function update(Request $request, Treatment $treatment)
    {
        $validated = $request->validate([
            'disease_id' => 'required|exists:diseases,id',
            'type' => 'required|in:prevention,chemical,biological,cultural',
            'description' => 'required|string',
            'dosage' => 'nullable|string|max:50',
            'dosage_unit' => 'nullable|required_with:dosage|string|max:50',
            'priority' => 'integer|min:0',
        ]);

        $treatment->update($validated);

        return redirect()->route('admin.treatments.index')
            ->with('success', 'Penanganan berhasil diperbarui.');
    }

    public function destroy(Treatment $treatment)
    {
        $treatment->delete();

        return redirect()->route('admin.treatments.index')
            ->with('success', 'Penanganan berhasil dihapus.');
    }
}
