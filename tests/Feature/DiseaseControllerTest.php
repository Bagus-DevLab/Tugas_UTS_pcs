<?php

use App\Models\Disease;
use App\Models\Symptom;
use App\Models\Treatment;
use App\Models\User;

it('shows diseases index page', function () {
    $user = User::factory()->create();

    Disease::create([
        'name' => 'Blast', 'slug' => 'blast',
        'description' => 'Test', 'cause' => 'Test',
    ]);

    $response = $this->actingAs($user)->get('/diseases');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('diseases/index')
            ->has('diseases', 1)
        );
});

it('shows disease detail page', function () {
    $user = User::factory()->create();

    $disease = Disease::create([
        'name' => 'Blast', 'slug' => 'blast',
        'latin_name' => 'Pyricularia oryzae',
        'description' => 'Penyakit blast', 'cause' => 'Jamur',
    ]);

    $symptom = Symptom::create(['code' => 'G01', 'name' => 'Bercak belah ketupat']);
    $disease->symptoms()->attach($symptom->id, ['weight' => 0.95]);

    Treatment::create([
        'disease_id' => $disease->id,
        'type' => 'chemical',
        'description' => 'Fungisida',
        'dosage' => '0.6',
        'dosage_unit' => 'gram/L',
        'priority' => 1,
    ]);

    $response = $this->actingAs($user)->get('/diseases/blast');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('diseases/show')
            ->has('disease')
            ->where('disease.name', 'Blast')
            ->has('disease.symptoms', 1)
            ->has('disease.treatments', 1)
        );
});

it('returns 404 for non-existent disease', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/diseases/non-existent');

    $response->assertStatus(404);
});

it('allows public access to diseases list', function () {
    $response = $this->get('/diseases');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('diseases/index')
        ->has('diseases')
        ->has('meta')
        ->where('isAuthenticated', false)
    );
});

it('shows detection count for authenticated users', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/diseases');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('diseases/index')
        ->where('isAuthenticated', true)
    );
});
