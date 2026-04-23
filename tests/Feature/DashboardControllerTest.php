<?php

use App\Models\Disease;
use App\Models\User;

it('shows dashboard with stats', function () {
    $user = User::factory()->create();

    $disease = Disease::create([
        'name' => 'Blast', 'slug' => 'blast',
        'description' => 'Test', 'cause' => 'Test',
    ]);

    makeDetection($user, [
        'disease_id' => $disease->id,
        'label' => 'Blast',
        'confidence' => 92.5,
    ]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('stats')
            ->where('stats.totalDetections', 1)
            ->has('diseaseDistribution')
            ->has('recentDetections')
        );
});

it('shows empty dashboard for new user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('stats.totalDetections', 0)
            ->where('stats.detectionsThisMonth', 0)
            ->where('stats.averageConfidence', 0)
            ->where('stats.mostDetectedDisease', '-')
        );
});

it('only shows current user detections', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    makeDetection($user1, ['label' => 'Blast', 'confidence' => 90]);
    makeDetection($user1, ['label' => 'Blast', 'confidence' => 85]);
    makeDetection($user2, ['label' => 'Tungro', 'confidence' => 80]);

    $response = $this->actingAs($user1)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->where('stats.totalDetections', 2)
    );
});

it('requires authentication', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});
