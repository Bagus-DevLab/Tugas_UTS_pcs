<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Symptom;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SymptomManagementController extends Controller
{
    public function index()
    {
        $symptoms = Symptom::withCount('diseases')->orderBy('code')->get();

        return Inertia::render('admin/symptoms/index', [
            'symptoms' => $symptoms,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10|unique:symptoms,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Symptom::create($validated);

        return redirect()->route('admin.knowledge-base.symptoms.index')
            ->with('success', 'Gejala berhasil ditambahkan.');
    }

    public function update(Request $request, Symptom $symptom)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10|unique:symptoms,code,' . $symptom->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $symptom->update($validated);

        return redirect()->route('admin.knowledge-base.symptoms.index')
            ->with('success', 'Gejala berhasil diperbarui.');
    }

    public function destroy(Symptom $symptom)
    {
        $symptom->delete();

        return redirect()->route('admin.knowledge-base.symptoms.index')
            ->with('success', 'Gejala berhasil dihapus.');
    }
}
