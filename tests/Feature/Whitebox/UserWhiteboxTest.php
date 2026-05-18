<?php

use App\Models\User;

/*
|--------------------------------------------------------------------------
| Whitebox Testing: Statement & Decision Testing
|--------------------------------------------------------------------------
|
| These tests are intentionally written from the implementation structure in
| User and UserManagementController. They document which statements and
| decision outcomes are exercised for coursework whitebox testing evidence.
|
*/

it('covers User role helper decision outcomes for all roles', function (
    string $role,
    bool $isSuperAdmin,
    bool $isAdmin,
    bool $isPakar,
    bool $isUser,
    bool $isAtLeastAdmin,
    bool $canManageKnowledgeBase,
    bool $canManageSystem,
    bool $canManageUsers,
) {
    $user = new User;
    $user->role = $role;

    expect($user->isSuperAdmin())->toBe($isSuperAdmin)
        ->and($user->isAdmin())->toBe($isAdmin)
        ->and($user->isPakar())->toBe($isPakar)
        ->and($user->isUser())->toBe($isUser)
        ->and($user->isAtLeastAdmin())->toBe($isAtLeastAdmin)
        ->and($user->canManageKnowledgeBase())->toBe($canManageKnowledgeBase)
        ->and($user->canManageSystem())->toBe($canManageSystem)
        ->and($user->canManageUsers())->toBe($canManageUsers);
})->with([
    'super_admin covers true branch for super-admin permissions' => [
        'super_admin', true, false, false, false, true, true, true, true,
    ],
    'admin covers true branch for admin/system permissions and false branch for user management' => [
        'admin', false, true, false, false, true, false, true, false,
    ],
    'pakar covers true branch for knowledge-base permissions and false branch for system permissions' => [
        'pakar', false, false, true, false, true, true, false, false,
    ],
    'user covers false branch for administrative permissions' => [
        'user', false, false, false, true, false, false, false, false,
    ],
]);

it('covers UserManagementController update statements for blocked self role change and successful update', function () {
    $superAdmin = User::factory()->create([
        'role' => 'super_admin',
        'name' => 'Root Admin',
        'email' => 'root@example.com',
    ]);
    $target = User::factory()->create([
        'role' => 'user',
        'name' => 'Original User',
        'email' => 'original@example.com',
    ]);

    $selfChangeResponse = $this->actingAs($superAdmin)->put("/admin/system/users/{$superAdmin->id}", [
        'name' => 'Root Admin',
        'email' => 'root@example.com',
        'role' => 'user',
    ]);

    $selfChangeResponse
        ->assertRedirect()
        ->assertSessionHas('error', 'Anda tidak dapat mengubah role Anda sendiri.');

    expect($superAdmin->fresh()->role)->toBe('super_admin');

    $successfulUpdateResponse = $this->actingAs($superAdmin)->put("/admin/system/users/{$target->id}", [
        'name' => 'Updated User',
        'email' => 'updated@example.com',
        'role' => 'admin',
    ]);

    $successfulUpdateResponse
        ->assertRedirect(route('admin.system.users.index', absolute: false))
        ->assertSessionHas('success', 'User Updated User berhasil diperbarui.');

    $target->refresh();

    expect($target->name)->toBe('Updated User')
        ->and($target->email)->toBe('updated@example.com')
        ->and($target->role)->toBe('admin');
});

it('covers UserManagementController destroy decision branches', function (
    string $case,
    string $targetRole,
    bool $isSelf,
    bool $shouldDelete,
    ?string $expectedError,
) {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);
    $target = $isSelf
        ? $superAdmin
        : User::factory()->create(['role' => $targetRole]);

    $response = $this->actingAs($superAdmin)->delete("/admin/system/users/{$target->id}");

    $response->assertRedirect();

    if ($expectedError !== null) {
        $response->assertSessionHas('error', $expectedError);
    } else {
        $response->assertRedirect(route('admin.system.users.index', absolute: false))
            ->assertSessionHas('success', 'User berhasil dihapus.');
    }

    expect(User::find($target->id) === null)->toBe($shouldDelete, $case);
})->with([
    'D1 true: actor deletes self, first return statement is executed' => [
        'self delete is blocked',
        'super_admin',
        true,
        false,
        'Anda tidak dapat menghapus akun Anda sendiri.',
    ],
    'D1 false and D2 true: actor deletes another super_admin, second return statement is executed' => [
        'delete another super admin is blocked',
        'super_admin',
        false,
        false,
        'Tidak dapat menghapus akun Super Admin.',
    ],
    'D1 false and D2 false: actor deletes non-super_admin, delete and success return statements are executed' => [
        'delete regular user succeeds',
        'user',
        false,
        true,
        null,
    ],
]);
