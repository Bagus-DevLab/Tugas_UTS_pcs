<?php

use App\Models\User;
use Illuminate\Support\Facades\Http;

it('returns weather data when API key is configured', function () {
    $user = User::factory()->create();

    config(['services.openweathermap.key' => 'test-api-key']);

    Http::fake([
        'api.openweathermap.org/*' => Http::response([
            'main' => ['temp' => 28.5, 'humidity' => 75],
            'weather' => [['description' => 'scattered clouds']],
        ], 200),
    ]);

    $response = $this->actingAs($user)->getJson('/api/weather?lat=-6.2088&lon=106.8456');

    $response->assertStatus(200)
        ->assertJson([
            'temperature' => 28.5,
            'description' => 'scattered clouds',
            'humidity' => 75,
        ]);
});

it('returns 503 when API key is not configured', function () {
    $user = User::factory()->create();

    config(['services.openweathermap.key' => null]);

    $response = $this->actingAs($user)->getJson('/api/weather?lat=-6.2088&lon=106.8456');

    $response->assertStatus(503)
        ->assertJson(['error' => 'OpenWeatherMap API key tidak dikonfigurasi.']);
});

it('validates latitude and longitude are required', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/weather');

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['lat', 'lon']);
});

it('validates latitude range', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/weather?lat=100&lon=0');

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['lat']);
});

it('validates longitude range', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/weather?lat=0&lon=200');

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['lon']);
});

it('returns 502 when external API fails', function () {
    $user = User::factory()->create();

    config(['services.openweathermap.key' => 'test-api-key']);

    Http::fake([
        'api.openweathermap.org/*' => Http::response(['message' => 'Unauthorized'], 401),
    ]);

    $response = $this->actingAs($user)->getJson('/api/weather?lat=-6.2088&lon=106.8456');

    $response->assertStatus(502);
});

it('requires authentication', function () {
    $response = $this->getJson('/api/weather?lat=-6.2088&lon=106.8456');

    $response->assertStatus(401);
});

// =============================================================================
// BVA: lat (numeric, min:-90, max:90)
// =============================================================================

it('accepts latitude at valid boundaries', function (float|int $lat) {
    $user = User::factory()->create();
    config(['services.openweathermap.key' => 'test-key']);

    Http::fake(['api.openweathermap.org/*' => Http::response([
        'main' => ['temp' => 28, 'humidity' => 70],
        'weather' => [['description' => 'clear']],
    ], 200)]);

    $response = $this->actingAs($user)->getJson("/api/weather?lat={$lat}&lon=0");

    $response->assertStatus(200);
})->with([
    'at minimum (-90)' => [-90],
    'just above minimum (-89.99)' => [-89.99],
    'equator (0)' => [0],
    'just below maximum (89.99)' => [89.99],
    'at maximum (90)' => [90],
]);

it('rejects latitude at invalid boundaries', function (float|int $lat) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson("/api/weather?lat={$lat}&lon=0");

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['lat']);
})->with([
    'below minimum (-90.01)' => [-90.01],
    'far below minimum (-91)' => [-91],
    'above maximum (90.01)' => [90.01],
    'far above maximum (100)' => [100],
]);

// =============================================================================
// BVA: lon (numeric, min:-180, max:180)
// =============================================================================

it('accepts longitude at valid boundaries', function (float|int $lon) {
    $user = User::factory()->create();
    config(['services.openweathermap.key' => 'test-key']);

    Http::fake(['api.openweathermap.org/*' => Http::response([
        'main' => ['temp' => 28, 'humidity' => 70],
        'weather' => [['description' => 'clear']],
    ], 200)]);

    $response = $this->actingAs($user)->getJson("/api/weather?lat=0&lon={$lon}");

    $response->assertStatus(200);
})->with([
    'at minimum (-180)' => [-180],
    'just above minimum (-179.99)' => [-179.99],
    'prime meridian (0)' => [0],
    'just below maximum (179.99)' => [179.99],
    'at maximum (180)' => [180],
]);

it('rejects longitude at invalid boundaries', function (float|int $lon) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson("/api/weather?lat=0&lon={$lon}");

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['lon']);
})->with([
    'below minimum (-180.01)' => [-180.01],
    'far below minimum (-181)' => [-181],
    'above maximum (180.01)' => [180.01],
    'far above maximum (200)' => [200],
]);
