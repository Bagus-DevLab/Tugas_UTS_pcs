<?php

use App\Models\Disease;
use App\Models\Symptom;
use App\Models\User;

it('pakar can view disease management page', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    Disease::create(['name' => 'Blast', 'slug' => 'blast', 'description' => 'Test', 'cause' => 'Test']);

    $response = $this->actingAs($pakar)->get('/admin/knowledge-base/diseases');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('admin/diseases/index')
            ->has('diseases', 1)
        );
});

it('pakar can create a disease', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $symptom = Symptom::create(['code' => 'G01', 'name' => 'Test symptom']);

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/diseases', [
        'name' => 'New Disease',
        'latin_name' => 'Novus morbus',
        'description' => 'A new disease',
        'cause' => 'Unknown cause',
        'symptoms' => [
            ['id' => $symptom->id, 'weight' => 0.85],
        ],
    ]);

    $response->assertRedirect('/admin/knowledge-base/diseases');

    $disease = Disease::where('name', 'New Disease')->first();
    expect($disease)->not->toBeNull()
        ->and($disease->slug)->toBe('new-disease')
        ->and($disease->symptoms)->toHaveCount(1)
        ->and((float) $disease->symptoms->first()->pivot->weight)->toBe(0.85);
});

it('pakar can update a disease', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::create(['name' => 'Old Name', 'slug' => 'old-name', 'description' => 'Old', 'cause' => 'Old']);

    $response = $this->actingAs($pakar)->put("/admin/knowledge-base/diseases/{$disease->id}", [
        'name' => 'Updated Name',
        'description' => 'Updated description',
        'cause' => 'Updated cause',
    ]);

    $response->assertRedirect('/admin/knowledge-base/diseases');
    expect($disease->fresh()->name)->toBe('Updated Name');
});

it('pakar can delete a disease', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::create(['name' => 'To Delete', 'slug' => 'to-delete', 'description' => 'Test', 'cause' => 'Test']);

    $response = $this->actingAs($pakar)->delete("/admin/knowledge-base/diseases/{$disease->id}");

    $response->assertRedirect('/admin/knowledge-base/diseases');
    expect(Disease::find($disease->id))->toBeNull();
});

it('regular user cannot access disease management', function () {
    $user = User::factory()->create(['role' => 'user']);

    $this->actingAs($user)->get('/admin/knowledge-base/diseases')->assertStatus(403);
    $this->actingAs($user)->post('/admin/knowledge-base/diseases', [])->assertStatus(403);
});

it('validates required fields on create', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/diseases', []);

    $response->assertSessionHasErrors(['name', 'description', 'cause']);
});

// =============================================================================
// BVA: symptoms.*.weight (numeric, min:0, max:1)
// =============================================================================

it('accepts symptom weight at valid boundaries', function (float $weight) {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $symptom = Symptom::create(['code' => 'G01', 'name' => 'Test']);

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/diseases', [
        'name' => 'Test Disease',
        'description' => 'Description',
        'cause' => 'Cause',
        'symptoms' => [
            ['id' => $symptom->id, 'weight' => $weight],
        ],
    ]);

    $response->assertSessionDoesntHaveErrors(['symptoms.0.weight']);
})->with([
    'at minimum (0)' => [0.0],
    'just above minimum (0.01)' => [0.01],
    'nominal (0.5)' => [0.5],
    'just below maximum (0.99)' => [0.99],
    'at maximum (1)' => [1.0],
]);

it('rejects symptom weight at invalid boundaries', function (float $weight) {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $symptom = Symptom::create(['code' => 'G01', 'name' => 'Test']);

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/diseases', [
        'name' => 'Test Disease',
        'description' => 'Description',
        'cause' => 'Cause',
        'symptoms' => [
            ['id' => $symptom->id, 'weight' => $weight],
        ],
    ]);

    $response->assertSessionHasErrors(['symptoms.0.weight']);
})->with([
    'below minimum (-0.01)' => [-0.01],
    'negative (-1)' => [-1.0],
    'above maximum (1.01)' => [1.01],
    'far above maximum (2)' => [2.0],
]);

// =============================================================================
// BVA: name (string, max:255)
// =============================================================================

it('accepts disease name at max length boundary', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/diseases', [
        'name' => str_repeat('a', 255),
        'description' => 'Valid description',
        'cause' => 'Valid cause',
    ]);

    $response->assertSessionDoesntHaveErrors(['name']);
});

it('rejects disease name exceeding max length', function () {
    $pakar = User::factory()->create(['role' => 'pakar']);

    $response = $this->actingAs($pakar)->post('/admin/knowledge-base/diseases', [
        'name' => str_repeat('a', 256),
        'description' => 'Valid description',
        'cause' => 'Valid cause',
    ]);

    $response->assertSessionHasErrors(['name']);
});

// =============================================================================
// EP: role-based access (super_admin also has access)
// =============================================================================

it('super_admin can access disease management', function () {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);
    Disease::create(['name' => 'Blast', 'slug' => 'blast', 'description' => 'T', 'cause' => 'T']);

    $this->actingAs($superAdmin)->get('/admin/knowledge-base/diseases')->assertStatus(200);
});

it('admin cannot access disease management', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)->get('/admin/knowledge-base/diseases')->assertStatus(403);
    $this->actingAs($admin)->post('/admin/knowledge-base/diseases', [])->assertStatus(403);
});
