<?php

namespace Database\Seeders;

use App\Models\Disease;
use App\Models\Symptom;
use Illuminate\Database\Seeder;

class DiseaseSymptomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Mapping: disease_slug => [symptom_code => weight]
        $relations = [
            'blast' => [
                'G01' => 0.95, // Bercak belah ketupat - sangat khas blast
                'G02' => 0.90, // Abu-abu tengah, coklat tepi
                'G03' => 0.70, // Daun mengering dari ujung
                'G04' => 0.85, // Leher malai patah
                'G05' => 0.75, // Gabah hampa
            ],
            'brown-spot' => [
                'G06' => 0.95, // Bercak oval coklat - sangat khas brown spot
                'G07' => 0.85, // Halo kuning
                'G08' => 0.70, // Bercak pada pelepah
                'G09' => 0.80, // Gabah berubah warna
                'G10' => 0.65, // Pertumbuhan terhambat
            ],
            'tungro' => [
                'G11' => 0.90, // Daun menguning
                'G12' => 0.85, // Tanaman kerdil
                'G13' => 0.80, // Anakan berkurang
                'G14' => 0.70, // Daun menggulung ke dalam
                'G15' => 0.75, // Malai steril
                'G20' => 0.85, // Garis kuning pada daun muda
            ],
            'bacterial-leaf-blight' => [
                'G03' => 0.60, // Daun mengering dari ujung (shared with blast, lower weight)
                'G16' => 0.90, // Tepi daun abu-abu keputihan - khas BLB
                'G17' => 0.95, // Eksudat bakteri - sangat khas BLB
                'G18' => 0.75, // Daun menggulung memanjang
                'G19' => 0.85, // Tanaman layu keseluruhan
            ],
        ];

        foreach ($relations as $diseaseSlug => $symptoms) {
            $disease = Disease::where('slug', $diseaseSlug)->first();

            if (! $disease) {
                continue;
            }

            foreach ($symptoms as $symptomCode => $weight) {
                $symptom = Symptom::where('code', $symptomCode)->first();

                if (! $symptom) {
                    continue;
                }

                $disease->symptoms()->attach($symptom->id, ['weight' => $weight]);
            }
        }
    }
}
