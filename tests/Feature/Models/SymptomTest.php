<?php

use App\Models\Disease;
use App\Models\Symptom;
it('can create a symptom', function () {
    $symptom = Symptom::create([
        'code' => 'G01',
        'name' => 'Bercak berbentuk belah ketupat pada daun',
        'description' => 'Gejala khas blast.',
    ]);

    expect($symptom)->toBeInstanceOf(Symptom::class)
        ->and($symptom->code)->toBe('G01')
        ->and($symptom->name)->toBe('Bercak berbentuk belah ketupat pada daun');
});

it('has unique code constraint', function () {
    Symptom::create(['code' => 'G01', 'name' => 'Symptom 1']);

    Symptom::create(['code' => 'G01', 'name' => 'Symptom 2']);
})->throws(\Illuminate\Database\UniqueConstraintViolationException::class);

it('belongs to many diseases through pivot', function () {
    $symptom = Symptom::create(['code' => 'G01', 'name' => 'Test symptom']);

    $disease1 = Disease::create([
        'name' => 'Blast', 'slug' => 'blast',
        'description' => 'Test', 'cause' => 'Test',
    ]);
    $disease2 = Disease::create([
        'name' => 'BLB', 'slug' => 'blb',
        'description' => 'Test', 'cause' => 'Test',
    ]);

    $symptom->diseases()->attach($disease1->id, ['weight' => 0.95]);
    $symptom->diseases()->attach($disease2->id, ['weight' => 0.60]);

    expect($symptom->diseases)->toHaveCount(2)
        ->and((float) $symptom->diseases->first()->pivot->weight)->toBe(0.95);
});
