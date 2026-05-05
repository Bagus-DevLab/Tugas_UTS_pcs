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

// =============================================================================
// EP: role field (enum: super_admin, admin, pakar, user)
// =============================================================================

it('accepts all valid role values on user update', function (string $role) {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);
    $user = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($superAdmin)->put("/admin/system/users/{$user->id}", [
        'name' => $user->name,
        'email' => $user->email,
        'role' => $role,
    ]);

    $response->assertSessionDoesntHaveErrors(['role']);
    expect($user->fresh()->role)->toBe($role);
})->with([
    'super_admin' => ['super_admin'],
    'admin' => ['admin'],
    'pakar' => ['pakar'],
    'user' => ['user'],
]);

it('rejects invalid role values on user update', function (string $role) {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);
    $user = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($superAdmin)->put("/admin/system/users/{$user->id}", [
        'name' => $user->name,
        'email' => $user->email,
        'role' => $role,
    ]);

    $response->assertSessionHasErrors(['role']);
})->with([
    'moderator (invalid)' => ['moderator'],
    'editor (invalid)' => ['editor'],
    'empty string' => [''],
    'uppercase ADMIN' => ['ADMIN'],
    'numeric string' => ['123'],
]);

// =============================================================================
// BVA: name (string, max:255)
// =============================================================================

it('accepts user name at max length boundary (255)', function () {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);
    $user = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($superAdmin)->put("/admin/system/users/{$user->id}", [
        'name' => str_repeat('a', 255),
        'email' => $user->email,
        'role' => 'user',
    ]);

    $response->assertSessionDoesntHaveErrors(['name']);
});

it('rejects user name exceeding max length (256)', function () {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);
    $user = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($superAdmin)->put("/admin/system/users/{$user->id}", [
        'name' => str_repeat('a', 256),
        'email' => $user->email,
        'role' => 'user',
    ]);

    $response->assertSessionHasErrors(['name']);
});

// =============================================================================
// EP: email uniqueness on update
// =============================================================================

it('rejects duplicate email on user update', function () {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);
    $existingUser = User::factory()->create(['email' => 'taken@example.com']);
    $user = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($superAdmin)->put("/admin/system/users/{$user->id}", [
        'name' => $user->name,
        'email' => 'taken@example.com',
        'role' => 'user',
    ]);

    $response->assertSessionHasErrors(['email']);
});

it('allows same email on update for same user', function () {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);
    $user = User::factory()->create(['role' => 'user', 'email' => 'myemail@example.com']);

    $response = $this->actingAs($superAdmin)->put("/admin/system/users/{$user->id}", [
        'name' => $user->name,
        'email' => 'myemail@example.com',
        'role' => 'admin',
    ]);

    $response->assertSessionDoesntHaveErrors(['email']);
});

// =============================================================================
// EP: access control - only super_admin can manage users
// =============================================================================

it('non-super_admin roles cannot access user management', function (string $role) {
    $actor = User::factory()->create(['role' => $role]);

    $this->actingAs($actor)->get('/admin/system/users')->assertStatus(403);
})->with([
    'admin' => ['admin'],
    'pakar' => ['pakar'],
    'user' => ['user'],
]);
