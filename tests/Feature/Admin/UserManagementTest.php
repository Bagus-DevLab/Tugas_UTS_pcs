<?php

use App\Models\User;

it('super admin can view user list', function () {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);
    User::factory()->create(['role' => 'admin']);
    User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($superAdmin)->get('/admin/system/users');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('admin/users/index')
            ->has('users.data', 3)
        );
});

it('super admin can edit user role', function () {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);
    $user = User::factory()->create(['role' => 'user', 'name' => 'Test User']);

    $response = $this->actingAs($superAdmin)->put("/admin/system/users/{$user->id}", [
        'name' => $user->name,
        'email' => $user->email,
        'role' => 'admin',
    ]);

    $response->assertRedirect('/admin/system/users');
    expect($user->fresh()->role)->toBe('admin');
});

it('super admin cannot change own role', function () {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);

    $response = $this->actingAs($superAdmin)->put("/admin/system/users/{$superAdmin->id}", [
        'name' => $superAdmin->name,
        'email' => $superAdmin->email,
        'role' => 'user',
    ]);

    $response->assertRedirect();
    expect($superAdmin->fresh()->role)->toBe('super_admin');
});

it('super admin cannot delete self', function () {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);

    $response = $this->actingAs($superAdmin)->delete("/admin/system/users/{$superAdmin->id}");

    $response->assertRedirect();
    expect(User::find($superAdmin->id))->not->toBeNull();
});

it('super admin can delete regular user', function () {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);
    $user = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($superAdmin)->delete("/admin/system/users/{$user->id}");

    $response->assertRedirect('/admin/system/users');
    expect(User::find($user->id))->toBeNull();
});

it('super admin cannot delete another super admin', function () {
    $superAdmin1 = User::factory()->create(['role' => 'super_admin']);
    $superAdmin2 = User::factory()->create(['role' => 'super_admin']);

    $response = $this->actingAs($superAdmin1)->delete("/admin/system/users/{$superAdmin2->id}");

    $response->assertRedirect();
    expect(User::find($superAdmin2->id))->not->toBeNull();
});

it('validates role must be valid', function () {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);
    $user = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($superAdmin)->put("/admin/system/users/{$user->id}", [
        'name' => $user->name,
        'email' => $user->email,
        'role' => 'invalid_role',
    ]);

    $response->assertSessionHasErrors(['role']);
});
