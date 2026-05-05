# Dokumentasi Unit Testing - Mapan

## Ringkasan

Dokumen ini menjelaskan strategi, teknik, dan implementasi pengujian (testing) pada aplikasi **Mapan** — Sistem Pakar Deteksi Penyakit Tanaman Padi.

| Metrik | Nilai |
|--------|------:|
| **Total Test Cases** | 336 |
| **Total Assertions** | 962 |
| **Test Files** | 30 |
| **Execution Time** | ~5.5 detik |
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
│   ├── ExpertSystemControllerTest.php # Expert system + BVA + EP
│   ├── RoleMiddlewareTest.php        # Role-based access control EP
│   ├── SeederTest.php                # Database seeder integrity
│   ├── WeatherControllerTest.php     # Weather API + BVA lat/lon
│   ├── Admin/
│   │   ├── DetectionManagementTest.php   # Admin detection management
│   │   ├── DiseaseManagementTest.php     # Disease CRUD + BVA weight + EP
│   │   ├── SymptomManagementTest.php     # Symptom CRUD + BVA code/name
│   │   ├── TreatmentManagementTest.php   # Treatment CRUD + EP type + BVA
│   │   └── UserManagementTest.php        # User CRUD + EP role + BVA name
│   ├── Auth/
│   │   ├── AuthenticationTest.php        # Login, 2FA, rate limiting
│   │   ├── RegistrationTest.php          # Register + EP + BVA
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
│       ├── ProfileUpdateTest.php         # Profile CRUD + EP + BVA
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

### Treatment Management (`TreatmentManagementTest.php`) — 25 tests

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

---

### User Management (`UserManagementTest.php`) — 23 tests

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

#### EP: Access Control
| Role | Can Access `/admin/system/users`? |
|------|----------------------------------|
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

#### EP: Uniqueness & Confirmation
| Scenario | Expected |
|----------|----------|
| Duplicate email | Error on `email` |
| Password mismatch | Error on `password` |
| Default role assigned | `'user'` |

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

### Expert System (`ExpertSystemControllerTest.php`) — 19 tests

#### BVA: `symptom_ids` (array, min:1)
| Test Case | Value | Expected |
|-----------|-------|----------|
| At minimum (1 element) | `[1]` | 200 OK |
| Multiple elements | `[1, 2, 3]` | 200 OK |
| Below minimum (empty) | `[]` | 422 Error |

#### EP: Type Validation
| Partition | Value | Expected |
|-----------|-------|----------|
| String instead of array | `'not-an-array'` | 422 |
| Integer instead of array | `123` | 422 |
| Null | `null` | 422 |

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
- [Equivalence Partitioning (ISTQB)](https://www.istqb.org/)
- [Boundary Value Analysis (ISTQB)](https://www.istqb.org/)
