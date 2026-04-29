<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Detection;
use App\Models\Disease;
use App\Models\Symptom;
use App\Models\Treatment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminApiController extends Controller
{
    // ===================================================================
    // Diseases CRUD
    // ===================================================================

    public function diseases()
    {
        return response()->json([
            'diseases' => Disease::withCount(['symptoms', 'treatments', 'detections'])->get(),
        ]);
    }

    public function storeDisease(Request $request)
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

        if (! empty($validated['symptoms'])) {
            foreach ($validated['symptoms'] as $symptom) {
                $disease->symptoms()->attach($symptom['id'], ['weight' => $symptom['weight'] ?? 1.00]);
            }
        }

        return response()->json([
            'message' => 'Penyakit berhasil ditambahkan.',
            'disease' => $disease->load('symptoms'),
        ], 201);
    }

    public function updateDisease(Request $request, Disease $disease)
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

        if (isset($validated['symptoms'])) {
            $syncData = [];
            foreach ($validated['symptoms'] as $symptom) {
                $syncData[$symptom['id']] = ['weight' => $symptom['weight'] ?? 1.00];
            }
            $disease->symptoms()->sync($syncData);
        }

        return response()->json([
            'message' => 'Penyakit berhasil diperbarui.',
            'disease' => $disease->load('symptoms'),
        ]);
    }

    public function destroyDisease(Disease $disease)
    {
        $disease->delete();

        return response()->json(['message' => 'Penyakit berhasil dihapus.']);
    }

    // ===================================================================
    // Symptoms CRUD
    // ===================================================================

    public function symptoms()
    {
        return response()->json([
            'symptoms' => Symptom::withCount('diseases')->orderBy('code')->get(),
        ]);
    }

    public function storeSymptom(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10|unique:symptoms,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $symptom = Symptom::create($validated);

        return response()->json([
            'message' => 'Gejala berhasil ditambahkan.',
            'symptom' => $symptom,
        ], 201);
    }

    public function updateSymptom(Request $request, Symptom $symptom)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10|unique:symptoms,code,' . $symptom->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $symptom->update($validated);

        return response()->json([
            'message' => 'Gejala berhasil diperbarui.',
            'symptom' => $symptom,
        ]);
    }

    public function destroySymptom(Symptom $symptom)
    {
        $symptom->delete();

        return response()->json(['message' => 'Gejala berhasil dihapus.']);
    }

    // ===================================================================
    // Treatments CRUD
    // ===================================================================

    public function treatments()
    {
        return response()->json([
            'treatments' => Treatment::with('disease:id,name,slug')->orderBy('disease_id')->get(),
        ]);
    }

    public function storeTreatment(Request $request)
    {
        $validated = $request->validate([
            'disease_id' => 'required|exists:diseases,id',
            'type' => 'required|in:prevention,chemical,biological,cultural',
            'description' => 'required|string',
            'dosage' => 'nullable|string|max:50',
            'dosage_unit' => 'nullable|required_with:dosage|string|max:50',
            'priority' => 'integer|min:0',
        ]);

        $treatment = Treatment::create($validated);

        return response()->json([
            'message' => 'Penanganan berhasil ditambahkan.',
            'treatment' => $treatment->load('disease'),
        ], 201);
    }

    public function updateTreatment(Request $request, Treatment $treatment)
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

        return response()->json([
            'message' => 'Penanganan berhasil diperbarui.',
            'treatment' => $treatment->load('disease'),
        ]);
    }

    public function destroyTreatment(Treatment $treatment)
    {
        $treatment->delete();

        return response()->json(['message' => 'Penanganan berhasil dihapus.']);
    }

    // ===================================================================
    // All Detections (admin view)
    // ===================================================================

    public function detections(Request $request)
    {
        $query = Detection::with(['user:id,name,email', 'disease:id,name,slug']);

        if ($request->filled('method')) {
            $query->where('method', $request->input('method'));
        }

        return response()->json($query->latest()->paginate(15));
    }

    // ===================================================================
    // User Management (super_admin only)
    // ===================================================================

    public function users()
    {
        return response()->json([
            'users' => User::withCount('detections')->latest()->paginate(15),
            'roles' => User::ROLES,
        ]);
    }

    public function updateUser(Request $request, User $user)
    {
        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'Tidak dapat mengubah role sendiri.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', Rule::in(User::ROLES)],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => "User {$user->name} berhasil diperbarui.",
            'user' => $user,
        ]);
    }

    public function destroyUser(User $user)
    {
        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'Tidak dapat menghapus akun sendiri.'], 403);
        }

        if ($user->isSuperAdmin()) {
            return response()->json(['message' => 'Tidak dapat menghapus Super Admin.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User berhasil dihapus.']);
    }
}
