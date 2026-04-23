<?php

use App\Models\Disease;
use App\Models\Symptom;
use App\Models\User;

it('admin can view disease management page', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Disease::create(['name' => 'Blast', 'slug' => 'blast', 'description' => 'Test', 'cause' => 'Test']);

    $response = $this->actingAs($admin)->get('/admin/diseases');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('admin/diseases/index')
            ->has('diseases', 1)
        );
});

it('admin can create a disease', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $symptom = Symptom::create(['code' => 'G01', 'name' => 'Test symptom']);

    $response = $this->actingAs($admin)->post('/admin/diseases', [
        'name' => 'New Disease',
        'latin_name' => 'Novus morbus',
        'description' => 'A new disease',
        'cause' => 'Unknown cause',
        'symptoms' => [
            ['id' => $symptom->id, 'weight' => 0.85],
        ],
    ]);

    $response->assertRedirect('/admin/diseases');

    $disease = Disease::where('name', 'New Disease')->first();
    expect($disease)->not->toBeNull()
        ->and($disease->slug)->toBe('new-disease')
        ->and($disease->symptoms)->toHaveCount(1)
        ->and((float) $disease->symptoms->first()->pivot->weight)->toBe(0.85);
});

it('admin can update a disease', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $disease = Disease::create(['name' => 'Old Name', 'slug' => 'old-name', 'description' => 'Old', 'cause' => 'Old']);

    $response = $this->actingAs($admin)->put("/admin/diseases/{$disease->id}", [
        'name' => 'Updated Name',
        'description' => 'Updated description',
        'cause' => 'Updated cause',
    ]);

    $response->assertRedirect('/admin/diseases');
    expect($disease->fresh()->name)->toBe('Updated Name');
});

it('admin can delete a disease', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $disease = Disease::create(['name' => 'To Delete', 'slug' => 'to-delete', 'description' => 'Test', 'cause' => 'Test']);

    $response = $this->actingAs($admin)->delete("/admin/diseases/{$disease->id}");

    $response->assertRedirect('/admin/diseases');
    expect(Disease::find($disease->id))->toBeNull();
});

it('regular user cannot access disease management', function () {
    $user = User::factory()->create(['role' => 'user']);

    $this->actingAs($user)->get('/admin/diseases')->assertStatus(403);
    $this->actingAs($user)->post('/admin/diseases', [])->assertStatus(403);
});

it('validates required fields on create', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->post('/admin/diseases', []);

    $response->assertSessionHasErrors(['name', 'description', 'cause']);
});
