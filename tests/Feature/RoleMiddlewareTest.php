<?php

use App\Models\User;

it('allows super_admin to access all admin routes', function () {
    $user = User::factory()->create(['role' => 'super_admin']);

    // Knowledge Base routes (super_admin + pakar)
    $this->actingAs($user)->get('/admin/knowledge-base/diseases')->assertStatus(200);
    $this->actingAs($user)->get('/admin/knowledge-base/symptoms')->assertStatus(200);
    $this->actingAs($user)->get('/admin/knowledge-base/treatments')->assertStatus(200);

    // Shared admin routes (super_admin + admin + pakar)
    $this->actingAs($user)->get('/admin/detections')->assertStatus(200);

    // System routes (super_admin only)
    $this->actingAs($user)->get('/admin/system/users')->assertStatus(200);
});

it('allows pakar to access knowledge-base routes but not system routes', function () {
    $user = User::factory()->create(['role' => 'pakar']);

    // Knowledge Base routes (super_admin + pakar)
    $this->actingAs($user)->get('/admin/knowledge-base/diseases')->assertStatus(200);
    $this->actingAs($user)->get('/admin/knowledge-base/symptoms')->assertStatus(200);
    $this->actingAs($user)->get('/admin/knowledge-base/treatments')->assertStatus(200);

    // Shared admin routes (super_admin + admin + pakar)
    $this->actingAs($user)->get('/admin/detections')->assertStatus(200);

    // System routes - pakar cannot access
    $this->actingAs($user)->get('/admin/system/users')->assertStatus(403);
});

it('allows admin to access system routes but not knowledge-base routes', function () {
    $user = User::factory()->create(['role' => 'admin']);

    // Knowledge Base routes - admin cannot access
    $this->actingAs($user)->get('/admin/knowledge-base/diseases')->assertStatus(403);
    $this->actingAs($user)->get('/admin/knowledge-base/symptoms')->assertStatus(403);
    $this->actingAs($user)->get('/admin/knowledge-base/treatments')->assertStatus(403);

    // Shared admin routes (super_admin + admin + pakar)
    $this->actingAs($user)->get('/admin/detections')->assertStatus(200);

    // System routes - admin can access the group but user management requires super_admin
    $this->actingAs($user)->get('/admin/system/users')->assertStatus(403);
});

it('blocks regular user from all admin routes', function () {
    $user = User::factory()->create(['role' => 'user']);

    $this->actingAs($user)->get('/admin/knowledge-base/diseases')->assertStatus(403);
    $this->actingAs($user)->get('/admin/knowledge-base/symptoms')->assertStatus(403);
    $this->actingAs($user)->get('/admin/knowledge-base/treatments')->assertStatus(403);
    $this->actingAs($user)->get('/admin/detections')->assertStatus(403);
    $this->actingAs($user)->get('/admin/system/users')->assertStatus(403);
});

it('blocks unauthenticated users from admin routes', function () {
    $this->get('/admin/knowledge-base/diseases')->assertRedirect('/login');
    $this->get('/admin/system/users')->assertRedirect('/login');
});
