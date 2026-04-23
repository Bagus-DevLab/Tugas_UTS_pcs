<?php

namespace App\Http\Controllers;

use App\Models\Detection;
use App\Models\Disease;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DetectionController extends Controller
{
    public function index()
    {
        $diseases = Disease::with('treatments')->get();

        return Inertia::render('detection/index', [
            'diseases' => $diseases,
        ]);
    }

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

        // Handle image upload - organize by disease label for easy re-training
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

        return redirect()->route('detection.show', $detection)
            ->with('success', 'Hasil deteksi berhasil disimpan.');
    }

    public function history(Request $request)
    {
        $request->validate([
            'method' => 'nullable|in:image,expert_system',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $query = Detection::where('user_id', Auth::id())
            ->with('disease:id,name,slug');

        // Filter by method
        if ($request->filled('method')) {
            $query->where('method', $request->input('method'));
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $detections = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('detection/history', [
            'detections' => $detections,
            'filters' => $request->only(['method', 'date_from', 'date_to']),
        ]);
    }

    public function show(Detection $detection)
    {
        // Ensure user can only view their own detections
        if ($detection->user_id !== Auth::id()) {
            abort(403);
        }

        $detection->load(['disease.treatments', 'disease.symptoms']);

        return Inertia::render('detection/show', [
            'detection' => $detection,
        ]);
    }
}
