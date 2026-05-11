<?php

use App\Models\Detection;
use App\Models\Disease;
use App\Models\Symptom;
use App\Models\User;

beforeEach(function () {
    // Seed minimal knowledge base for testing
    $blast = Disease::create([
        'name' => 'Blast', 'slug' => 'blast',
        'description' => 'Penyakit blast', 'cause' => 'Jamur',
    ]);
    $brownSpot = Disease::create([
        'name' => 'Brown Spot', 'slug' => 'brown-spot',
        'description' => 'Bercak coklat', 'cause' => 'Jamur',
    ]);
    Disease::create([
        'name' => 'Healthy', 'slug' => 'healthy',
        'description' => 'Sehat', 'cause' => '-',
    ]);

    $g01 = Symptom::create(['code' => 'G01', 'name' => 'Bercak belah ketupat']);
    $g02 = Symptom::create(['code' => 'G02', 'name' => 'Abu-abu tengah coklat tepi']);
    $g06 = Symptom::create(['code' => 'G06', 'name' => 'Bercak oval coklat']);

    $blast->symptoms()->attach($g01->id, ['weight' => 0.95]);
    $blast->symptoms()->attach($g02->id, ['weight' => 0.90]);
    $brownSpot->symptoms()->attach($g06->id, ['weight' => 0.95]);
});

it('shows expert system index page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/expert-system');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('expert-system/index')
            ->has('symptoms', 3)
            ->has('diseases', 3)
        );
});

it('can diagnose with selected symptoms', function () {
    $user = User::factory()->create();
    $g01 = Symptom::where('code', 'G01')->first();
    $g02 = Symptom::where('code', 'G02')->first();

    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', [
        'symptom_ids' => [$g01->id, $g02->id],
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'results' => [
                '*' => [
                    'disease',
                    'certainty_factor',
                    'matching_symptoms',
                    'total_symptoms',
                ],
            ],
            'selected_symptoms',
        ]);

    $results = $response->json('results');
    expect($results)->not->toBeEmpty()
        ->and($results[0]['disease']['slug'])->toBe('blast')
        ->and($results[0]['certainty_factor'])->toBeGreaterThan(0);
});

it('returns empty results for unmatched symptoms', function () {
    $user = User::factory()->create();

    // Create a symptom not linked to any disease
    $orphan = Symptom::create(['code' => 'G99', 'name' => 'Unlinked symptom']);

    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', [
        'symptom_ids' => [$orphan->id],
    ]);

    $response->assertStatus(200);
    expect($response->json('results'))->toBeEmpty();
});

it('validates symptom_ids is required', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['symptom_ids']);
});

it('validates symptom_ids must exist', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', [
        'symptom_ids' => [9999],
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['symptom_ids.0']);
});

it('calculates certainty factor correctly', function () {
    $user = User::factory()->create();
    $g01 = Symptom::where('code', 'G01')->first();
    $g02 = Symptom::where('code', 'G02')->first();

    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', [
        'symptom_ids' => [$g01->id, $g02->id],
    ]);

    $results = $response->json('results');
    $blastResult = collect($results)->firstWhere('disease.slug', 'blast');

    // CF_combine(0.95, 0.90) = 0.95 + 0.90 * (1 - 0.95) = 0.95 + 0.045 = 0.995
    // As percentage: 99.50
    expect($blastResult['certainty_factor'])->toBe(99.50);
});

it('can store expert system detection result', function () {
    $user = User::factory()->create();
    $blast = Disease::where('slug', 'blast')->first();

    $response = $this->actingAs($user)->post('/expert-system', [
        'disease_id' => $blast->id,
        'label' => 'Blast',
        'confidence' => 99.50,
        'temperature' => 28.0,
        'scanned_at' => now()->toISOString(),
        'scan_duration_ms' => 50,
        'latitude' => -6.2088,
        'longitude' => 106.8456,
        'connection_status' => 'online',
        'selected_symptoms' => json_encode([1, 2]),
    ]);

    $response->assertRedirect();

    $detection = Detection::first();
    expect($detection)->not->toBeNull()
        ->and($detection->method)->toBe('expert_system')
        ->and($detection->label)->toBe('Blast')
        ->and($detection->user_id)->toBe($user->id);
});

it('allows public access to expert system page but requires auth for actions', function () {
    // Public access to view page
    $this->get('/expert-system')->assertOk();

    // But actions require authentication
    $this->postJson('/expert-system/diagnose', [])->assertStatus(401);
});

// =============================================================================
// BVA: symptom_ids (array, min:1 element)
// =============================================================================

it('accepts symptom_ids at minimum array size (1 element)', function () {
    $user = User::factory()->create();
    $g01 = Symptom::where('code', 'G01')->first();

    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', [
        'symptom_ids' => [$g01->id],
    ]);

    $response->assertStatus(200);
});

it('accepts symptom_ids with multiple elements', function () {
    $user = User::factory()->create();
    $symptoms = Symptom::all();

    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', [
        'symptom_ids' => $symptoms->pluck('id')->toArray(),
    ]);

    $response->assertStatus(200);
});

it('rejects symptom_ids below minimum (empty array)', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', [
        'symptom_ids' => [],
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['symptom_ids']);
});

// =============================================================================
// EP: symptom_ids type validation
// =============================================================================

it('rejects symptom_ids with invalid types', function (mixed $value) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', [
        'symptom_ids' => $value,
    ]);

    $response->assertStatus(422);
})->with([
    'string instead of array' => ['not-an-array'],
    'integer instead of array' => [123],
    'null' => [null],
]);

// =============================================================================
// EP: store detection - confidence boundaries (reuses detection validation)
// =============================================================================

it('accepts expert system store with valid confidence boundaries', function (float|int $confidence) {
    $user = User::factory()->create();
    $blast = Disease::where('slug', 'blast')->first();

    $response = $this->actingAs($user)->post('/expert-system', [
        'disease_id' => $blast->id,
        'label' => 'Blast',
        'confidence' => $confidence,
        'selected_symptoms' => json_encode([1]),
    ]);

    $response->assertSessionDoesntHaveErrors(['confidence']);
})->with([
    'at minimum (0)' => [0],
    'nominal (50)' => [50],
    'at maximum (100)' => [100],
]);

it('rejects expert system store with invalid confidence', function (float|int $confidence) {
    $user = User::factory()->create();
    $blast = Disease::where('slug', 'blast')->first();

    $response = $this->actingAs($user)->post('/expert-system', [
        'disease_id' => $blast->id,
        'label' => 'Blast',
        'confidence' => $confidence,
        'selected_symptoms' => json_encode([1]),
    ]);

    $response->assertSessionHasErrors(['confidence']);
})->with([
    'below minimum (-0.01)' => [-0.01],
    'above maximum (100.01)' => [100.01],
]);

// =============================================================================
// SAMPLING TESTING
// =============================================================================
//
// Dengan 47 gejala, total kemungkinan kombinasi input = 2^47 - 1 ≈ 140 triliun.
// Exhaustive testing mustahil. Kita menggunakan strategi sampling:
//
// 1. Boundary Sampling   : Input minimum (1 gejala) dan maximum (semua gejala)
// 2. Disease-Aligned     : Gejala yang presisi mengarah ke 1 penyakit (exact match)
// 3. Cross-Disease       : Campuran gejala dari 2+ penyakit (conflict/noise)
//

// =============================================================================
// Sampling: Boundary - Minimum Input (1 symptom)
// =============================================================================

it('[Sampling] diagnoses correctly with minimum input (1 symptom)', function () {
    $user = User::factory()->create();
    $g01 = Symptom::where('code', 'G01')->first();

    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', [
        'symptom_ids' => [$g01->id],
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'results' => [
                '*' => ['disease', 'certainty_factor', 'matching_symptoms', 'total_symptoms'],
            ],
            'selected_symptoms',
        ]);

    $results = $response->json('results');
    expect($results)->not->toBeEmpty();

    // With only G01 (weight 0.95 for Blast), CF = 0.95 * 100 = 95
    $topResult = $results[0];
    expect($topResult['disease']['slug'])->toBe('blast')
        ->and((float) $topResult['certainty_factor'])->toBe(95.0)
        ->and($topResult['matching_symptoms'])->toBe(1);
});

// =============================================================================
// Sampling: Boundary - Maximum Input (all symptoms in database)
// =============================================================================

it('[Sampling] handles maximum input without crash (all symptoms)', function () {
    $user = User::factory()->create();

    // Seed additional symptoms and diseases to simulate a fuller knowledge base
    $tungro = Disease::create([
        'name' => 'Tungro', 'slug' => 'tungro',
        'description' => 'Virus tungro', 'cause' => 'Virus',
    ]);
    $g11 = Symptom::create(['code' => 'G11', 'name' => 'Daun menguning dari ujung']);
    $g12 = Symptom::create(['code' => 'G12', 'name' => 'Tanaman kerdil']);
    $g13 = Symptom::create(['code' => 'G13', 'name' => 'Anakan berkurang']);
    $tungro->symptoms()->attach($g11->id, ['weight' => 0.90]);
    $tungro->symptoms()->attach($g12->id, ['weight' => 0.85]);
    $tungro->symptoms()->attach($g13->id, ['weight' => 0.80]);

    // Add more unlinked symptoms to increase total count
    for ($i = 20; $i <= 30; $i++) {
        Symptom::create(['code' => "G{$i}", 'name' => "Gejala tambahan {$i}"]);
    }

    // Send ALL symptoms in the database
    $allSymptomIds = Symptom::pluck('id')->toArray();
    expect(count($allSymptomIds))->toBeGreaterThan(10); // Ensure we have many symptoms

    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', [
        'symptom_ids' => $allSymptomIds,
    ]);

    // Engine must not crash - no 500, no timeout, no memory error
    $response->assertStatus(200)
        ->assertJsonStructure([
            'results',
            'selected_symptoms',
        ]);

    $results = $response->json('results');
    // With all symptoms sent, multiple diseases should match
    expect($results)->not->toBeEmpty();

    // Verify CF values are within valid range (0-100)
    foreach ($results as $result) {
        expect($result['certainty_factor'])->toBeGreaterThanOrEqual(0)
            ->and($result['certainty_factor'])->toBeLessThanOrEqual(100);
    }
});

// =============================================================================
// Sampling: Disease-Aligned - Exact Match (all symptoms of one disease)
// =============================================================================

it('[Sampling] ranks target disease first when all its symptoms are selected (disease-aligned)', function () {
    $user = User::factory()->create();

    // Blast has G01 (0.95) and G02 (0.90) in beforeEach setup
    $blastSymptomIds = Disease::where('slug', 'blast')->first()
        ->symptoms->pluck('id')->toArray();

    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', [
        'symptom_ids' => $blastSymptomIds,
    ]);

    $response->assertStatus(200);

    $results = $response->json('results');
    expect($results)->not->toBeEmpty();

    // Blast must be the TOP prediction (highest CF)
    $topResult = $results[0];
    expect($topResult['disease']['slug'])->toBe('blast');

    // CF_combine(0.95, 0.90) = 0.95 + 0.90 * (1 - 0.95) = 0.95 + 0.045 = 0.995
    // As percentage: 99.50
    expect($topResult['certainty_factor'])->toBe(99.50);

    // All symptoms of blast should match
    expect($topResult['matching_symptoms'])->toBe(count($blastSymptomIds))
        ->and($topResult['total_symptoms'])->toBe(count($blastSymptomIds));
});

it('[Sampling] ranks brown-spot first when only its symptoms are selected', function () {
    $user = User::factory()->create();

    // Brown Spot has G06 (0.95) in beforeEach setup
    $brownSpotSymptomIds = Disease::where('slug', 'brown-spot')->first()
        ->symptoms->pluck('id')->toArray();

    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', [
        'symptom_ids' => $brownSpotSymptomIds,
    ]);

    $response->assertStatus(200);

    $results = $response->json('results');
    expect($results)->not->toBeEmpty();

    // Brown Spot must be the top prediction
    expect($results[0]['disease']['slug'])->toBe('brown-spot')
        ->and((float) $results[0]['certainty_factor'])->toBe(95.0); // Single symptom: 0.95 * 100
});

// =============================================================================
// Sampling: Cross-Disease - Conflict Handling (symptoms from multiple diseases)
// =============================================================================

it('[Sampling] handles cross-disease symptom conflict without errors', function () {
    $user = User::factory()->create();

    // Add a second disease with overlapping symptom scenario
    $tungro = Disease::create([
        'name' => 'Tungro', 'slug' => 'tungro',
        'description' => 'Virus tungro', 'cause' => 'Virus',
    ]);
    $g11 = Symptom::create(['code' => 'G11', 'name' => 'Daun menguning dari ujung']);
    $g12 = Symptom::create(['code' => 'G12', 'name' => 'Tanaman kerdil']);
    $tungro->symptoms()->attach($g11->id, ['weight' => 0.90]);
    $tungro->symptoms()->attach($g12->id, ['weight' => 0.85]);

    // Mix: 1 symptom from Blast (G01) + 2 symptoms from Tungro (G11, G12)
    $g01 = Symptom::where('code', 'G01')->first();
    $mixedSymptomIds = [$g01->id, $g11->id, $g12->id];

    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', [
        'symptom_ids' => $mixedSymptomIds,
    ]);

    // Must not crash - no division by zero, no logical error
    $response->assertStatus(200)
        ->assertJsonStructure([
            'results' => [
                '*' => ['disease', 'certainty_factor', 'matching_symptoms', 'total_symptoms'],
            ],
        ]);

    $results = $response->json('results');

    // Both diseases should appear in results
    $slugs = collect($results)->pluck('disease.slug')->toArray();
    expect($slugs)->toContain('blast')
        ->and($slugs)->toContain('tungro');

    // Tungro should rank higher (2 matching symptoms with high weights)
    // Tungro CF: CF_combine(0.90, 0.85) = 0.90 + 0.85*(1-0.90) = 0.90 + 0.085 = 0.985 → 98.5
    // Blast CF: single G01 = 0.95 → 95
    expect($results[0]['disease']['slug'])->toBe('tungro')
        ->and((float) $results[0]['certainty_factor'])->toBe(98.5);
    expect($results[1]['disease']['slug'])->toBe('blast')
        ->and((float) $results[1]['certainty_factor'])->toBe(95.0);
});

it('[Sampling] handles shared symptoms between diseases correctly', function () {
    $user = User::factory()->create();

    // Create a disease that shares a symptom with Blast (G01)
    $blb = Disease::create([
        'name' => 'Bacterial Leaf Blight', 'slug' => 'blb',
        'description' => 'BLB', 'cause' => 'Bakteri',
    ]);
    // BLB also uses G01 but with lower weight
    $g01 = Symptom::where('code', 'G01')->first();
    $g16 = Symptom::create(['code' => 'G16', 'name' => 'Daun mengering dari tepi']);
    $blb->symptoms()->attach($g01->id, ['weight' => 0.60]);
    $blb->symptoms()->attach($g16->id, ['weight' => 0.90]);

    // Send only G01 (shared between Blast and BLB)
    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', [
        'symptom_ids' => [$g01->id],
    ]);

    $response->assertStatus(200);

    $results = $response->json('results');
    $slugs = collect($results)->pluck('disease.slug')->toArray();

    // Both diseases should appear since G01 is shared
    expect($slugs)->toContain('blast')
        ->and($slugs)->toContain('blb');

    // Blast should rank higher (G01 weight 0.95 > BLB G01 weight 0.60)
    expect($results[0]['disease']['slug'])->toBe('blast')
        ->and((float) $results[0]['certainty_factor'])->toBe(95.0);
    expect($results[1]['disease']['slug'])->toBe('blb')
        ->and((float) $results[1]['certainty_factor'])->toBe(60.0);
});

it('[Sampling] returns empty results when symptoms match no disease', function () {
    $user = User::factory()->create();

    // Create orphan symptoms not linked to any disease
    $orphan1 = Symptom::create(['code' => 'G98', 'name' => 'Orphan symptom 1']);
    $orphan2 = Symptom::create(['code' => 'G99', 'name' => 'Orphan symptom 2']);

    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', [
        'symptom_ids' => [$orphan1->id, $orphan2->id],
    ]);

    $response->assertStatus(200);

    // No disease should match orphan symptoms
    expect($response->json('results'))->toBeEmpty();
});
