<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Detection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DetectionManagementController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'method' => 'nullable|in:image,expert_system',
            'user_search' => 'nullable|string|max:255',
        ]);

        $query = Detection::with(['user:id,name,email', 'disease:id,name,slug']);

        if ($request->filled('method')) {
            $query->where('method', $request->input('method'));
        }

        if ($request->filled('user_search')) {
            $search = $request->input('user_search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $detections = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('admin/detections/index', [
            'detections' => $detections,
            'filters' => $request->only(['method', 'user_search']),
        ]);
    }

    public function show(Detection $detection)
    {
        $detection->load(['user:id,name,email', 'disease.treatments', 'disease.symptoms']);

        return Inertia::render('admin/detections/show', [
            'detection' => $detection,
        ]);
    }

    public function destroy(Detection $detection)
    {
        $detection->delete();

        return redirect()->route('admin.detections.index')
            ->with('success', 'Data deteksi berhasil dihapus.');
    }
}
