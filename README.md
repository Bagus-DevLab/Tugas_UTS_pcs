# Mapan - Sistem Pakar Deteksi Penyakit Tanaman Padi

Sistem Pakar Deteksi Penyakit Tanaman Padi Berbasis On-Device Machine Learning. Aplikasi web yang menggabungkan klasifikasi citra menggunakan TensorFlow.js (berjalan langsung di browser) dengan sistem pakar berbasis Forward Chaining dan Certainty Factor.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 13, PHP 8.3 |
| Frontend | React 19, TypeScript, Inertia.js |
| Styling | Tailwind CSS v4, shadcn/ui, Framer Motion |
| ML (Browser) | TensorFlow.js, MobileNetV2 |
| ML (Training) | Python, TensorFlow/Keras |
| Database | SQLite |
| Weather API | OpenWeatherMap (via backend proxy) |
| CI/CD | GitHub Actions |

## Fitur

### Deteksi Penyakit via Citra (On-Device ML)
- Upload atau ambil foto daun padi
- Model MobileNetV2 berjalan langsung di browser (TensorFlow.js)
- Klasifikasi 5 kelas: Blast, Brown Spot, Tungro, Bacterial Leaf Blight, Healthy

### Sistem Pakar (Rule-Based)
- Input gejala secara manual (20 gejala, kode G01-G20)
- Metode Forward Chaining + Certainty Factor
- Diagnosis penyakit dengan skor kepastian

### 9 Variabel Pemindaian

Setiap deteksi mencatat 9 variabel:

| No | Variabel | Satuan | Sumber |
|----|----------|--------|--------|
| 1 | Citra Daun | JPEG/PNG | Upload / kamera |
| 2 | Label Penyakit | Teks | Output ML / Sistem Pakar |
| 3 | Tingkat Akurasi | Persen (%) | Confidence ML / CF score |
| 4 | Suhu | Derajat Celsius (°C) | OpenWeatherMap API (via backend proxy) |
| 5 | Waktu Pemindaian | Datetime + ms | Timestamp + durasi proses |
| 6 | Titik Koordinat | Lat, Long | Browser Geolocation API |
| 7 | Status Koneksi | Online / Offline | navigator.onLine |
| 8 | Rekomendasi Tindakan | Teks | Knowledge base |
| 9 | Dosis | ml/L, kg/ha, gram/L | Knowledge base |

### Fitur Lainnya
- Dashboard dengan statistik dan grafik distribusi penyakit
- Knowledge base lengkap (penyakit, gejala, penanganan, dosis)
- Riwayat deteksi dengan filter dan pagination
- Dark mode
- Responsive (mobile-friendly)
- Animasi UI dengan Framer Motion

## Role & Hak Akses

Sistem memiliki 3 role dengan hak akses bertingkat:

| Fitur | Super Admin | Admin | User |
|-------|:----------:|:-----:|:----:|
| Dashboard, Deteksi ML, Sistem Pakar | v | v | v |
| Knowledge Base (lihat) | v | v | v |
| Riwayat Deteksi (pribadi) | v | v | v |
| **Kelola Penyakit** (CRUD) | v | v | - |
| **Kelola Gejala** (CRUD) | v | v | - |
| **Kelola Penanganan** (CRUD) | v | v | - |
| **Lihat Semua Deteksi** user | v | v | - |
| **Kelola User** (edit role, hapus) | v | - | - |

### Sidebar Navigation per Role

- **User**: Dashboard, Deteksi Penyakit, Sistem Pakar, Knowledge Base, Riwayat Deteksi
- **Admin**: semua menu User + Kelola Penyakit, Kelola Gejala, Kelola Penanganan, Semua Deteksi
- **Super Admin**: semua menu Admin + Kelola User

### Implementasi

- Kolom `role` pada tabel `users` (enum: `super_admin`, `admin`, `user`)
- Middleware `CheckRole` untuk proteksi route berdasarkan role
- Helper methods pada model User: `isSuperAdmin()`, `isAdmin()`, `isAtLeastAdmin()`
- Route groups: `/admin/*` (admin + super_admin), `/admin/users/*` (super_admin only)
- Sidebar dinamis berdasarkan `auth.user.role` dari Inertia shared props

## Keamanan

| Aspek | Implementasi |
|-------|-------------|
| Authentication | Laravel Fortify + 2FA, semua route dilindungi `auth` + `verified` middleware |
| Authorization | 3-tier role system (super_admin, admin, user) + isolasi data per user |
| CSRF | Otomatis via Laravel `web` middleware + Inertia.js |
| Rate Limiting | `throttle` middleware pada semua POST routes (10-30 req/menit) |
| Input Validation | Validasi server-side pada semua controller (type, range, format) |
| API Key Protection | OpenWeatherMap API key disimpan server-side, di-proxy via `WeatherController` |
| File Upload | Validasi tipe file (`image\|mimes:jpeg,png,jpg`), max 10MB |
| SQL Injection | Eloquent ORM dengan parameterized queries |
| XSS | React auto-escaping, tidak ada `dangerouslySetInnerHTML` di halaman aplikasi |
| Mass Assignment | `$fillable` whitelist pada semua model, `user_id` di-set eksplisit |
| Password | Bcrypt 12 rounds, hashed cast pada model |
| Self-Protection | Super Admin tidak bisa mengubah role sendiri atau menghapus akun sendiri |

## Prasyarat

- PHP >= 8.3
- Composer
- Node.js >= 18
- npm
- Python >= 3.9 (untuk training model)

## Instalasi

```bash
# 1. Clone repository
git clone <repo-url>
cd tugas_uts_pcs

# 2. Install PHP dependencies
composer install

# 3. Install Node.js dependencies
npm install

# 4. Setup environment
cp .env.example .env
php artisan key:generate

# 5. Tambahkan API key OpenWeatherMap di .env
# Daftar gratis di https://openweathermap.org/api
# Lalu isi:
# OPENWEATHERMAP_API_KEY=your_api_key_here

# 6. Jalankan migrasi dan seeder
php artisan migrate:fresh --seed

# 7. Buat storage link
php artisan storage:link
```

## Menjalankan Aplikasi

```bash
# Terminal 1 - Laravel server
php artisan serve

# Terminal 2 - Vite dev server
npm run dev
```

Buka http://localhost:8000

### Akun Default

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@mapan.test` | `password` |
| Admin | `admin@mapan.test` | `password` |
| User | `user@mapan.test` | `password` |

## Testing

### Backend Tests (Pest PHP)

```bash
php artisan test
```

106 tests mencakup:

| Test File | Cakupan |
|-----------|---------|
| `Models/DiseaseTest` | Create, relasi symptoms/treatments/detections |
| `Models/SymptomTest` | Create, unique constraint, relasi diseases |
| `Models/TreatmentTest` | Create dengan/tanpa dosis, relasi disease |
| `Models/DetectionTest` | 9 variabel, expert system, relasi, JSON casts, mass assignment protection |
| `DashboardControllerTest` | Statistik, empty state, isolasi user, auth |
| `DetectionControllerTest` | CRUD, validasi, history, filter, auth, isolasi user, image upload |
| `ExpertSystemControllerTest` | Diagnosa, CF calculation, validasi, store, auth |
| `DiseaseControllerTest` | Index, detail, auth |
| `SeederTest` | 5 penyakit, 20 gejala, relasi+bobot, treatments+dosis |
| `RoleMiddlewareTest` | Akses per role (super_admin, admin, user), unauthenticated |
| `Admin/DiseaseManagementTest` | CRUD penyakit, authorization, validasi |
| `Admin/UserManagementTest` | CRUD user, edit role, self-protection, validasi |

### Frontend Tests (Vitest)

```bash
npm test
```

29 tests mencakup:

| Test File | Cakupan |
|-----------|---------|
| `expert-system.test.ts` | diagnose(), CF combination formula, filtering, edge cases |
| `geo-weather.test.ts` | formatCoordinates(), getGoogleMapsUrl(), getConnectionStatus() |
| `ml-model.test.ts` | CLASS_LABELS, getTopPrediction() |

### Menjalankan Semua Tests

```bash
# Backend + Frontend
php artisan test && npm test
```

## CI/CD (GitHub Actions)

Project ini memiliki 2 workflow yang berjalan otomatis pada setiap push/PR ke branch `main`, `master`, `develop`:

### `lint.yml` - Code Quality

Memastikan semua code mengikuti style guide:

| Step | Tool | Fungsi |
|------|------|--------|
| Run Pint | Laravel Pint | Code style PHP |
| Format Frontend | Prettier | Format TypeScript/React |
| Lint Frontend | ESLint | Cek error & bad patterns |

### `tests.yml` - Automated Testing

Memastikan semua fitur berjalan setelah perubahan code:

| Job | Tool | Fungsi |
|-----|------|--------|
| `backend` | Pest PHP | 106 tests di PHP 8.3, 8.4, 8.5 (matrix) |
| `frontend` | Vitest | 29 tests (tanpa PHP dependency) |

## Training Model ML

Model ML perlu di-training terlebih dahulu agar fitur deteksi citra berfungsi.

```bash
# 1. Masuk ke folder ml
cd ml

# 2. Buat virtual environment
python3 -m venv venv
source venv/bin/activate   # Linux/Mac
# venv\Scripts\activate    # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Setup Kaggle API (untuk download dataset otomatis)
# - Login ke https://www.kaggle.com
# - Settings > API > Create New Token
# - Simpan kaggle.json ke ~/.kaggle/

# 5. Training model (~10 menit GPU / ~1-3 jam CPU)
python train_model.py

# 6. Konversi ke TensorFlow.js
python convert_to_tfjs.py

# 7. Deaktifkan venv
deactivate
```

Hasil training:
- `ml/model/rice_disease_model.h5` - Model Keras
- `ml/model/training_history.png` - Grafik training
- `ml/model/confusion_matrix.png` - Confusion matrix
- `public/models/rice-disease/model.json` - Model TF.js (untuk browser)

> Tanpa model, fitur deteksi citra tetap bisa diakses tetapi akan menampilkan pesan error. Fitur Sistem Pakar (input gejala manual) tetap berfungsi tanpa model.

## Struktur Project

```
├── .github/workflows/
│   ├── lint.yml                  # CI: code quality checks
│   └── tests.yml                 # CI: automated testing
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/
│   │   │   │   ├── DiseaseManagementController.php
│   │   │   │   ├── SymptomManagementController.php
│   │   │   │   ├── TreatmentManagementController.php
│   │   │   │   ├── DetectionManagementController.php
│   │   │   │   └── UserManagementController.php    # Super Admin only
│   │   │   ├── DashboardController.php
│   │   │   ├── DetectionController.php
│   │   │   ├── DiseaseController.php
│   │   │   ├── ExpertSystemController.php
│   │   │   └── WeatherController.php
│   │   └── Middleware/
│   │       └── CheckRole.php         # Role-based access control
│   └── Models/
│       ├── Detection.php
│       ├── Disease.php
│       ├── Symptom.php
│       ├── Treatment.php
│       └── User.php                  # role field + helper methods
├── database/
│   ├── migrations/                   # 6 migration files (termasuk add_role)
│   └── seeders/                      # Knowledge base + 3 default users
├── ml/
│   ├── train_model.py
│   ├── convert_to_tfjs.py
│   └── requirements.txt
├── public/models/                     # TF.js model files (setelah training)
├── resources/js/
│   ├── lib/
│   │   ├── ml-model.ts
│   │   ├── expert-system.ts
│   │   └── geo-weather.ts
│   └── pages/
│       ├── welcome.tsx                # Landing page
│       ├── dashboard.tsx
│       ├── detection/                 # Deteksi citra + history + detail
│       ├── expert-system/             # Sistem pakar
│       ├── diseases/                  # Knowledge base (read-only)
│       └── admin/                     # Admin panel
│           ├── diseases/              # CRUD penyakit (admin+)
│           ├── symptoms/              # CRUD gejala (admin+)
│           ├── treatments/            # CRUD penanganan (admin+)
│           ├── detections/            # Semua deteksi user (admin+)
│           └── users/                 # Kelola user (super_admin only)
├── tests/
│   ├── Feature/
│   │   ├── Models/
│   │   ├── Admin/
│   │   │   ├── DiseaseManagementTest.php
│   │   │   └── UserManagementTest.php
│   │   ├── RoleMiddlewareTest.php
│   │   ├── DashboardControllerTest.php
│   │   ├── DetectionControllerTest.php
│   │   ├── ExpertSystemControllerTest.php
│   │   ├── DiseaseControllerTest.php
│   │   └── SeederTest.php
│   └── Unit/
├── routes/web.php
└── vitest.config.ts
```

## Knowledge Base

### Penyakit yang Dideteksi

| Penyakit | Nama Latin | Jumlah Gejala |
|----------|-----------|---------------|
| Blast | Pyricularia oryzae | 5 |
| Brown Spot | Bipolaris oryzae | 5 |
| Tungro | Rice Tungro Virus (RTBV + RTSV) | 6 |
| Bacterial Leaf Blight | Xanthomonas oryzae pv. oryzae | 5 |
| Healthy | - | 0 |

### Metode Sistem Pakar

**Forward Chaining** - Inferensi dari gejala menuju kesimpulan penyakit.

**Certainty Factor** - Menghitung tingkat kepastian diagnosis:
```
CF_combine(CF1, CF2) = CF1 + CF2 * (1 - CF1)
```

Setiap gejala memiliki bobot (weight) 0.00 - 1.00 terhadap masing-masing penyakit. Skor CF akhir dikonversi ke persentase (0-100%).

## Color Palette

| Nama | Hex | Penggunaan |
|------|-----|------------|
| Sand | `#DDD8C4` | Borders, backgrounds |
| Sage | `#A3C9A8` | Secondary elements |
| Leaf | `#84B59F` | Primary (dark mode) |
| Teal | `#69A297` | Hover states, icons |
| Deep | `#50808E` | Primary (light mode), headings |
