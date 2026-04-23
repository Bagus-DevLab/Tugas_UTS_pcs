<?php

use App\Models\Disease;
use App\Models\Symptom;
use App\Models\Detection;
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

it('requires authentication', function () {
    $this->get('/expert-system')->assertRedirect('/login');
    $this->postJson('/expert-system/diagnose', [])->assertStatus(401);
});
