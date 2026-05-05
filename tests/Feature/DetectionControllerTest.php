<?php

use App\Models\Detection;
use App\Models\Disease;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

// =============================================================================
// Functional Tests (existing)
// =============================================================================

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

it('shows detection history page', function () {
    $user = User::factory()->create();

    makeDetection($user, [
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

    makeDetection($user, ['method' => 'image', 'label' => 'Blast']);
    makeDetection($user, ['method' => 'expert_system', 'label' => 'Tungro']);

    $response = $this->actingAs($user)->get('/detection/history?method=image');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->has('detections.data', 1)
            ->where('detections.data.0.method', 'image')
        );
});

it('shows detection detail page', function () {
    $user = User::factory()->create();

    $detection = makeDetection($user, [
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

    $detection = makeDetection($user1, [
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

// =============================================================================
// Equivalence Partitioning: method field (enum: image, expert_system)
// =============================================================================

it('accepts valid method values', function (string $method) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => $method,
        'label' => 'Test',
        'confidence' => 50,
    ]);

    $response->assertSessionDoesntHaveErrors(['method']);
})->with([
    'image' => ['image'],
    'expert_system' => ['expert_system'],
]);

it('rejects invalid method values', function (mixed $method) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => $method,
    ]);

    $response->assertSessionHasErrors(['method']);
})->with([
    'random string' => ['manual'],
    'empty string' => [''],
    'numeric' => [123],
    'null (required)' => [null],
    'partial match' => ['images'],
    'uppercase' => ['IMAGE'],
]);

// =============================================================================
// Equivalence Partitioning: connection_status (enum: online, offline)
// =============================================================================

it('accepts valid connection_status values', function (string $status) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'connection_status' => $status,
    ]);

    $response->assertSessionDoesntHaveErrors(['connection_status']);
})->with([
    'online' => ['online'],
    'offline' => ['offline'],
]);

it('rejects invalid connection_status values', function (string $status) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'connection_status' => $status,
    ]);

    $response->assertSessionHasErrors(['connection_status']);
})->with([
    'connecting' => ['connecting'],
    'idle' => ['idle'],
    'uppercase' => ['ONLINE'],
]);

// =============================================================================
// BVA: confidence (numeric, min:0, max:100)
// =============================================================================

it('accepts confidence at valid boundaries', function (float|int $value) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'confidence' => $value,
    ]);

    $response->assertSessionDoesntHaveErrors(['confidence']);
})->with([
    'at minimum (0)' => [0],
    'just above minimum (0.01)' => [0.01],
    'nominal (50)' => [50],
    'just below maximum (99.99)' => [99.99],
    'at maximum (100)' => [100],
]);

it('rejects confidence at invalid boundaries', function (float|int $value) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'confidence' => $value,
    ]);

    $response->assertSessionHasErrors(['confidence']);
})->with([
    'below minimum (-0.01)' => [-0.01],
    'negative (-1)' => [-1],
    'above maximum (100.01)' => [100.01],
    'far above maximum (150)' => [150],
]);

// =============================================================================
// BVA: temperature (numeric, min:-50, max:60)
// =============================================================================

it('accepts temperature at valid boundaries', function (float|int $value) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'temperature' => $value,
    ]);

    $response->assertSessionDoesntHaveErrors(['temperature']);
})->with([
    'at minimum (-50)' => [-50],
    'just above minimum (-49.9)' => [-49.9],
    'nominal (25)' => [25],
    'just below maximum (59.9)' => [59.9],
    'at maximum (60)' => [60],
    'zero boundary (0)' => [0],
]);

it('rejects temperature at invalid boundaries', function (float|int $value) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'temperature' => $value,
    ]);

    $response->assertSessionHasErrors(['temperature']);
})->with([
    'below minimum (-50.1)' => [-50.1],
    'far below minimum (-100)' => [-100],
    'above maximum (60.1)' => [60.1],
    'far above maximum (100)' => [100],
]);

// =============================================================================
// BVA: latitude (numeric, min:-90, max:90)
// =============================================================================

it('accepts latitude at valid boundaries', function (float|int $value) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'latitude' => $value,
    ]);

    $response->assertSessionDoesntHaveErrors(['latitude']);
})->with([
    'at minimum (-90)' => [-90],
    'just above minimum (-89.9999)' => [-89.9999],
    'equator (0)' => [0],
    'just below maximum (89.9999)' => [89.9999],
    'at maximum (90)' => [90],
]);

it('rejects latitude at invalid boundaries', function (float|int $value) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'latitude' => $value,
    ]);

    $response->assertSessionHasErrors(['latitude']);
})->with([
    'below minimum (-90.0001)' => [-90.0001],
    'far below minimum (-91)' => [-91],
    'above maximum (90.0001)' => [90.0001],
    'far above maximum (91)' => [91],
]);

// =============================================================================
// BVA: longitude (numeric, min:-180, max:180)
// =============================================================================

it('accepts longitude at valid boundaries', function (float|int $value) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'longitude' => $value,
    ]);

    $response->assertSessionDoesntHaveErrors(['longitude']);
})->with([
    'at minimum (-180)' => [-180],
    'just above minimum (-179.9999)' => [-179.9999],
    'prime meridian (0)' => [0],
    'just below maximum (179.9999)' => [179.9999],
    'at maximum (180)' => [180],
]);

it('rejects longitude at invalid boundaries', function (float|int $value) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'longitude' => $value,
    ]);

    $response->assertSessionHasErrors(['longitude']);
})->with([
    'below minimum (-180.0001)' => [-180.0001],
    'far below minimum (-181)' => [-181],
    'above maximum (180.0001)' => [180.0001],
    'far above maximum (181)' => [181],
]);

// =============================================================================
// BVA: scan_duration_ms (integer, min:0)
// =============================================================================

it('accepts scan_duration_ms at valid boundaries', function (int $value) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'scan_duration_ms' => $value,
    ]);

    $response->assertSessionDoesntHaveErrors(['scan_duration_ms']);
})->with([
    'at minimum (0)' => [0],
    'just above minimum (1)' => [1],
    'nominal (1500)' => [1500],
    'large value (60000)' => [60000],
]);

it('rejects scan_duration_ms at invalid boundaries', function (int $value) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'scan_duration_ms' => $value,
    ]);

    $response->assertSessionHasErrors(['scan_duration_ms']);
})->with([
    'below minimum (-1)' => [-1],
    'far below minimum (-100)' => [-100],
]);

// =============================================================================
// BVA: label (string, max:255)
// =============================================================================

it('accepts label at valid string length boundaries', function (string $value) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'label' => $value,
    ]);

    $response->assertSessionDoesntHaveErrors(['label']);
})->with([
    'single char' => ['A'],
    'at max (255 chars)' => [str_repeat('a', 255)],
    'just below max (254 chars)' => [str_repeat('a', 254)],
    'multibyte at max (255 bytes)' => [str_repeat('x', 252) . 'abc'], // 255 ASCII chars
]);

it('rejects label exceeding max length', function (string $value) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'label' => $value,
    ]);

    $response->assertSessionHasErrors(['label']);
})->with([
    'above max (256 chars)' => [str_repeat('a', 256)],
    'far above max (500 chars)' => [str_repeat('a', 500)],
]);

// =============================================================================
// BVA: notes (string, max:1000)
// =============================================================================

it('accepts notes at valid string length boundaries', function (string $value) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'notes' => $value,
    ]);

    $response->assertSessionDoesntHaveErrors(['notes']);
})->with([
    'single char' => ['A'],
    'at max (1000 chars)' => [str_repeat('n', 1000)],
    'just below max (999 chars)' => [str_repeat('n', 999)],
]);

it('rejects notes exceeding max length', function (string $value) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'notes' => $value,
    ]);

    $response->assertSessionHasErrors(['notes']);
})->with([
    'above max (1001 chars)' => [str_repeat('n', 1001)],
    'far above max (2000 chars)' => [str_repeat('n', 2000)],
]);

// =============================================================================
// EP: image upload (mimes: jpeg,png,jpg,webp; max: 10240KB)
// =============================================================================

it('accepts valid image file types', function (string $filename, string $mime) {
    Storage::fake('public');
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'image' => UploadedFile::fake()->create($filename, 100, $mime),
    ]);

    $response->assertSessionDoesntHaveErrors(['image']);
})->with([
    'jpeg' => ['photo.jpeg', 'image/jpeg'],
    'jpg' => ['photo.jpg', 'image/jpeg'],
    'png' => ['photo.png', 'image/png'],
    'webp' => ['photo.webp', 'image/webp'],
]);

it('rejects invalid image file types', function (string $filename, string $mime) {
    Storage::fake('public');
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'image' => UploadedFile::fake()->create($filename, 100, $mime),
    ]);

    $response->assertSessionHasErrors(['image']);
})->with([
    'gif' => ['photo.gif', 'image/gif'],
    'pdf' => ['document.pdf', 'application/pdf'],
    'svg' => ['icon.svg', 'image/svg+xml'],
    'bmp' => ['photo.bmp', 'image/bmp'],
]);

it('rejects image exceeding max file size (10240KB)', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'image' => UploadedFile::fake()->create('large.jpg', 10241, 'image/jpeg'),
    ]);

    $response->assertSessionHasErrors(['image']);
});

it('accepts image at max file size boundary (10240KB)', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'image' => UploadedFile::fake()->create('max.jpg', 10240, 'image/jpeg'),
    ]);

    $response->assertSessionDoesntHaveErrors(['image']);
});

// =============================================================================
// EP: nullable fields accept null gracefully
// =============================================================================

it('accepts null for all nullable numeric fields', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'confidence' => null,
        'temperature' => null,
        'latitude' => null,
        'longitude' => null,
        'scan_duration_ms' => null,
        'notes' => null,
        'label' => null,
    ]);

    $response->assertSessionDoesntHaveErrors([
        'confidence', 'temperature', 'latitude', 'longitude',
        'scan_duration_ms', 'notes', 'label',
    ]);
});

// =============================================================================
// EP: non-numeric type rejection for numeric fields
// =============================================================================

it('rejects non-numeric values for numeric fields', function (string $field) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        $field => 'not-a-number',
    ]);

    $response->assertSessionHasErrors([$field]);
})->with([
    'confidence' => ['confidence'],
    'temperature' => ['temperature'],
    'latitude' => ['latitude'],
    'longitude' => ['longitude'],
    'scan_duration_ms' => ['scan_duration_ms'],
]);
