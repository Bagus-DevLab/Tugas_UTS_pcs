<?php

use App\Models\Detection;
use App\Models\User;

it('admin can view all users detections', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user1 = User::factory()->create(['role' => 'user']);
    $user2 = User::factory()->create(['role' => 'user']);

    makeDetection($user1, ['label' => 'Blast', 'confidence' => 90]);
    makeDetection($user2, ['label' => 'Tungro', 'confidence' => 85]);

    $response = $this->actingAs($admin)->get('/admin/detections');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('admin/detections/index')
            ->has('detections.data', 2)
        );
});

it('admin can filter detections by method', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create(['role' => 'user']);

    makeDetection($user, ['method' => 'image', 'label' => 'Blast']);
    makeDetection($user, ['method' => 'expert_system', 'label' => 'Tungro']);

    $response = $this->actingAs($admin)->get('/admin/detections?method=image');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->has('detections.data', 1)
            ->where('detections.data.0.method', 'image')
        );
});

it('admin can search detections by user name', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $alice = User::factory()->create(['role' => 'user', 'name' => 'Alice']);
    $bob = User::factory()->create(['role' => 'user', 'name' => 'Bob']);

    makeDetection($alice, ['label' => 'Blast']);
    makeDetection($bob, ['label' => 'Tungro']);

    $response = $this->actingAs($admin)->get('/admin/detections?user_search=Alice');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->has('detections.data', 1)
        );
});

it('admin can view detection detail', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create(['role' => 'user']);
    $detection = makeDetection($user, ['label' => 'Blast', 'confidence' => 92.5]);

    $response = $this->actingAs($admin)->get("/admin/detections/{$detection->id}");

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('admin/detections/show')
            ->has('detection')
            ->where('detection.id', $detection->id)
        );
});

it('admin can delete any detection', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create(['role' => 'user']);
    $detection = makeDetection($user, ['label' => 'Blast']);

    $response = $this->actingAs($admin)->delete("/admin/detections/{$detection->id}");

    $response->assertRedirect('/admin/detections');
    expect(Detection::find($detection->id))->toBeNull();
});

it('regular user cannot access detection management', function () {
    $user = User::factory()->create(['role' => 'user']);

    $this->actingAs($user)->get('/admin/detections')->assertStatus(403);
});

it('super admin can also access detection management', function () {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);

    $response = $this->actingAs($superAdmin)->get('/admin/detections');

    $response->assertStatus(200);
});
