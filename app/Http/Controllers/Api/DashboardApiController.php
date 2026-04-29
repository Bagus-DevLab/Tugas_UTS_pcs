<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Detection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardApiController extends Controller
{
    /**
     * GET /api/v1/dashboard/stats
     */
    public function stats()
    {
        $user = Auth::user();

        $totalDetections = Detection::where('user_id', $user->id)->count();

        $detectionsThisMonth = Detection::where('user_id', $user->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $averageConfidence = Detection::where('user_id', $user->id)
            ->whereNotNull('confidence')
            ->avg('confidence');

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

        $recentDetections = Detection::where('user_id', $user->id)
            ->with('disease:id,name,slug')
            ->latest()
            ->take(10)
            ->get();

        return response()->json([
            'stats' => [
                'total_detections' => $totalDetections,
                'detections_this_month' => $detectionsThisMonth,
                'average_confidence' => $averageConfidence ? round($averageConfidence, 1) : 0,
            ],
            'disease_distribution' => $diseaseDistribution->values(),
            'recent_detections' => $recentDetections,
        ]);
    }
}
