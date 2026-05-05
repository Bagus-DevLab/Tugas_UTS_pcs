<?php

use App\Models\Disease;
use App\Models\Treatment;
use App\Models\User;

beforeEach(function () {
    Disease::create(['name' => 'Blast', 'slug' => 'blast', 'description' => 'Test', 'cause' => 'Test']);
});

it('pakar can view treatment management page', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::where('slug', 'blast')->first();
    Treatment::create([
        'disease_id' => $disease->id, 'type' => 'chemical',
        'description' => 'Fungisida', 'dosage' => '0.6', 'dosage_unit' => 'gram/L', 'priority' => 1,
    ]);

    $response = $this->actingAs($pakar)->get('/admin/knowledge-base/treatments');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('admin/treatments/index')
            ->has('treatments', 1)
            ->has('diseases', 1)
        );
});

it('pakar can create a treatment with dosage', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::where('slug', 'blast')->first();

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/treatments', [
        'disease_id' => $disease->id,
        'type' => 'chemical',
        'description' => 'Aplikasi fungisida baru',
        'dosage' => '2.5',
        'dosage_unit' => 'ml/L',
        'priority' => 1,
    ]);

    $response->assertRedirect('/admin/knowledge-base/treatments');

    $treatment = Treatment::where('description', 'Aplikasi fungisida baru')->first();
    expect($treatment)->not->toBeNull()
        ->and($treatment->dosage)->toBe('2.5')
        ->and($treatment->dosage_unit)->toBe('ml/L')
        ->and($treatment->type)->toBe('chemical');
});

it('pakar can create a treatment without dosage', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::where('slug', 'blast')->first();

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/treatments', [
        'disease_id' => $disease->id,
        'type' => 'prevention',
        'description' => 'Gunakan varietas tahan',
        'priority' => 1,
    ]);

    $response->assertRedirect('/admin/knowledge-base/treatments');

    $treatment = Treatment::where('description', 'Gunakan varietas tahan')->first();
    expect($treatment->dosage)->toBeNull()
        ->and($treatment->dosage_unit)->toBeNull();
});

it('validates type must be valid enum', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::where('slug', 'blast')->first();

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/treatments', [
        'disease_id' => $disease->id,
        'type' => 'invalid_type',
        'description' => 'Test',
        'priority' => 1,
    ]);

    $response->assertSessionHasErrors(['type']);
});

it('validates dosage_unit required when dosage is set', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::where('slug', 'blast')->first();

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/treatments', [
        'disease_id' => $disease->id,
        'type' => 'chemical',
        'description' => 'Test',
        'dosage' => '2.0',
        // dosage_unit missing
        'priority' => 1,
    ]);

    $response->assertSessionHasErrors(['dosage_unit']);
});

it('pakar can update a treatment', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::where('slug', 'blast')->first();
    $treatment = Treatment::create([
        'disease_id' => $disease->id, 'type' => 'chemical',
        'description' => 'Old', 'priority' => 1,
    ]);

    $response = $this->actingAs($pakar)->put("/admin/knowledge-base/treatments/{$treatment->id}", [
        'disease_id' => $disease->id,
        'type' => 'biological',
        'description' => 'Updated treatment',
        'dosage' => '5',
        'dosage_unit' => 'gram/L',
        'priority' => 2,
    ]);

    $response->assertRedirect('/admin/knowledge-base/treatments');

    $fresh = $treatment->fresh();
    expect($fresh->type)->toBe('biological')
        ->and($fresh->description)->toBe('Updated treatment')
        ->and($fresh->dosage)->toBe('5');
});

it('pakar can delete a treatment', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::where('slug', 'blast')->first();
    $treatment = Treatment::create([
        'disease_id' => $disease->id, 'type' => 'chemical',
        'description' => 'To delete', 'priority' => 1,
    ]);

    $response = $this->actingAs($pakar)->delete("/admin/knowledge-base/treatments/{$treatment->id}");

    $response->assertRedirect('/admin/knowledge-base/treatments');
    expect(Treatment::find($treatment->id))->toBeNull();
});

it('regular user cannot access treatment management', function () {
    $user = User::factory()->create(['role' => 'user']);

    $this->actingAs($user)->get('/admin/knowledge-base/treatments')->assertStatus(403);
    $this->actingAs($user)->post('/admin/knowledge-base/treatments', [])->assertStatus(403);
});

// =============================================================================
// EP: type field (enum: prevention, chemical, biological, cultural)
// =============================================================================

it('accepts all valid treatment type values', function (string $type) {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::where('slug', 'blast')->first();

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/treatments', [
        'disease_id' => $disease->id,
        'type' => $type,
        'description' => 'Test treatment',
        'priority' => 1,
    ]);

    $response->assertSessionDoesntHaveErrors(['type']);
})->with([
    'prevention' => ['prevention'],
    'chemical' => ['chemical'],
    'biological' => ['biological'],
    'cultural' => ['cultural'],
]);

it('rejects invalid treatment type values', function (string $type) {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::where('slug', 'blast')->first();

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/treatments', [
        'disease_id' => $disease->id,
        'type' => $type,
        'description' => 'Test treatment',
        'priority' => 1,
    ]);

    $response->assertSessionHasErrors(['type']);
})->with([
    'organic (invalid)' => ['organic'],
    'mechanical (invalid)' => ['mechanical'],
    'empty string' => [''],
    'uppercase' => ['CHEMICAL'],
]);

// =============================================================================
// BVA: priority (integer, min:0)
// =============================================================================

it('accepts priority at valid boundaries', function (int $priority) {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::where('slug', 'blast')->first();

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/treatments', [
        'disease_id' => $disease->id,
        'type' => 'chemical',
        'description' => 'Test treatment',
        'priority' => $priority,
    ]);

    $response->assertSessionDoesntHaveErrors(['priority']);
})->with([
    'at minimum (0)' => [0],
    'just above minimum (1)' => [1],
    'nominal (5)' => [5],
    'large value (100)' => [100],
]);

it('rejects priority below minimum', function (int $priority) {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::where('slug', 'blast')->first();

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/treatments', [
        'disease_id' => $disease->id,
        'type' => 'chemical',
        'description' => 'Test treatment',
        'priority' => $priority,
    ]);

    $response->assertSessionHasErrors(['priority']);
})->with([
    'below minimum (-1)' => [-1],
    'far below minimum (-10)' => [-10],
]);

// =============================================================================
// BVA: dosage (string, max:50) and dosage_unit (required_with:dosage, max:50)
// =============================================================================

it('accepts dosage at max length boundary', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::where('slug', 'blast')->first();

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/treatments', [
        'disease_id' => $disease->id,
        'type' => 'chemical',
        'description' => 'Test',
        'dosage' => str_repeat('x', 50),
        'dosage_unit' => 'ml/L',
        'priority' => 1,
    ]);

    $response->assertSessionDoesntHaveErrors(['dosage']);
});

it('rejects dosage exceeding max length', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::where('slug', 'blast')->first();

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/treatments', [
        'disease_id' => $disease->id,
        'type' => 'chemical',
        'description' => 'Test',
        'dosage' => str_repeat('x', 51),
        'dosage_unit' => 'ml/L',
        'priority' => 1,
    ]);

    $response->assertSessionHasErrors(['dosage']);
});

it('rejects dosage_unit exceeding max length', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::where('slug', 'blast')->first();

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/treatments', [
        'disease_id' => $disease->id,
        'type' => 'chemical',
        'description' => 'Test',
        'dosage' => '2.5',
        'dosage_unit' => str_repeat('u', 51),
        'priority' => 1,
    ]);

    $response->assertSessionHasErrors(['dosage_unit']);
});

// =============================================================================
// Decision Table: dosage & dosage_unit conditional validation (required_with)
// =============================================================================
//
// Rule: dosage_unit is `nullable|required_with:dosage|string|max:50`
//       dosage is `nullable|string|max:50`
//
// | Rule | C1: dosage present? | C2: dosage_unit present? | Action                    |
// |------|:-------------------:|:------------------------:|---------------------------|
// | R1   | No (null)           | No (null)                | Valid (both absent)        |
// | R2   | No (null)           | Yes                      | Valid (unit alone is OK)   |
// | R3   | Yes                 | No (null)                | INVALID (dosage_unit err)  |
// | R4   | Yes                 | Yes                      | Valid (both present)       |
//

it('applies decision table rules for dosage/dosage_unit conditional validation', function (
    string $rule,
    ?string $dosage,
    ?string $dosageUnit,
    bool $isValid,
    ?string $errorField,
) {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::where('slug', 'blast')->first();

    $payload = [
        'disease_id' => $disease->id,
        'type' => 'chemical',
        'description' => 'Decision table test',
        'priority' => 1,
    ];

    if ($dosage !== null) {
        $payload['dosage'] = $dosage;
    }

    if ($dosageUnit !== null) {
        $payload['dosage_unit'] = $dosageUnit;
    }

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/treatments', $payload);

    if ($isValid) {
        $response->assertSessionDoesntHaveErrors(['dosage', 'dosage_unit']);
    } else {
        $response->assertSessionHasErrors([$errorField]);
    }
})->with([
    'R1: dosage=null, dosage_unit=null → valid (both absent)' => [
        'R1', null, null, true, null,
    ],
    'R2: dosage=null, dosage_unit=present → valid (unit alone OK)' => [
        'R2', null, 'ml/L', true, null,
    ],
    'R3: dosage=present, dosage_unit=null → INVALID (dosage_unit required)' => [
        'R3', '2.5', null, false, 'dosage_unit',
    ],
    'R4: dosage=present, dosage_unit=present → valid (both present)' => [
        'R4', '2.5', 'ml/L', true, null,
    ],
]);
