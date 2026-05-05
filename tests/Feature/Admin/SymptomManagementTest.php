<?php

use App\Models\Disease;
use App\Models\Symptom;
use App\Models\User;

it('pakar can view symptom management page', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    Symptom::create(['code' => 'G01', 'name' => 'Test symptom']);

    $response = $this->actingAs($pakar)->get('/admin/knowledge-base/symptoms');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('admin/symptoms/index')
            ->has('symptoms', 1)
        );
});

it('pakar can create a symptom', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/symptoms', [
        'code' => 'G99',
        'name' => 'Gejala baru',
        'description' => 'Deskripsi gejala baru',
    ]);

    $response->assertRedirect('/admin/knowledge-base/symptoms');
    expect(Symptom::where('code', 'G99')->exists())->toBeTrue();
});

it('validates unique code on create', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    Symptom::create(['code' => 'G01', 'name' => 'Existing']);

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/symptoms', [
        'code' => 'G01',
        'name' => 'Duplicate',
    ]);

    $response->assertSessionHasErrors(['code']);
});

it('pakar can update a symptom', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $symptom = Symptom::create(['code' => 'G01', 'name' => 'Old name']);

    $response = $this->actingAs($pakar)->put("/admin/knowledge-base/symptoms/{$symptom->id}", [
        'code' => 'G01',
        'name' => 'Updated name',
        'description' => 'Updated description',
    ]);

    $response->assertRedirect('/admin/knowledge-base/symptoms');
    expect($symptom->fresh()->name)->toBe('Updated name');
});

it('allows same code on update for same symptom', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $symptom = Symptom::create(['code' => 'G01', 'name' => 'Test']);

    $response = $this->actingAs($pakar)->put("/admin/knowledge-base/symptoms/{$symptom->id}", [
        'code' => 'G01',
        'name' => 'Updated',
    ]);

    $response->assertRedirect('/admin/knowledge-base/symptoms');
    $response->assertSessionHasNoErrors();
});

it('pakar can delete a symptom', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $symptom = Symptom::create(['code' => 'G01', 'name' => 'To delete']);

    $response = $this->actingAs($pakar)->delete("/admin/knowledge-base/symptoms/{$symptom->id}");

    $response->assertRedirect('/admin/knowledge-base/symptoms');
    expect(Symptom::find($symptom->id))->toBeNull();
});

it('deleting symptom cascades disease_symptom pivot', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::create(['name' => 'Blast', 'slug' => 'blast', 'description' => 'T', 'cause' => 'T']);
    $symptom = Symptom::create(['code' => 'G01', 'name' => 'Test']);
    $disease->symptoms()->attach($symptom->id, ['weight' => 0.9]);

    $this->actingAs($pakar)->delete("/admin/knowledge-base/symptoms/{$symptom->id}");

    expect($disease->fresh()->symptoms)->toHaveCount(0);
});

it('regular user cannot access symptom management', function () {
    $user = User::factory()->create(['role' => 'user']);

    $this->actingAs($user)->get('/admin/knowledge-base/symptoms')->assertStatus(403);
    $this->actingAs($user)->post('/admin/knowledge-base/symptoms', [])->assertStatus(403);
});

// =============================================================================
// BVA: code (string, max:10)
// =============================================================================

it('accepts symptom code at valid length boundaries', function (string $code) {
    $pakar = User::factory()->create(['role' => 'pakar']);

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/symptoms', [
        'code' => $code,
        'name' => 'Test symptom',
    ]);

    $response->assertSessionDoesntHaveErrors(['code']);
})->with([
    'single char (1)' => ['G'],
    'at max (10 chars)' => ['G123456789'],
    'just below max (9 chars)' => ['G12345678'],
]);

it('rejects symptom code exceeding max length', function (string $code) {
    $pakar = User::factory()->create(['role' => 'pakar']);

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/symptoms', [
        'code' => $code,
        'name' => 'Test symptom',
    ]);

    $response->assertSessionHasErrors(['code']);
})->with([
    'above max (11 chars)' => ['G1234567890'],
    'far above max (20 chars)' => ['G1234567890123456789'],
]);

// =============================================================================
// BVA: name (string, max:255)
// =============================================================================

it('accepts symptom name at max length boundary', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/symptoms', [
        'code' => 'G50',
        'name' => str_repeat('a', 255),
    ]);

    $response->assertSessionDoesntHaveErrors(['name']);
});

it('rejects symptom name exceeding max length', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/symptoms', [
        'code' => 'G50',
        'name' => str_repeat('a', 256),
    ]);

    $response->assertSessionHasErrors(['name']);
});

// =============================================================================
// EP: required fields validation
// =============================================================================

it('validates required fields on symptom create', function (string $field) {
    $pakar = User::factory()->create(['role' => 'pakar']);

    $data = ['code' => 'G50', 'name' => 'Test'];
    unset($data[$field]);

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/symptoms', $data);

    $response->assertSessionHasErrors([$field]);
})->with([
    'code required' => ['code'],
    'name required' => ['name'],
]);
