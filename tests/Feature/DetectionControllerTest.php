<?php

use App\Models\Detection;
use App\Models\Disease;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('shows detection index page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/detection');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('detection/index')
            ->has('diseases')
        );
});

it('can store a detection result without image', function () {
    $user = User::factory()->create();
    $disease = Disease::create([
        'name' => 'Blast', 'slug' => 'blast',
        'description' => 'Test', 'cause' => 'Test',
    ]);

    $response = $this->actingAs($user)->post('/detection', [
        'disease_id' => $disease->id,
        'method' => 'image',
        'label' => 'Blast',
        'confidence' => 92.5,
        'temperature' => 28.5,
        'scanned_at' => now()->toISOString(),
        'scan_duration_ms' => 1250,
        'latitude' => -6.2088,
        'longitude' => 106.8456,
        'connection_status' => 'online',
        'predictions' => json_encode(['Blast' => 92.5, 'Healthy' => 5.0]),
    ]);

    $response->assertRedirect();

    $detection = Detection::first();
    expect($detection)->not->toBeNull()
        ->and($detection->user_id)->toBe($user->id)
        ->and($detection->label)->toBe('Blast')
        ->and((float) $detection->confidence)->toBe(92.50)
        ->and($detection->method)->toBe('image')
        ->and($detection->scan_duration_ms)->toBe(1250)
        ->and($detection->connection_status)->toBe('online');
});

it('can store a detection result with image upload', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'image' => UploadedFile::fake()->create('leaf.jpg', 100, 'image/jpeg'),
        'method' => 'image',
        'label' => 'Blast',
        'confidence' => 90.0,
    ]);

    $response->assertRedirect();

    $detection = Detection::first();
    expect($detection->image_path)->not->toBeNull();
    Storage::disk('public')->assertExists($detection->image_path);
});

it('validates required fields on store', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', []);

    $response->assertSessionHasErrors(['method']);
});

it('validates method must be image or expert_system', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'invalid',
    ]);

    $response->assertSessionHasErrors(['method']);
});

it('validates confidence range', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'confidence' => 150,
    ]);

    $response->assertSessionHasErrors(['confidence']);
});

it('shows detection history page', function () {
    $user = User::factory()->create();

    Detection::create([
        'user_id' => $user->id,
        'method' => 'image',
        'label' => 'Blast',
        'confidence' => 92.5,
    ]);

    $response = $this->actingAs($user)->get('/detection/history');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('detection/history')
            ->has('detections.data', 1)
        );
});

it('filters history by method', function () {
    $user = User::factory()->create();

    Detection::create(['user_id' => $user->id, 'method' => 'image', 'label' => 'Blast']);
    Detection::create(['user_id' => $user->id, 'method' => 'expert_system', 'label' => 'Tungro']);

    $response = $this->actingAs($user)->get('/detection/history?method=image');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->has('detections.data', 1)
            ->where('detections.data.0.method', 'image')
        );
});

it('shows detection detail page', function () {
    $user = User::factory()->create();

    $detection = Detection::create([
        'user_id' => $user->id,
        'method' => 'image',
        'label' => 'Blast',
        'confidence' => 92.5,
    ]);

    $response = $this->actingAs($user)->get("/detection/{$detection->id}");

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('detection/show')
            ->has('detection')
            ->where('detection.id', $detection->id)
        );
});

it('prevents viewing other users detections', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $detection = Detection::create([
        'user_id' => $user1->id,
        'method' => 'image',
        'label' => 'Blast',
    ]);

    $response = $this->actingAs($user2)->get("/detection/{$detection->id}");

    $response->assertStatus(403);
});

it('requires authentication for all detection routes', function () {
    $this->get('/detection')->assertRedirect('/login');
    $this->post('/detection')->assertRedirect('/login');
    $this->get('/detection/history')->assertRedirect('/login');
});
