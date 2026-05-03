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
