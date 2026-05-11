<?php

use App\Models\User;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh())->not->toBeNull();
});

// =============================================================================
// BVA: name (string, max:255)
// =============================================================================

test('profile update accepts name at max length boundary (255)', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patch(route('profile.update'), [
        'name' => str_repeat('a', 255),
        'email' => $user->email,
    ]);

    $response->assertSessionDoesntHaveErrors(['name']);
});

test('profile update rejects name exceeding max length (256)', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patch(route('profile.update'), [
        'name' => str_repeat('a', 256),
        'email' => $user->email,
    ]);

    $response->assertSessionHasErrors(['name']);
});

// =============================================================================
// BVA: email (string, max:255)
// =============================================================================

test('profile update accepts email at max length boundary (255)', function () {
    $user = User::factory()->create();
    $localPart = str_repeat('a', 243); // 243 + @example.com (12) = 255
    $email = $localPart.'@example.com';

    $response = $this->actingAs($user)->patch(route('profile.update'), [
        'name' => $user->name,
        'email' => $email,
    ]);

    $response->assertSessionDoesntHaveErrors(['email']);
});

test('profile update rejects email exceeding max length (256)', function () {
    $user = User::factory()->create();
    $localPart = str_repeat('a', 244); // 244 + @example.com (12) = 256
    $email = $localPart.'@example.com';

    $response = $this->actingAs($user)->patch(route('profile.update'), [
        'name' => $user->name,
        'email' => $email,
    ]);

    $response->assertSessionHasErrors(['email']);
});

// =============================================================================
// EP: email format validation
// =============================================================================

test('profile update rejects invalid email formats', function (string $email) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patch(route('profile.update'), [
        'name' => $user->name,
        'email' => $email,
    ]);

    $response->assertSessionHasErrors(['email']);
})->with([
    'no @ symbol' => ['invalidemail.com'],
    'no domain' => ['user@'],
    'no local part' => ['@domain.com'],
    'plain string' => ['not-an-email'],
]);

// =============================================================================
// EP: email uniqueness on profile update
// =============================================================================

test('profile update rejects email already taken by another user', function () {
    $user = User::factory()->create();
    User::factory()->create(['email' => 'taken@example.com']);

    $response = $this->actingAs($user)->patch(route('profile.update'), [
        'name' => $user->name,
        'email' => 'taken@example.com',
    ]);

    $response->assertSessionHasErrors(['email']);
});

// =============================================================================
// EP: required fields
// =============================================================================

test('profile update validates required fields', function (string $field) {
    $user = User::factory()->create();

    $data = ['name' => 'Updated', 'email' => 'new@example.com'];
    $data[$field] = '';

    $response = $this->actingAs($user)->patch(route('profile.update'), $data);

    $response->assertSessionHasErrors([$field]);
})->with([
    'name required' => ['name'],
    'email required' => ['email'],
]);
