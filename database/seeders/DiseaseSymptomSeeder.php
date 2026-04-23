<?php

namespace Database\Seeders;

use App\Models\Disease;
use App\Models\Symptom;
use Illuminate\Database\Seeder;

class DiseaseSymptomSeeder extends Seeder
{
    public function run(): void
    {
        $relations = [
            'blast' => [
                'G01' => 0.95, 'G02' => 0.90, 'G03' => 0.70, 'G04' => 0.85, 'G05' => 0.75,
            ],
            'brown-spot' => [
                'G06' => 0.95, 'G07' => 0.85, 'G08' => 0.70, 'G09' => 0.80, 'G10' => 0.65,
            ],
            'tungro' => [
                'G11' => 0.90, 'G12' => 0.85, 'G13' => 0.80, 'G14' => 0.70, 'G15' => 0.75, 'G20' => 0.85,
            ],
            'bacterial-leaf-blight' => [
                'G03' => 0.60, 'G16' => 0.90, 'G17' => 0.95, 'G18' => 0.75, 'G19' => 0.85,
            ],
            'hispa' => [
                'G21' => 0.95, 'G22' => 0.90, 'G23' => 0.85, 'G24' => 0.80, 'G25' => 0.70,
            ],
            'dead-heart' => [
                'G26' => 0.95, 'G27' => 0.80, 'G28' => 0.90, 'G29' => 0.75, 'G30' => 0.70,
            ],
            'downy-mildew' => [
                'G31' => 0.90, 'G32' => 0.80, 'G33' => 0.85, 'G34' => 0.95, 'G35' => 0.75,
            ],
            'bacterial-leaf-streak' => [
                'G36' => 0.95, 'G37' => 0.90, 'G38' => 0.80, 'G39' => 0.75,
            ],
            'bacterial-panicle-blight' => [
                'G40' => 0.90, 'G41' => 0.85, 'G42' => 0.80, 'G43' => 0.75, 'G05' => 0.65,
            ],
            'leaf-smut' => [
                'G44' => 0.95, 'G45' => 0.85, 'G46' => 0.80, 'G47' => 0.70,
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
