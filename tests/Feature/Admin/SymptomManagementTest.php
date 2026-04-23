<?php

use App\Models\Disease;
use App\Models\Symptom;
use App\Models\User;

it('admin can view symptom management page', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Symptom::create(['code' => 'G01', 'name' => 'Test symptom']);

    $response = $this->actingAs($admin)->get('/admin/symptoms');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('admin/symptoms/index')
            ->has('symptoms', 1)
        );
});

it('admin can create a symptom', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->post('/admin/symptoms', [
        'code' => 'G99',
        'name' => 'Gejala baru',
        'description' => 'Deskripsi gejala baru',
    ]);

    $response->assertRedirect('/admin/symptoms');
    expect(Symptom::where('code', 'G99')->exists())->toBeTrue();
});

it('validates unique code on create', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Symptom::create(['code' => 'G01', 'name' => 'Existing']);

    $response = $this->actingAs($admin)->post('/admin/symptoms', [
        'code' => 'G01',
        'name' => 'Duplicate',
    ]);

    $response->assertSessionHasErrors(['code']);
});

it('admin can update a symptom', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $symptom = Symptom::create(['code' => 'G01', 'name' => 'Old name']);

    $response = $this->actingAs($admin)->put("/admin/symptoms/{$symptom->id}", [
        'code' => 'G01',
        'name' => 'Updated name',
        'description' => 'Updated description',
    ]);

    $response->assertRedirect('/admin/symptoms');
    expect($symptom->fresh()->name)->toBe('Updated name');
});

it('allows same code on update for same symptom', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $symptom = Symptom::create(['code' => 'G01', 'name' => 'Test']);

    $response = $this->actingAs($admin)->put("/admin/symptoms/{$symptom->id}", [
        'code' => 'G01',
        'name' => 'Updated',
    ]);

    $response->assertRedirect('/admin/symptoms');
    $response->assertSessionHasNoErrors();
});

it('admin can delete a symptom', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $symptom = Symptom::create(['code' => 'G01', 'name' => 'To delete']);

    $response = $this->actingAs($admin)->delete("/admin/symptoms/{$symptom->id}");

    $response->assertRedirect('/admin/symptoms');
    expect(Symptom::find($symptom->id))->toBeNull();
});

it('deleting symptom cascades disease_symptom pivot', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $disease = Disease::create(['name' => 'Blast', 'slug' => 'blast', 'description' => 'T', 'cause' => 'T']);
    $symptom = Symptom::create(['code' => 'G01', 'name' => 'Test']);
    $disease->symptoms()->attach($symptom->id, ['weight' => 0.9]);

    $this->actingAs($admin)->delete("/admin/symptoms/{$symptom->id}");

    expect($disease->fresh()->symptoms)->toHaveCount(0);
});

it('regular user cannot access symptom management', function () {
    $user = User::factory()->create(['role' => 'user']);

    $this->actingAs($user)->get('/admin/symptoms')->assertStatus(403);
    $this->actingAs($user)->post('/admin/symptoms', [])->assertStatus(403);
});
