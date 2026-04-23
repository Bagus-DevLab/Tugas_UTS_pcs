<?php

namespace App\Http\Controllers;

use App\Models\Detection;
use App\Models\Disease;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Total detections by user
        $totalDetections = Detection::where('user_id', $user->id)->count();

        // Detections this month
        $detectionsThisMonth = Detection::where('user_id', $user->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Average confidence
        $averageConfidence = Detection::where('user_id', $user->id)
            ->whereNotNull('confidence')
            ->avg('confidence');

        // Disease distribution (for chart)
        $diseaseDistribution = Detection::where('user_id', $user->id)
            ->whereNotNull('disease_id')
            ->select('disease_id', DB::raw('count(*) as count'))
            ->groupBy('disease_id')
            ->with('disease:id,name')
            ->get()
            ->map(fn ($item) => [
                'name' => $item->disease?->name ?? 'Unknown',
                'count' => $item->count,
            ]);

        // Most detected disease
        $mostDetectedDisease = $diseaseDistribution->sortByDesc('count')->first();

        // Recent detections
        $recentDetections = Detection::where('user_id', $user->id)
            ->with('disease:id,name,slug')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'totalDetections' => $totalDetections,
                'detectionsThisMonth' => $detectionsThisMonth,
                'averageConfidence' => $averageConfidence ? round($averageConfidence, 1) : 0,
                'mostDetectedDisease' => $mostDetectedDisease['name'] ?? '-',
            ],
            'diseaseDistribution' => $diseaseDistribution->values(),
            'recentDetections' => $recentDetections,
        ]);
    }
}
