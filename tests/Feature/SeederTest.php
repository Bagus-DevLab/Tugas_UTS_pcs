<?php

use App\Models\Disease;
use App\Models\Symptom;
use App\Models\Treatment;
use Database\Seeders\DiseaseSeeder;
use Database\Seeders\SymptomSeeder;
use Database\Seeders\DiseaseSymptomSeeder;
use Database\Seeders\TreatmentSeeder;

it('seeds 5 diseases', function () {
    $this->seed(DiseaseSeeder::class);

    expect(Disease::count())->toBe(5);

    $slugs = Disease::pluck('slug')->toArray();
    expect($slugs)->toContain('blast')
        ->toContain('brown-spot')
        ->toContain('tungro')
        ->toContain('bacterial-leaf-blight')
        ->toContain('healthy');
});

it('seeds 20 symptoms with unique codes', function () {
    $this->seed(SymptomSeeder::class);

    expect(Symptom::count())->toBe(20);

    $codes = Symptom::pluck('code')->toArray();
    expect($codes)->toContain('G01')
        ->toContain('G10')
        ->toContain('G20');

    // All codes should be unique
    expect(count(array_unique($codes)))->toBe(20);
});

it('seeds disease-symptom relations with weights', function () {
    $this->seed(DiseaseSeeder::class);
    $this->seed(SymptomSeeder::class);
    $this->seed(DiseaseSymptomSeeder::class);

    $blast = Disease::where('slug', 'blast')->first();
    expect($blast->symptoms)->toHaveCount(5);

    // Check weights are between 0 and 1
    foreach ($blast->symptoms as $symptom) {
        $weight = (float) $symptom->pivot->weight;
        expect($weight)->toBeGreaterThan(0)
            ->toBeLessThanOrEqual(1);
    }

    // Healthy should have no symptoms
    $healthy = Disease::where('slug', 'healthy')->first();
    expect($healthy->symptoms)->toHaveCount(0);
});

it('seeds treatments with dosage information', function () {
    $this->seed(DiseaseSeeder::class);
    $this->seed(TreatmentSeeder::class);

    expect(Treatment::count())->toBeGreaterThan(30);

    // Check blast has treatments of different types
    $blast = Disease::where('slug', 'blast')->first();
    $types = $blast->treatments->pluck('type')->unique()->toArray();
    expect($types)->toContain('chemical')
        ->toContain('prevention')
        ->toContain('biological');

    // Check some treatments have dosage
    $withDosage = Treatment::whereNotNull('dosage')->count();
    expect($withDosage)->toBeGreaterThan(10);

    // Check dosage_unit is set when dosage is set
    $invalidDosage = Treatment::whereNotNull('dosage')
        ->whereNull('dosage_unit')
        ->count();
    expect($invalidDosage)->toBe(0);
});

it('seeds healthy disease with prevention treatments', function () {
    $this->seed(DiseaseSeeder::class);
    $this->seed(TreatmentSeeder::class);

    $healthy = Disease::where('slug', 'healthy')->first();
    expect($healthy->treatments)->not->toBeEmpty();

    $types = $healthy->treatments->pluck('type')->unique()->toArray();
    expect($types)->toContain('prevention');
});
