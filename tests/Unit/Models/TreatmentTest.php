<?php

use App\Models\Disease;
use App\Models\Treatment;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can create a treatment with dosage', function () {
    $disease = Disease::create([
        'name' => 'Blast', 'slug' => 'blast',
        'description' => 'Test', 'cause' => 'Test',
    ]);

    $treatment = Treatment::create([
        'disease_id' => $disease->id,
        'type' => 'chemical',
        'description' => 'Aplikasi fungisida Tricyclazole 75 WP',
        'dosage' => '0.6',
        'dosage_unit' => 'gram/L',
        'priority' => 1,
    ]);

    expect($treatment->type)->toBe('chemical')
        ->and($treatment->dosage)->toBe('0.6')
        ->and($treatment->dosage_unit)->toBe('gram/L')
        ->and($treatment->priority)->toBe(1);
});

it('can create a treatment without dosage', function () {
    $disease = Disease::create([
        'name' => 'Blast', 'slug' => 'blast',
        'description' => 'Test', 'cause' => 'Test',
    ]);

    $treatment = Treatment::create([
        'disease_id' => $disease->id,
        'type' => 'prevention',
        'description' => 'Gunakan varietas tahan blast',
        'priority' => 1,
    ]);

    expect($treatment->dosage)->toBeNull()
        ->and($treatment->dosage_unit)->toBeNull();
});

it('belongs to a disease', function () {
    $disease = Disease::create([
        'name' => 'Blast', 'slug' => 'blast',
        'description' => 'Test', 'cause' => 'Test',
    ]);

    $treatment = Treatment::create([
        'disease_id' => $disease->id,
        'type' => 'chemical',
        'description' => 'Test treatment',
        'priority' => 1,
    ]);

    expect($treatment->disease->id)->toBe($disease->id)
        ->and($treatment->disease->name)->toBe('Blast');
});
