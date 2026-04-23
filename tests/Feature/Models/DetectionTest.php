<?php

use App\Models\Detection;
use App\Models\Disease;
use App\Models\User;

it('can create a detection with all 9 variables', function () {
    $user = User::factory()->create();
    $disease = Disease::create([
        'name' => 'Blast', 'slug' => 'blast',
        'description' => 'Test', 'cause' => 'Test',
    ]);

    $detection = makeDetection($user, [
        'disease_id' => $disease->id,
        'method' => 'image',
        'image_path' => 'detections/test.jpg',       // VAR 1: Citra Daun
        'label' => 'Blast',                           // VAR 2: Label Penyakit
        'confidence' => 92.50,                        // VAR 3: Tingkat Akurasi
        'temperature' => 28.5,                        // VAR 4: Suhu
        'scanned_at' => now(),                        // VAR 5: Waktu Pemindaian
        'scan_duration_ms' => 1250,                   // VAR 5: Durasi
        'latitude' => -6.2088000,                     // VAR 6: Titik Koordinat
        'longitude' => 106.8456000,                   // VAR 6: Titik Koordinat
        'connection_status' => 'online',              // VAR 7: Status Koneksi
        'predictions' => ['Blast' => 92.5, 'Healthy' => 5.0],
    ]);

    expect($detection->method)->toBe('image')
        ->and($detection->image_path)->toBe('detections/test.jpg')
        ->and($detection->label)->toBe('Blast')
        ->and((float) $detection->confidence)->toBe(92.50)
        ->and((float) $detection->temperature)->toBe(28.5)
        ->and($detection->scan_duration_ms)->toBe(1250)
        ->and((float) $detection->latitude)->toBe(-6.2088000)
        ->and((float) $detection->longitude)->toBe(106.8456000)
        ->and($detection->connection_status)->toBe('online')
        ->and($detection->predictions)->toBeArray()
        ->and($detection->predictions['Blast'])->toBe(92.5);
});

it('can create an expert system detection', function () {
    $user = User::factory()->create();
    $disease = Disease::create([
        'name' => 'Blast', 'slug' => 'blast',
        'description' => 'Test', 'cause' => 'Test',
    ]);

    $detection = makeDetection($user, [
        'disease_id' => $disease->id,
        'method' => 'expert_system',
        'label' => 'Blast',
        'confidence' => 85.00,
        'selected_symptoms' => [1, 2, 3],
        'connection_status' => 'online',
    ]);

    expect($detection->method)->toBe('expert_system')
        ->and($detection->selected_symptoms)->toBeArray()
        ->and($detection->selected_symptoms)->toHaveCount(3)
        ->and($detection->image_path)->toBeNull();
});

it('belongs to a user', function () {
    $user = User::factory()->create();

    $detection = makeDetection($user, [
        'label' => 'Healthy',
        'confidence' => 95.0,
    ]);

    expect($detection->user->id)->toBe($user->id);
});

it('belongs to a disease', function () {
    $user = User::factory()->create();
    $disease = Disease::create([
        'name' => 'Blast', 'slug' => 'blast',
        'description' => 'Test', 'cause' => 'Test',
    ]);

    $detection = makeDetection($user, [
        'disease_id' => $disease->id,
        'label' => 'Blast',
    ]);

    expect($detection->disease->name)->toBe('Blast');
});

it('can have null disease (unknown)', function () {
    $user = User::factory()->create();

    $detection = makeDetection($user, [
        'label' => 'Unknown',
    ]);

    expect($detection->disease)->toBeNull();
});

it('casts predictions and selected_symptoms as arrays', function () {
    $user = User::factory()->create();

    $detection = makeDetection($user, [
        'predictions' => ['Blast' => 80, 'Healthy' => 20],
        'selected_symptoms' => [1, 5, 10],
    ]);

    $fresh = $detection->fresh();

    expect($fresh->predictions)->toBeArray()
        ->and($fresh->selected_symptoms)->toBeArray()
        ->and($fresh->predictions['Blast'])->toBe(80);
});

it('does not allow mass assignment of user_id', function () {
    $user = User::factory()->create();

    // Verify user_id is not in the fillable array
    $detection = new Detection();
    expect($detection->isFillable('user_id'))->toBeFalse();

    // Verify fill() ignores user_id
    $detection->fill(['user_id' => $user->id, 'method' => 'image']);
    expect($detection->user_id)->toBeNull()
        ->and($detection->method)->toBe('image');
});
