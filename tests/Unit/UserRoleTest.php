<?php

use App\Models\User;

it('has correct role constants', function () {
    expect(User::ROLE_SUPER_ADMIN)->toBe('super_admin')
        ->and(User::ROLE_ADMIN)->toBe('admin')
        ->and(User::ROLE_PAKAR)->toBe('pakar')
        ->and(User::ROLE_USER)->toBe('user')
        ->and(User::ROLES)->toBe(['super_admin', 'admin', 'pakar', 'user']);
});

it('isSuperAdmin returns true only for super_admin', function () {
    $superAdmin = new User;
    $superAdmin->role = 'super_admin';
    $admin = new User;
    $admin->role = 'admin';
    $user = new User;
    $user->role = 'user';

    expect($superAdmin->isSuperAdmin())->toBeTrue()
        ->and($admin->isSuperAdmin())->toBeFalse()
        ->and($user->isSuperAdmin())->toBeFalse();
});

it('isAdmin returns true only for admin', function () {
    $superAdmin = new User;
    $superAdmin->role = 'super_admin';
    $admin = new User;
    $admin->role = 'admin';
    $user = new User;
    $user->role = 'user';

    expect($superAdmin->isAdmin())->toBeFalse()
        ->and($admin->isAdmin())->toBeTrue()
        ->and($user->isAdmin())->toBeFalse();
});

it('isUser returns true only for user', function () {
    $superAdmin = new User;
    $superAdmin->role = 'super_admin';
    $admin = new User;
    $admin->role = 'admin';
    $user = new User;
    $user->role = 'user';

    expect($superAdmin->isUser())->toBeFalse()
        ->and($admin->isUser())->toBeFalse()
        ->and($user->isUser())->toBeTrue();
});

it('isAtLeastAdmin returns true for admin and super_admin', function () {
    $superAdmin = new User;
    $superAdmin->role = 'super_admin';
    $admin = new User;
    $admin->role = 'admin';
    $user = new User;
    $user->role = 'user';

    expect($superAdmin->isAtLeastAdmin())->toBeTrue()
        ->and($admin->isAtLeastAdmin())->toBeTrue()
        ->and($user->isAtLeastAdmin())->toBeFalse();
});

it('defaults to user role', function () {
    $user = new User;

    // Without explicit role, isUser should handle null gracefully
    expect($user->isSuperAdmin())->toBeFalse()
        ->and($user->isAdmin())->toBeFalse()
        ->and($user->isAtLeastAdmin())->toBeFalse();
});
