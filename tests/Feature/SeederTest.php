<?php

use App\Models\Disease;
use App\Models\Symptom;
use App\Models\Treatment;
use Database\Seeders\DiseaseSeeder;
use Database\Seeders\DiseaseSymptomSeeder;
use Database\Seeders\SymptomSeeder;
use Database\Seeders\TreatmentSeeder;

it('seeds 11 diseases', function () {
    $this->seed(DiseaseSeeder::class);

    expect(Disease::count())->toBe(11);

    $slugs = Disease::pluck('slug')->toArray();
    expect($slugs)->toContain('blast')
        ->toContain('brown-spot')
        ->toContain('tungro')
        ->toContain('bacterial-leaf-blight')
        ->toContain('healthy')
        ->toContain('hispa')
        ->toContain('dead-heart')
        ->toContain('downy-mildew')
        ->toContain('bacterial-leaf-streak')
        ->toContain('bacterial-panicle-blight')
        ->toContain('leaf-smut');
});

it('seeds 47 symptoms with unique codes', function () {
    $this->seed(SymptomSeeder::class);

    expect(Symptom::count())->toBe(47);

    $codes = Symptom::pluck('code')->toArray();
    expect($codes)->toContain('G01')
        ->toContain('G20')
        ->toContain('G30')
        ->toContain('G47');

    // All codes should be unique
    expect(count(array_unique($codes)))->toBe(47);
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

    // New diseases should also have symptoms
    $hispa = Disease::where('slug', 'hispa')->first();
    expect($hispa->symptoms)->toHaveCount(5);

    $deadHeart = Disease::where('slug', 'dead-heart')->first();
    expect($deadHeart->symptoms)->toHaveCount(5);

    // Healthy should have no symptoms
    $healthy = Disease::where('slug', 'healthy')->first();
    expect($healthy->symptoms)->toHaveCount(0);
});

it('seeds treatments with dosage information', function () {
    $this->seed(DiseaseSeeder::class);
    $this->seed(TreatmentSeeder::class);

    expect(Treatment::count())->toBeGreaterThan(40);

    // Check blast has treatments of different types
    $blast = Disease::where('slug', 'blast')->first();
    $types = $blast->treatments->pluck('type')->unique()->toArray();
    expect($types)->toContain('chemical')
        ->toContain('prevention')
        ->toContain('biological');

    // New diseases should have treatments
    $hispa = Disease::where('slug', 'hispa')->first();
    expect($hispa->treatments)->not->toBeEmpty();

    $leafSmut = Disease::where('slug', 'leaf-smut')->first();
    expect($leafSmut->treatments)->not->toBeEmpty();

    // Check some treatments have dosage
    $withDosage = Treatment::whereNotNull('dosage')->count();
    expect($withDosage)->toBeGreaterThan(15);

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
});
