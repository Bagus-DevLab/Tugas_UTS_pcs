<?php

use App\Models\User;

it('allows super_admin to access admin routes', function () {
    $user = User::factory()->create(['role' => 'super_admin']);

    $this->actingAs($user)->get('/admin/diseases')->assertStatus(200);
    $this->actingAs($user)->get('/admin/symptoms')->assertStatus(200);
    $this->actingAs($user)->get('/admin/treatments')->assertStatus(200);
    $this->actingAs($user)->get('/admin/detections')->assertStatus(200);
    $this->actingAs($user)->get('/admin/users')->assertStatus(200);
});

it('allows admin to access admin routes but not user management', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $this->actingAs($user)->get('/admin/diseases')->assertStatus(200);
    $this->actingAs($user)->get('/admin/symptoms')->assertStatus(200);
    $this->actingAs($user)->get('/admin/treatments')->assertStatus(200);
    $this->actingAs($user)->get('/admin/detections')->assertStatus(200);

    // Admin cannot access user management
    $this->actingAs($user)->get('/admin/users')->assertStatus(403);
});

it('blocks regular user from all admin routes', function () {
    $user = User::factory()->create(['role' => 'user']);

    $this->actingAs($user)->get('/admin/diseases')->assertStatus(403);
    $this->actingAs($user)->get('/admin/symptoms')->assertStatus(403);
    $this->actingAs($user)->get('/admin/treatments')->assertStatus(403);
    $this->actingAs($user)->get('/admin/detections')->assertStatus(403);
    $this->actingAs($user)->get('/admin/users')->assertStatus(403);
});

it('blocks unauthenticated users from admin routes', function () {
    $this->get('/admin/diseases')->assertRedirect('/login');
    $this->get('/admin/users')->assertRedirect('/login');
});
