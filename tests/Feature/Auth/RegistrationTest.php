<?php

use App\Models\User;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

// =============================================================================
// EP: Required fields - each field missing individually
// =============================================================================

test('registration fails when required fields are missing', function (string $field) {
    $data = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ];

    unset($data[$field]);

    $response = $this->post(route('register.store'), $data);

    $response->assertSessionHasErrors([$field]);
    $this->assertGuest();
})->with([
    'name missing' => ['name'],
    'email missing' => ['email'],
    'password missing' => ['password'],
]);

// =============================================================================
// EP: email format partitions
// =============================================================================

test('registration fails with invalid email formats', function (string $email) {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => $email,
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors(['email']);
    $this->assertGuest();
})->with([
    'no @ symbol' => ['testexample.com'],
    'no domain' => ['test@'],
    'no local part' => ['@example.com'],
    'plain string' => ['not-an-email'],
    'multiple @ signs' => ['user@@example.com'],
]);

// =============================================================================
// EP: email uniqueness constraint
// =============================================================================

test('registration fails with duplicate email', function () {
    User::factory()->create(['email' => 'existing@example.com']);

    $response = $this->post(route('register.store'), [
        'name' => 'New User',
        'email' => 'existing@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors(['email']);
    $this->assertGuest();
});

// =============================================================================
// EP: password confirmation mismatch
// =============================================================================

test('registration fails when password confirmation does not match', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'different-password',
    ]);

    $response->assertSessionHasErrors(['password']);
    $this->assertGuest();
});

// =============================================================================
// BVA: name (string, max:255)
// =============================================================================

test('registration accepts name at max length boundary (255)', function () {
    $response = $this->post(route('register.store'), [
        'name' => str_repeat('a', 255),
        'email' => 'maxname@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionDoesntHaveErrors(['name']);
});

test('registration fails with name exceeding max length (256)', function () {
    $response = $this->post(route('register.store'), [
        'name' => str_repeat('a', 256),
        'email' => 'toolong@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors(['name']);
    $this->assertGuest();
});

// =============================================================================
// BVA: email (string, max:255)
// =============================================================================

test('registration accepts email at max length boundary (255)', function () {
    // Build a valid email that is exactly 255 chars
    $localPart = str_repeat('a', 243); // 243 + @ + example.com (11) = 255
    $email = $localPart . '@example.com';

    $response = $this->post(route('register.store'), [
        'name' => 'Test',
        'email' => $email,
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionDoesntHaveErrors(['email']);
});

test('registration fails with email exceeding max length (256)', function () {
    $localPart = str_repeat('a', 244); // 244 + @ + example.com (11) = 256
    $email = $localPart . '@example.com';

    $response = $this->post(route('register.store'), [
        'name' => 'Test',
        'email' => $email,
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors(['email']);
    $this->assertGuest();
});

// =============================================================================
// EP: new user gets default role 'user'
// =============================================================================

test('newly registered user has default role user', function () {
    $this->post(route('register.store'), [
        'name' => 'New User',
        'email' => 'newuser@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $user = User::where('email', 'newuser@example.com')->first();
    expect($user->role)->toBe('user');
});
