<?php

use App\Models\Disease;
use App\Models\Symptom;
use App\Models\Treatment;
use App\Models\Detection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can create a disease', function () {
    $disease = Disease::create([
        'name' => 'Blast',
        'slug' => 'blast',
        'latin_name' => 'Pyricularia oryzae',
        'description' => 'Penyakit blast pada padi.',
        'cause' => 'Jamur Pyricularia oryzae.',
    ]);

    expect($disease)->toBeInstanceOf(Disease::class)
        ->and($disease->name)->toBe('Blast')
        ->and($disease->slug)->toBe('blast')
        ->and($disease->latin_name)->toBe('Pyricularia oryzae');
});

it('has many symptoms through pivot', function () {
    $disease = Disease::create([
        'name' => 'Blast',
        'slug' => 'blast',
        'description' => 'Test',
        'cause' => 'Test',
    ]);

    $symptom = Symptom::create([
        'code' => 'G01',
        'name' => 'Bercak belah ketupat',
    ]);

    $disease->symptoms()->attach($symptom->id, ['weight' => 0.95]);

    expect($disease->symptoms)->toHaveCount(1)
        ->and($disease->symptoms->first()->pivot->weight)->toBe('0.95');
});

it('has many treatments', function () {
    $disease = Disease::create([
        'name' => 'Blast',
        'slug' => 'blast',
        'description' => 'Test',
        'cause' => 'Test',
    ]);

    Treatment::create([
        'disease_id' => $disease->id,
        'type' => 'chemical',
        'description' => 'Aplikasi fungisida',
        'dosage' => '0.6',
        'dosage_unit' => 'gram/L',
        'priority' => 1,
    ]);

    Treatment::create([
        'disease_id' => $disease->id,
        'type' => 'prevention',
        'description' => 'Varietas tahan',
        'priority' => 2,
    ]);

    expect($disease->treatments)->toHaveCount(2)
        ->and($disease->treatments->first()->type)->toBe('chemical');
});

it('has many detections', function () {
    $user = User::factory()->create();
    $disease = Disease::create([
        'name' => 'Blast',
        'slug' => 'blast',
        'description' => 'Test',
        'cause' => 'Test',
    ]);

    Detection::create([
        'user_id' => $user->id,
        'disease_id' => $disease->id,
        'method' => 'image',
        'label' => 'Blast',
        'confidence' => 92.5,
    ]);

    expect($disease->detections)->toHaveCount(1);
});
