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
