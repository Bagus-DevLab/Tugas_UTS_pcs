<?php

use App\Models\Disease;
use App\Models\User;

it('scopes detection count to current user on diseases index', function () {
    $user1 = User::factory()->create(['role' => 'user']);
    $user2 = User::factory()->create(['role' => 'user']);

    $disease = Disease::create([
        'name' => 'Blast', 'slug' => 'blast',
        'description' => 'Test', 'cause' => 'Test',
    ]);

    // User1 has 3 detections, User2 has 1
    makeDetection($user1, ['disease_id' => $disease->id, 'label' => 'Blast']);
    makeDetection($user1, ['disease_id' => $disease->id, 'label' => 'Blast']);
    makeDetection($user1, ['disease_id' => $disease->id, 'label' => 'Blast']);
    makeDetection($user2, ['disease_id' => $disease->id, 'label' => 'Blast']);

    // User1 should see count = 3
    $response = $this->actingAs($user1)->get('/diseases');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->where('diseases.0.detections_count', 3)
        );

    // User2 should see count = 1
    $response = $this->actingAs($user2)->get('/diseases');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->where('diseases.0.detections_count', 1)
        );
});

it('shows zero detection count for user with no detections', function () {
    $user = User::factory()->create(['role' => 'user']);

    Disease::create([
        'name' => 'Blast', 'slug' => 'blast',
        'description' => 'Test', 'cause' => 'Test',
    ]);

    $response = $this->actingAs($user)->get('/diseases');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->where('diseases.0.detections_count', 0)
        );
});
