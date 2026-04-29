<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Detection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class DetectionApiController extends Controller
{
    /**
     * GET /api/v1/detections
     */
    public function index(Request $request)
    {
        $request->validate([
            'method' => 'nullable|in:image,expert_system',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $query = Detection::where('user_id', Auth::id())
            ->with('disease:id,name,slug');

        if ($request->filled('method')) {
            $query->where('method', $request->input('method'));
        }

        $detections = $query->latest()->paginate($request->input('per_page', 15));

        return response()->json($detections);
    }

    /**
     * POST /api/v1/detections
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
            'disease_id' => 'nullable|exists:diseases,id',
            'method' => 'required|in:image,expert_system',
            'label' => 'nullable|string|max:255',
            'confidence' => 'nullable|numeric|min:0|max:100',
            'temperature' => 'nullable|numeric|min:-50|max:60',
            'scanned_at' => 'nullable|date',
            'scan_duration_ms' => 'nullable|integer|min:0',
            'latitude' => 'nullable|numeric|min:-90|max:90',
            'longitude' => 'nullable|numeric|min:-180|max:180',
            'connection_status' => 'nullable|string|in:online,offline',
            'predictions' => 'nullable|json',
            'selected_symptoms' => 'nullable|json',
            'notes' => 'nullable|string|max:1000',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $label = $validated['label'] ?? 'Unknown';
            $folder = 'detections/' . Str::slug($label);
            $imagePath = $request->file('image')->store($folder, 'public');
        }

        $detection = new Detection([
            'disease_id' => $validated['disease_id'] ?? null,
            'method' => $validated['method'],
            'image_path' => $imagePath,
            'label' => $validated['label'] ?? null,
            'confidence' => $validated['confidence'] ?? null,
            'temperature' => $validated['temperature'] ?? null,
            'scanned_at' => $validated['scanned_at'] ?? now(),
            'scan_duration_ms' => $validated['scan_duration_ms'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'connection_status' => $validated['connection_status'] ?? 'online',
            'predictions' => isset($validated['predictions']) ? json_decode($validated['predictions'], true) : null,
            'selected_symptoms' => isset($validated['selected_symptoms']) ? json_decode($validated['selected_symptoms'], true) : null,
            'notes' => $validated['notes'] ?? null,
        ]);
        $detection->user_id = Auth::id();
        $detection->save();

        return response()->json([
            'message' => 'Hasil deteksi berhasil disimpan.',
            'detection' => $detection->load('disease'),
        ], 201);
    }

    /**
     * GET /api/v1/detections/{detection}
     */
    public function show(Detection $detection)
    {
        if ($detection->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json([
            'detection' => $detection->load(['disease.treatments', 'disease.symptoms']),
        ]);
    }

    /**
     * DELETE /api/v1/detections/{detection}
     */
    public function destroy(Detection $detection)
    {
        if ($detection->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $detection->delete();

        return response()->json([
            'message' => 'Deteksi berhasil dihapus.',
        ]);
    }
}
