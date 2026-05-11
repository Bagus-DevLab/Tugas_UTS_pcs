<?php

namespace App\Services;

use App\Models\Disease;

class MetaTagService
{
    /**
     * Generate meta tags for a page
     *
     * @param  array{title?: string, description?: string, keywords?: array<string>, image?: string, type?: string, url?: string}  $options
     * @return array{title: string, description: string, keywords: string, og_title: string, og_description: string, og_image: string, og_type: string, og_url: string, canonical: string}
     */
    public static function generate(array $options = []): array
    {
        $appName = config('app.name', 'MAPAN');
        $appUrl = config('app.url', 'https://mapan.test');

        $title = $options['title'] ?? $appName;
        $description = $options['description'] ?? 'Sistem Pakar Deteksi Penyakit Tanaman Padi menggunakan Machine Learning dan Expert System';
        $keywords = isset($options['keywords']) ? implode(', ', $options['keywords']) : 'penyakit padi, deteksi penyakit tanaman, sistem pakar, machine learning';
        $image = $options['image'] ?? asset('images/og-default.jpg');
        $type = $options['type'] ?? 'website';
        $url = $options['url'] ?? $appUrl;

        // Ensure full title includes app name
        $fullTitle = $title === $appName ? $title : "{$title} - {$appName}";

        return [
            'title' => $fullTitle,
            'description' => $description,
            'keywords' => $keywords,
            'og_title' => $fullTitle,
            'og_description' => $description,
            'og_image' => $image,
            'og_type' => $type,
            'og_url' => $url,
            'canonical' => $url,
        ];
    }

    /**
     * Generate meta tags for disease detail page
     *
     * @return array{title: string, description: string, keywords: string, og_title: string, og_description: string, og_image: string, og_type: string, og_url: string, canonical: string}
     */
    public static function forDisease(Disease $disease): array
    {
        $appUrl = config('app.url', 'https://mapan.test');
        $url = "{$appUrl}/diseases/{$disease->slug}";

        // Generate description from symptoms
        $symptoms = $disease->symptoms->pluck('name')->take(3)->toArray();
        $symptomText = count($symptoms) > 0
            ? 'Gejala: '.implode(', ', $symptoms).'.'
            : '';

        $description = "Informasi lengkap tentang penyakit {$disease->name} pada tanaman padi. {$symptomText} Pelajari cara mengatasi dan mencegah penyakit ini.";

        // Generate keywords
        $keywords = [
            'penyakit padi',
            strtolower($disease->name),
            "gejala {$disease->name}",
            "cara mengatasi {$disease->name} padi",
            "pencegahan {$disease->name}",
        ];

        // Add symptom keywords
        foreach ($disease->symptoms->take(3) as $symptom) {
            $keywords[] = strtolower($symptom->name);
        }

        // Get disease image or fallback
        $image = $disease->image_url
            ? asset("storage/{$disease->image_url}")
            : asset('images/og-default.jpg');

        return self::generate([
            'title' => $disease->name,
            'description' => $description,
            'keywords' => $keywords,
            'image' => $image,
            'type' => 'article',
            'url' => $url,
        ]);
    }

    /**
     * Generate meta tags for homepage
     *
     * @return array{title: string, description: string, keywords: string, og_title: string, og_description: string, og_image: string, og_type: string, og_url: string, canonical: string}
     */
    public static function forHomepage(): array
    {
        $appUrl = config('app.url', 'https://mapan.test');

        return self::generate([
            'title' => config('app.name', 'MAPAN'),
            'description' => 'Sistem Pakar Deteksi Penyakit Tanaman Padi menggunakan Machine Learning dan Expert System. Deteksi penyakit padi secara akurat dengan teknologi AI.',
            'keywords' => [
                'penyakit padi',
                'deteksi penyakit tanaman',
                'sistem pakar',
                'machine learning',
                'expert system',
                'pertanian',
                'tanaman padi',
            ],
            'url' => $appUrl,
        ]);
    }

    /**
     * Generate meta tags for diseases list page
     *
     * @return array{title: string, description: string, keywords: string, og_title: string, og_description: string, og_image: string, og_type: string, og_url: string, canonical: string}
     */
    public static function forDiseasesList(): array
    {
        $appUrl = config('app.url', 'https://mapan.test');

        return self::generate([
            'title' => 'Daftar Penyakit Padi',
            'description' => 'Pelajari berbagai jenis penyakit yang menyerang tanaman padi, gejala, dan cara mengatasinya. Informasi lengkap untuk petani dan ahli pertanian.',
            'keywords' => [
                'penyakit padi',
                'jenis penyakit padi',
                'gejala penyakit padi',
                'blast',
                'brown spot',
                'tungro',
                'bacterial leaf blight',
                'sheath blight',
            ],
            'url' => "{$appUrl}/diseases",
        ]);
    }

    /**
     * Generate meta tags for expert system page
     *
     * @return array{title: string, description: string, keywords: string, og_title: string, og_description: string, og_image: string, og_type: string, og_url: string, canonical: string}
     */
    public static function forExpertSystem(): array
    {
        $appUrl = config('app.url', 'https://mapan.test');

        return self::generate([
            'title' => 'Sistem Pakar Diagnosis',
            'description' => 'Gunakan sistem pakar berbasis Forward Chaining untuk mendiagnosis penyakit padi berdasarkan gejala yang Anda amati. Hasil diagnosis dengan tingkat kepastian (Certainty Factor).',
            'keywords' => [
                'sistem pakar',
                'diagnosis penyakit padi',
                'forward chaining',
                'certainty factor',
                'expert system',
                'konsultasi penyakit padi',
            ],
            'url' => "{$appUrl}/expert-system",
        ]);
    }

    /**
     * Generate meta tags for detection page
     *
     * @return array{title: string, description: string, keywords: string, og_title: string, og_description: string, og_image: string, og_type: string, og_url: string, canonical: string}
     */
    public static function forDetection(): array
    {
        $appUrl = config('app.url', 'https://mapan.test');

        return self::generate([
            'title' => 'Deteksi Penyakit',
            'description' => 'Upload foto daun padi untuk deteksi penyakit secara otomatis menggunakan Machine Learning (ONNX Runtime). Hasil deteksi real-time dengan akurasi tinggi.',
            'keywords' => [
                'deteksi penyakit padi',
                'machine learning',
                'ONNX',
                'image recognition',
                'AI pertanian',
                'deteksi otomatis',
            ],
            'url' => "{$appUrl}/detection",
        ]);
    }
}
