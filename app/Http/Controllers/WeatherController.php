<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class WeatherController extends Controller
{
    public function show(Request $request)
    {
        $validated = $request->validate([
            'lat' => 'required|numeric|min:-90|max:90',
            'lon' => 'required|numeric|min:-180|max:180',
        ]);

        $apiKey = config('services.openweathermap.key');

        if (! $apiKey) {
            return response()->json([
                'error' => 'OpenWeatherMap API key tidak dikonfigurasi.',
            ], 503);
        }

        try {
            $response = Http::timeout(10)->get('https://api.openweathermap.org/data/2.5/weather', [
                'lat' => $validated['lat'],
                'lon' => $validated['lon'],
                'units' => 'metric',
                'appid' => $apiKey,
            ]);

            if ($response->failed()) {
                return response()->json([
                    'error' => 'Gagal mengambil data cuaca.',
                ], 502);
            }

            $data = $response->json();

            return response()->json([
                'temperature' => round($data['main']['temp'] ?? 0, 1),
                'description' => $data['weather'][0]['description'] ?? '',
                'humidity' => $data['main']['humidity'] ?? 0,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Gagal menghubungi layanan cuaca.',
            ], 502);
        }
    }
}
