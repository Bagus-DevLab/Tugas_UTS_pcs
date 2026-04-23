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
