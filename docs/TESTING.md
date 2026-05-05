# Dokumentasi Unit Testing - Mapan

## Ringkasan

Dokumen ini menjelaskan strategi, teknik, dan implementasi pengujian (testing) pada aplikasi **Mapan** — Sistem Pakar Deteksi Penyakit Tanaman Padi.

| Metrik | Nilai |
|--------|------:|
| **Total Test Cases** | 352 |
| **Total Assertions** | 1042 |
| **Test Files** | 30 |
| **Execution Time** | ~6 detik |
| **Pass Rate** | 100% |

---

## Framework & Konfigurasi

| Komponen | Teknologi |
|----------|-----------|
| Testing Framework | **Pest PHP** (di atas PHPUnit) |
| Laravel Version | 13.x |
| PHP Version | 8.3+ |
| Database Strategy | `RefreshDatabase` (SQLite in-memory) |
| CI/CD | GitHub Actions (PHP 8.3, 8.4, 8.5 matrix) |

### Menjalankan Test

```bash
# Jalankan semua test
composer test          # Pint lint + Pest tests
./vendor/bin/pest      # Pest saja

# Jalankan file spesifik
./vendor/bin/pest tests/Feature/DetectionControllerTest.php

# Jalankan dengan filter
./vendor/bin/pest --filter="confidence"
```

---

## Teknik Pengujian yang Diterapkan

Aplikasi ini menerapkan **5 teknik pengujian black-box** secara sistematis:

| # | Teknik | Deskripsi | Jumlah Test |
|---|--------|-----------|:-----------:|
| 1 | Functional Testing | Verifikasi fitur end-to-end | ~145 |
| 2 | Equivalence Partitioning (EP) | Partisi input valid/invalid | ~90 |
| 3 | Boundary Value Analysis (BVA) | Pengujian nilai batas | ~85 |
| 4 | Decision Table Testing | Kombinasi kondisi → aksi | ~16 |
| 5 | Sampling Testing | Sampel representatif dari input space besar | ~7 |

---

### 1. Functional Testing (Integration)

Pengujian fungsional standar yang memverifikasi bahwa fitur bekerja end-to-end: HTTP request → Controller → Database → Response.

**Contoh:**
```php
it('can store a detection result without image', function () {
    $user = User::factory()->create();
    $disease = Disease::create([...]);

    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'confidence' => 92.5,
    ]);

    $response->assertRedirect();
    expect(Detection::first()->confidence)->toBe(92.50);
});
```

---

### 2. Equivalence Partitioning (EP)

Teknik black-box testing yang membagi domain input menjadi **kelas-kelas ekuivalen** (partisi), kemudian memilih satu representatif dari setiap kelas untuk diuji.

**Prinsip:** Jika satu nilai dalam partisi lolos/gagal, maka semua nilai dalam partisi tersebut diasumsikan berperilaku sama.

**Contoh implementasi dengan Pest Dataset:**
```php
// EP: method field (enum: image, expert_system)
it('accepts valid method values', function (string $method) {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->post('/detection', [
        'method' => $method,
    ]);
    $response->assertSessionDoesntHaveErrors(['method']);
})->with([
    'image' => ['image'],               // Valid EC 1
    'expert_system' => ['expert_system'], // Valid EC 2
]);

it('rejects invalid method values', function (mixed $method) {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->post('/detection', [
        'method' => $method,
    ]);
    $response->assertSessionHasErrors(['method']);
})->with([
    'random string' => ['manual'],   // Invalid EC 1: string lain
    'empty string' => [''],          // Invalid EC 2: kosong
    'numeric' => [123],              // Invalid EC 3: tipe salah
    'null (required)' => [null],     // Invalid EC 4: null
    'partial match' => ['images'],   // Invalid EC 5: mirip tapi salah
    'uppercase' => ['IMAGE'],        // Invalid EC 6: case-sensitive
]);
```

---

### 3. Boundary Value Analysis (BVA)

Teknik black-box testing yang menguji nilai-nilai di **batas** (boundary) domain input, karena error paling sering terjadi di titik-titik batas.

**Prinsip:** Untuk domain `[min, max]`, uji: `min-1` (invalid), `min` (valid), `min+1` (valid), `nominal` (valid), `max-1` (valid), `max` (valid), `max+1` (invalid).

**Contoh implementasi:**
```php
// BVA: confidence (numeric, min:0, max:100)
it('accepts confidence at valid boundaries', function (float|int $value) {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'confidence' => $value,
    ]);
    $response->assertSessionDoesntHaveErrors(['confidence']);
})->with([
    'at minimum (0)' => [0],           // Batas bawah
    'just above minimum (0.01)' => [0.01], // Batas bawah + 1
    'nominal (50)' => [50],            // Nilai tengah
    'just below maximum (99.99)' => [99.99], // Batas atas - 1
    'at maximum (100)' => [100],       // Batas atas
]);

it('rejects confidence at invalid boundaries', function (float|int $value) {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->post('/detection', [
        'method' => 'image',
        'confidence' => $value,
    ]);
    $response->assertSessionHasErrors(['confidence']);
})->with([
    'below minimum (-0.01)' => [-0.01],  // Batas bawah - 1
    'negative (-1)' => [-1],             // Jauh di bawah
    'above maximum (100.01)' => [100.01], // Batas atas + 1
    'far above maximum (150)' => [150],  // Jauh di atas
]);
```

---

### 4. Decision Table Testing

Teknik black-box testing yang memodelkan **kombinasi kondisi** (conditions) dan **aksi** (actions) yang dihasilkan dalam bentuk tabel keputusan. Setiap baris (rule) merepresentasikan satu kombinasi unik.

**Prinsip:** Identifikasi semua kondisi yang mempengaruhi output, lalu buat matriks semua kombinasi yang mungkin.

**Contoh implementasi — User Deletion Logic:**

```
| Rule | C1: Is Self? | C2: Target is SuperAdmin? | Action                           |
|------|:------------:|:-------------------------:|----------------------------------|
| R1   | Yes          | — (irrelevant)            | Redirect + user NOT deleted      |
| R2   | No           | Yes                       | Redirect + user NOT deleted      |
| R3   | No           | No                        | Redirect to index + user DELETED |
```

```php
it('applies decision table rules for user deletion', function (
    string $rule, string $targetRole, bool $isSelf, bool $shouldBeDeleted
) {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);

    if ($isSelf) {
        $target = $superAdmin;
    } else {
        $target = User::factory()->create(['role' => $targetRole]);
    }

    $response = $this->actingAs($superAdmin)
        ->delete("/admin/system/users/{$target->id}");

    $response->assertRedirect();

    if ($shouldBeDeleted) {
        expect(User::find($target->id))->toBeNull();
    } else {
        expect(User::find($target->id))->not->toBeNull();
    }
})->with([
    'R1: self-delete → blocked' => ['R1', 'super_admin', true, false],
    'R2: target is super_admin → blocked' => ['R2', 'super_admin', false, false],
    'R3: target is admin → deleted' => ['R3', 'admin', false, true],
    'R3: target is pakar → deleted' => ['R3', 'pakar', false, true],
    'R3: target is user → deleted' => ['R3', 'user', false, true],
]);
```

**Contoh implementasi — Treatment Dosage Conditional Validation:**

```
| Rule | C1: dosage present? | C2: dosage_unit present? | Action                         |
|------|:-------------------:|:------------------------:|--------------------------------|
| R1   | No (null)           | No (null)                | Valid (both absent)            |
| R2   | No (null)           | Yes                      | Valid (unit alone is OK)       |
| R3   | Yes                 | No (null)                | INVALID (dosage_unit required) |
| R4   | Yes                 | Yes                      | Valid (both present)           |
```

```php
it('applies decision table rules for dosage/dosage_unit', function (
    string $rule, ?string $dosage, ?string $dosageUnit,
    bool $isValid, ?string $errorField,
) {
    $pakar = User::factory()->create(['role' => 'pakar']);
    $disease = Disease::where('slug', 'blast')->first();

    $payload = [
        'disease_id' => $disease->id,
        'type' => 'chemical',
        'description' => 'Test',
        'priority' => 1,
    ];
    if ($dosage !== null) $payload['dosage'] = $dosage;
    if ($dosageUnit !== null) $payload['dosage_unit'] = $dosageUnit;

    $response = $this->actingAs($pakar)
        ->post('/admin/knowledge-base/treatments', $payload);

    if ($isValid) {
        $response->assertSessionDoesntHaveErrors(['dosage', 'dosage_unit']);
    } else {
        $response->assertSessionHasErrors([$errorField]);
    }
})->with([
    'R1: both null → valid' => ['R1', null, null, true, null],
    'R2: unit only → valid' => ['R2', null, 'ml/L', true, null],
    'R3: dosage without unit → INVALID' => ['R3', '2.5', null, false, 'dosage_unit'],
    'R4: both present → valid' => ['R4', '2.5', 'ml/L', true, null],
]);
```

---

### 5. Sampling Testing

Teknik testing yang digunakan ketika **input space terlalu besar** untuk exhaustive testing. Dipilih sampel representatif berdasarkan strategi tertentu.

**Konteks di Mapan:** Sistem Pakar memiliki 47 gejala. Total kemungkinan kombinasi = 2^47 - 1 = **~140 triliun**. Exhaustive testing mustahil.

**Strategi Sampling yang Diterapkan:**

```
Input Space: 2^47 - 1 ≈ 140,737,488,355,327 kombinasi
Sampel yang diuji: 7 test cases (representatif)

Strategi:
├── Boundary Sampling
│   ├── Minimum: 1 gejala (lower bound)
│   └── Maximum: semua gejala (upper bound, stress test)
├── Disease-Aligned Sampling
│   ├── Blast: exact match → verify top ranking & CF calculation
│   └── Brown Spot: exact match → verify top ranking
└── Cross-Disease Sampling
    ├── Conflict: gejala dari 2 penyakit → verify ranking by CF
    ├── Shared: 1 gejala milik 2 penyakit → verify both appear
    └── Orphan: gejala tanpa penyakit → verify empty results
```

**Contoh implementasi — Disease-Aligned Sampling:**
```php
it('[Sampling] ranks target disease first when all its symptoms are selected', function () {
    $user = User::factory()->create();

    $blastSymptomIds = Disease::where('slug', 'blast')->first()
        ->symptoms->pluck('id')->toArray();

    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', [
        'symptom_ids' => $blastSymptomIds,
    ]);

    $response->assertStatus(200);

    $results = $response->json('results');
    // Blast harus di posisi pertama (CF tertinggi)
    expect($results[0]['disease']['slug'])->toBe('blast');
    // CF_combine(0.95, 0.90) = 0.95 + 0.90*(1-0.95) = 0.995 → 99.50%
    expect($results[0]['certainty_factor'])->toBe(99.50);
});
```

**Contoh implementasi — Cross-Disease Sampling:**
```php
it('[Sampling] handles cross-disease symptom conflict without errors', function () {
    $user = User::factory()->create();

    // Mix: 1 gejala Blast (G01) + 2 gejala Tungro (G11, G12)
    $mixedSymptomIds = [$g01->id, $g11->id, $g12->id];

    $response = $this->actingAs($user)->postJson('/expert-system/diagnose', [
        'symptom_ids' => $mixedSymptomIds,
    ]);

    $response->assertStatus(200);

    $results = $response->json('results');
    $slugs = collect($results)->pluck('disease.slug')->toArray();

    // Kedua penyakit harus muncul
    expect($slugs)->toContain('blast')->and($slugs)->toContain('tungro');
    // Tungro ranked higher (2 matching symptoms > 1)
    expect($results[0]['disease']['slug'])->toBe('tungro');
});
```

---

## Struktur Direktori Test

```
tests/
├── Pest.php                          # Global config, helpers (makeDetection)
├── TestCase.php                      # Base class (skipUnlessFortifyHas)
├── Unit/
│   ├── ExampleTest.php               # Placeholder
│   └── UserRoleTest.php              # Role constants & helper methods
├── Feature/
│   ├── ExampleTest.php               # Placeholder
│   ├── DashboardTest.php             # Dashboard page rendering
│   ├── DashboardControllerTest.php   # Dashboard data & scoping
│   ├── DetectionControllerTest.php   # Detection CRUD + BVA + EP (92 tests)
│   ├── DiseaseControllerTest.php     # Public disease pages
│   ├── DiseaseControllerScopingTest.php # Disease slug scoping
│   ├── ExpertSystemControllerTest.php # Expert system + BVA + EP + Sampling (26 tests)
│   ├── RoleMiddlewareTest.php        # Role-based access control EP
│   ├── SeederTest.php                # Database seeder integrity
│   ├── WeatherControllerTest.php     # Weather API + BVA lat/lon (25 tests)
│   ├── Admin/
│   │   ├── DetectionManagementTest.php   # Admin detection management
│   │   ├── DiseaseManagementTest.php     # Disease CRUD + BVA weight + EP (19 tests)
│   │   ├── SymptomManagementTest.php     # Symptom CRUD + BVA code/name (17 tests)
│   │   ├── TreatmentManagementTest.php   # Treatment CRUD + EP type + BVA + DT (29 tests)
│   │   └── UserManagementTest.php        # User CRUD + EP role + BVA + DT (28 tests)
│   ├── Auth/
│   │   ├── AuthenticationTest.php        # Login, 2FA, rate limiting
│   │   ├── RegistrationTest.php          # Register + EP + BVA (17 tests)
│   │   ├── EmailVerificationTest.php     # Email verification flow
│   │   ├── VerificationNotificationTest.php
│   │   ├── PasswordResetTest.php         # Password reset flow
│   │   ├── PasswordConfirmationTest.php
│   │   └── TwoFactorChallengeTest.php    # 2FA challenge
│   ├── Models/
│   │   ├── DetectionTest.php             # Detection model relationships
│   │   ├── DiseaseTest.php               # Disease model relationships
│   │   ├── SymptomTest.php               # Symptom model relationships
│   │   └── TreatmentTest.php             # Treatment model relationships
│   └── Settings/
│       ├── ProfileUpdateTest.php         # Profile CRUD + EP + BVA (16 tests)
│       └── SecurityTest.php              # 2FA setup, password change
```

---

## Detail Implementasi per Domain

### Detection Controller (`DetectionControllerTest.php`) — 92 tests

File test terbesar, mencakup:

#### Functional Tests (14 tests)
- Store detection tanpa image
- Store detection dengan image upload
- Validasi required fields
- History page rendering & filtering
- Detail page & ownership protection
- Authentication requirement

#### EP Tests (30 tests)
| Domain | Valid Partitions | Invalid Partitions |
|--------|-----------------|-------------------|
| `method` | `image`, `expert_system` | `manual`, `''`, `123`, `null`, `images`, `IMAGE` |
| `connection_status` | `online`, `offline` | `connecting`, `idle`, `ONLINE` |
| Image MIME types | jpeg, jpg, png, webp | gif, pdf, svg, bmp |
| Image file size | 10240KB (at max) | 10241KB (above max) |
| Nullable fields | All null accepted | — |
| Non-numeric type | — | `'not-a-number'` for 5 fields |

#### BVA Tests (48 tests)
| Field | Rule | Valid Boundaries | Invalid Boundaries |
|-------|------|-----------------|-------------------|
| `confidence` | numeric, 0-100 | 0, 0.01, 50, 99.99, 100 | -0.01, -1, 100.01, 150 |
| `temperature` | numeric, -50 to 60 | -50, -49.9, 0, 25, 59.9, 60 | -50.1, -100, 60.1, 100 |
| `latitude` | numeric, -90 to 90 | -90, -89.9999, 0, 89.9999, 90 | -90.0001, -91, 90.0001, 91 |
| `longitude` | numeric, -180 to 180 | -180, -179.9999, 0, 179.9999, 180 | -180.0001, -181, 180.0001, 181 |
| `scan_duration_ms` | integer, min:0 | 0, 1, 1500, 60000 | -1, -100 |
| `label` | string, max:255 | 1, 254, 255 chars | 256, 500 chars |
| `notes` | string, max:1000 | 1, 999, 1000 chars | 1001, 2000 chars |

---

### Expert System (`ExpertSystemControllerTest.php`) — 26 tests

#### Functional Tests (8 tests)
- Index page rendering
- Diagnose with selected symptoms
- CF calculation verification
- Store detection result
- Authentication requirement

#### BVA Tests (5 tests)
- `symptom_ids` array min:1 (boundary)
- `confidence` on store (0, 50, 100 valid; -0.01, 100.01 invalid)

#### EP Tests (6 tests)
- `symptom_ids` type validation (string, integer, null → all invalid)
- Unmatched symptoms → empty results
- Non-existent symptom ID → 422

#### Sampling Tests (7 tests)

| Strategi | Test Case | Assertion |
|----------|-----------|-----------|
| **Boundary: Minimum** | 1 symptom (G01) | Blast ranked first, CF=95.0 |
| **Boundary: Maximum** | All 14+ symptoms | No crash, all CF 0-100 |
| **Disease-Aligned: Blast** | All Blast symptoms | Blast #1, CF=99.50 |
| **Disease-Aligned: Brown Spot** | All Brown Spot symptoms | Brown Spot #1, CF=95.0 |
| **Cross-Disease: Conflict** | Blast(1) + Tungro(2) | Both appear, Tungro ranked higher |
| **Cross-Disease: Shared** | G01 (shared Blast+BLB) | Both appear, Blast ranked higher (weight) |
| **Cross-Disease: Orphan** | Unlinked symptoms | Empty results, no error |

---

### Weather Controller (`WeatherControllerTest.php`) — 25 tests

#### BVA: Latitude (-90 to 90)
| Test Case | Value | Expected |
|-----------|-------|----------|
| At minimum | -90 | 200 OK |
| Just above min | -89.99 | 200 OK |
| Equator | 0 | 200 OK |
| Just below max | 89.99 | 200 OK |
| At maximum | 90 | 200 OK |
| Below minimum | -90.01 | 422 Error |
| Far below | -91 | 422 Error |
| Above maximum | 90.01 | 422 Error |
| Far above | 100 | 422 Error |

#### BVA: Longitude (-180 to 180)
| Test Case | Value | Expected |
|-----------|-------|----------|
| At minimum | -180 | 200 OK |
| Just above min | -179.99 | 200 OK |
| Prime meridian | 0 | 200 OK |
| Just below max | 179.99 | 200 OK |
| At maximum | 180 | 200 OK |
| Below minimum | -180.01 | 422 Error |
| Far below | -181 | 422 Error |
| Above maximum | 180.01 | 422 Error |
| Far above | 200 | 422 Error |

---

### Disease Management (`DiseaseManagementTest.php`) — 19 tests

#### BVA: `symptoms.*.weight` (numeric, 0 to 1)
| Test Case | Value | Expected |
|-----------|-------|----------|
| At minimum | 0.0 | Valid |
| Just above min | 0.01 | Valid |
| Nominal | 0.5 | Valid |
| Just below max | 0.99 | Valid |
| At maximum | 1.0 | Valid |
| Below minimum | -0.01 | Error |
| Negative | -1.0 | Error |
| Above maximum | 1.01 | Error |
| Far above | 2.0 | Error |

#### EP: Role-based Access
| Role | Expected |
|------|----------|
| `pakar` | 200 (allowed) |
| `super_admin` | 200 (allowed) |
| `admin` | 403 (forbidden) |
| `user` | 403 (forbidden) |

---

### Symptom Management (`SymptomManagementTest.php`) — 17 tests

#### BVA: `code` (string, max:10)
| Test Case | Value | Expected |
|-----------|-------|----------|
| Single char | `"G"` | Valid |
| Just below max (9) | `"G12345678"` | Valid |
| At max (10) | `"G123456789"` | Valid |
| Above max (11) | `"G1234567890"` | Error |
| Far above (20) | 20 chars | Error |

---

### Treatment Management (`TreatmentManagementTest.php`) — 29 tests

#### EP: `type` (enum)
| Partition | Value | Expected |
|-----------|-------|----------|
| Valid: prevention | `'prevention'` | Pass |
| Valid: chemical | `'chemical'` | Pass |
| Valid: biological | `'biological'` | Pass |
| Valid: cultural | `'cultural'` | Pass |
| Invalid: organic | `'organic'` | Error |
| Invalid: mechanical | `'mechanical'` | Error |
| Invalid: empty | `''` | Error |
| Invalid: uppercase | `'CHEMICAL'` | Error |

#### BVA: `priority` (integer, min:0)
| Test Case | Value | Expected |
|-----------|-------|----------|
| At minimum | 0 | Valid |
| Just above min | 1 | Valid |
| Nominal | 5 | Valid |
| Large value | 100 | Valid |
| Below minimum | -1 | Error |
| Far below | -10 | Error |

#### Decision Table: `dosage` / `dosage_unit` (required_with)
| Rule | dosage | dosage_unit | Outcome |
|------|:------:|:-----------:|---------|
| R1 | null | null | Valid |
| R2 | null | present | Valid |
| R3 | **present** | **null** | **Error** (dosage_unit required) |
| R4 | present | present | Valid |

---

### User Management (`UserManagementTest.php`) — 28 tests

#### EP: `role` (enum: super_admin, admin, pakar, user)
| Partition | Value | Expected |
|-----------|-------|----------|
| Valid: super_admin | `'super_admin'` | Pass |
| Valid: admin | `'admin'` | Pass |
| Valid: pakar | `'pakar'` | Pass |
| Valid: user | `'user'` | Pass |
| Invalid: moderator | `'moderator'` | Error |
| Invalid: editor | `'editor'` | Error |
| Invalid: empty | `''` | Error |
| Invalid: ADMIN | `'ADMIN'` | Error |
| Invalid: numeric | `'123'` | Error |

#### Decision Table: User Deletion Logic
| Rule | C1: Is Self? | C2: Target SuperAdmin? | Outcome |
|------|:------------:|:----------------------:|---------|
| R1 | Yes | — | Blocked (not deleted) |
| R2 | No | Yes | Blocked (not deleted) |
| R3 | No | No | Deleted successfully |

#### EP: Access Control
| Role | Can Access `/admin/system/users`? |
|------|:--------------------------------:|
| `super_admin` | Yes (200) |
| `admin` | No (403) |
| `pakar` | No (403) |
| `user` | No (403) |

---

### Registration (`RegistrationTest.php`) — 17 tests

#### EP: Required Fields
| Field Missing | Expected |
|---------------|----------|
| `name` | Error on `name` |
| `email` | Error on `email` |
| `password` | Error on `password` |

#### EP: Email Format
| Partition | Value | Expected |
|-----------|-------|----------|
| No @ symbol | `'testexample.com'` | Error |
| No domain | `'test@'` | Error |
| No local part | `'@example.com'` | Error |
| Plain string | `'not-an-email'` | Error |
| Multiple @ | `'user@@example.com'` | Error |

#### BVA: String Lengths
| Field | At Max (255) | Above Max (256) |
|-------|:------------:|:---------------:|
| `name` | Valid | Error |
| `email` | Valid | Error |

---

### Profile Update (`ProfileUpdateTest.php`) — 16 tests

#### BVA: String Lengths
| Field | At Max (255) | Above Max (256) |
|-------|:------------:|:---------------:|
| `name` | Valid | Error |
| `email` | Valid | Error |

#### EP: Email Validation
| Partition | Value | Expected |
|-----------|-------|----------|
| No @ symbol | `'invalidemail.com'` | Error |
| No domain | `'user@'` | Error |
| No local part | `'@domain.com'` | Error |
| Plain string | `'not-an-email'` | Error |
| Duplicate email | (existing) | Error |

---

### Role Middleware (`RoleMiddlewareTest.php`) — 5 tests

Comprehensive EP testing of the 4-role domain separation:

| Route Group | super_admin | pakar | admin | user | Unauthenticated |
|-------------|:-----------:|:-----:|:-----:|:----:|:---------------:|
| Knowledge Base (`/admin/knowledge-base/*`) | 200 | 200 | 403 | 403 | 302→login |
| System (`/admin/system/users`) | 200 | 403 | 403 | 403 | 302→login |
| Detections (`/admin/detections`) | 200 | 200 | 200 | 403 | 302→login |

---

## Validation Rules yang Diuji

### Numeric Boundaries (BVA)

| Field | Min | Max | Type | Tested In |
|-------|-----|-----|------|-----------|
| `confidence` | 0 | 100 | numeric | DetectionController, ExpertSystem |
| `temperature` | -50 | 60 | numeric | DetectionController |
| `latitude` | -90 | 90 | numeric | DetectionController, Weather |
| `longitude` | -180 | 180 | numeric | DetectionController, Weather |
| `scan_duration_ms` | 0 | — | integer | DetectionController |
| `priority` | 0 | — | integer | TreatmentManagement |
| `symptoms.*.weight` | 0 | 1 | numeric | DiseaseManagement |

### String Length Boundaries (BVA)

| Field | Max | Tested In |
|-------|-----|-----------|
| `name` | 255 | Registration, UserManagement, ProfileUpdate, Disease, Symptom |
| `email` | 255 | Registration, ProfileUpdate |
| `code` (symptom) | 10 | SymptomManagement |
| `dosage` | 50 | TreatmentManagement |
| `dosage_unit` | 50 | TreatmentManagement |
| `label` | 255 | DetectionController |
| `notes` | 1000 | DetectionController |

### Enum/In Values (EP)

| Field | Valid Values | Tested In |
|-------|-------------|-----------|
| `role` | super_admin, admin, pakar, user | UserManagement, RoleMiddleware |
| `method` | image, expert_system | DetectionController |
| `type` (treatment) | prevention, chemical, biological, cultural | TreatmentManagement |
| `connection_status` | online, offline | DetectionController |
| Image MIME | jpeg, png, jpg, webp | DetectionController |

### Unique Constraints (EP)

| Field | Table | Tested In |
|-------|-------|-----------|
| `email` | users | Registration, UserManagement, ProfileUpdate |
| `code` | symptoms | SymptomManagement |

### Decision Tables

| Component | Conditions | Rules | Tested In |
|-----------|:----------:|:-----:|-----------|
| User Deletion | isSelf + isTargetSuperAdmin | 3 rules (5 cases) | UserManagement |
| Treatment Dosage | dosage + dosage_unit presence | 4 rules | TreatmentManagement |

### Sampling (Expert System)

| Strategi | Input Space | Sampel | Tested In |
|----------|:-----------:|:------:|-----------|
| Boundary | 2^47 combinations | min=1, max=all | ExpertSystem |
| Disease-Aligned | 10 diseases x symptoms | 2 exact matches | ExpertSystem |
| Cross-Disease | Multi-disease combos | 3 conflict scenarios | ExpertSystem |

---

## Pola Desain Test

### 1. Pest Datasets (`->with()`)

Digunakan untuk menghindari duplikasi test blocks saat menguji multiple input values:

```php
it('rejects invalid values', function (mixed $value) {
    // ... test logic
})->with([
    'label 1' => [value1],
    'label 2' => [value2],
]);
```

### 2. `beforeEach()` untuk Setup

```php
beforeEach(function () {
    Disease::create(['name' => 'Blast', 'slug' => 'blast', ...]);
});
```

### 3. Global Helper `makeDetection()`

Karena `user_id` tidak mass-assignable (defense-in-depth), helper ini bypass guard:

```php
function makeDetection(User $user, array $attributes = []): Detection
{
    $detection = new Detection(array_merge(['method' => 'image'], $attributes));
    $detection->user_id = $user->id;
    $detection->save();
    return $detection;
}
```

### 4. `actingAs()` untuk Simulasi Auth

```php
$this->actingAs($user)->post('/detection', [...]);
```

### 5. `skipUnlessFortifyHas()` untuk Feature Flags

```php
beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});
```

---

## Cara Menambahkan Test Baru

### Template BVA untuk Numeric Field

```php
it('accepts [field] at valid boundaries', function (float|int $value) {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->post('/endpoint', [
        'field' => $value,
    ]);
    $response->assertSessionDoesntHaveErrors(['field']);
})->with([
    'at minimum (MIN)' => [MIN],
    'just above minimum' => [MIN + 0.01],
    'nominal' => [NOMINAL],
    'just below maximum' => [MAX - 0.01],
    'at maximum (MAX)' => [MAX],
]);

it('rejects [field] at invalid boundaries', function (float|int $value) {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->post('/endpoint', [
        'field' => $value,
    ]);
    $response->assertSessionHasErrors(['field']);
})->with([
    'below minimum' => [MIN - 0.01],
    'above maximum' => [MAX + 0.01],
]);
```

### Template EP untuk Enum Field

```php
it('accepts valid [field] values', function (string $value) {
    // ... setup & request
    $response->assertSessionDoesntHaveErrors(['field']);
})->with([
    'value1' => ['value1'],
    'value2' => ['value2'],
]);

it('rejects invalid [field] values', function (mixed $value) {
    // ... setup & request
    $response->assertSessionHasErrors(['field']);
})->with([
    'invalid string' => ['invalid'],
    'empty' => [''],
    'wrong case' => ['VALUE1'],
]);
```

### Template Decision Table

```php
it('applies decision table for [feature]', function (
    string $rule, ...conditions, expectedOutcome
) {
    // Setup berdasarkan conditions
    // Execute action
    // Assert berdasarkan expectedOutcome
})->with([
    'R1: condition_combo_1 → outcome_1' => ['R1', ...values, expected],
    'R2: condition_combo_2 → outcome_2' => ['R2', ...values, expected],
]);
```

### Template Sampling

```php
it('[Sampling] handles [scenario] correctly', function () {
    // Setup: seed data yang relevan
    // Execute: kirim sampel representatif
    // Assert: verify behavior tanpa crash + correct ranking
});
```

---

## CI/CD Integration

Test dijalankan otomatis di GitHub Actions pada branch `develop`, `main`, `master`:

```yaml
# .github/workflows/tests.yml (simplified)
jobs:
  backend:
    strategy:
      matrix:
        php: [8.3, 8.4, 8.5]
    steps:
      - run: composer install
      - run: php artisan test
```

---

## Referensi

- [Pest PHP Documentation](https://pestphp.com/docs)
- [Laravel Testing Documentation](https://laravel.com/docs/testing)
- [Equivalence Partitioning - ISTQB](https://www.istqb.org/)
- [Boundary Value Analysis - ISTQB](https://www.istqb.org/)
- [Decision Table Testing - ISTQB](https://www.istqb.org/)
- [Sampling Testing - IEEE 829](https://standards.ieee.org/)
