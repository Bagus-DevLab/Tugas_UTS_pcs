# Mapan - Sistem Pakar Deteksi Penyakit Tanaman Padi

Sistem Pakar Deteksi Penyakit Tanaman Padi Berbasis On-Device Machine Learning. Aplikasi web yang menggabungkan klasifikasi citra menggunakan ONNX Runtime Web (berjalan langsung di browser) dengan sistem pakar berbasis Forward Chaining dan Certainty Factor.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 13, PHP 8.3 |
| Frontend | React 19, TypeScript, Inertia.js |
| Styling | Tailwind CSS v4, shadcn/ui (31 komponen), Framer Motion |
| ML (Browser) | ONNX Runtime Web, MobileNetV2 |
| ML (Training) | Python, TensorFlow/Keras, tf2onnx |
| Database | SQLite |
| Weather API | OpenWeatherMap (via backend proxy) |
| CI/CD | GitHub Actions |

## Fitur

### Deteksi Penyakit via Citra (On-Device ML)
- Upload atau ambil foto daun padi
- Model MobileNetV2 berjalan langsung di browser (ONNX Runtime Web)
- Klasifikasi 11 kelas penyakit + sehat

### Sistem Pakar (Rule-Based)
- Input gejala secara manual (47 gejala, kode G01-G47)
- Metode Forward Chaining + Certainty Factor
- Diagnosis penyakit dengan skor kepastian

### 9 Variabel Pemindaian

Setiap deteksi mencatat 9 variabel:

| No | Variabel | Satuan | Sumber |
|----|----------|--------|--------|
| 1 | Citra Daun | JPEG/PNG/WebP | Upload / kamera |
| 2 | Label Penyakit | Teks | Output ML / Sistem Pakar |
| 3 | Tingkat Akurasi | Persen (%) | Confidence ML / CF score |
| 4 | Suhu | Derajat Celsius (°C) | OpenWeatherMap API (via backend proxy) |
| 5 | Waktu Pemindaian | Datetime + ms | Timestamp + durasi proses |
| 6 | Titik Koordinat | Lat, Long | Browser Geolocation API |
| 7 | Status Koneksi | Online / Offline | navigator.onLine |
| 8 | Rekomendasi Tindakan | Teks | Knowledge base |
| 9 | Dosis | ml/L, kg/ha, gram/L | Knowledge base |

### Fitur Lainnya
- Dashboard dengan statistik, grafik distribusi (Tabs, HoverCard, Progress bar)
- Knowledge base lengkap (penyakit, gejala, penanganan, dosis)
- Riwayat deteksi dengan filter dan pagination
- Dark mode
- Responsive (mobile-friendly)
- Animasi UI dengan Framer Motion
- Password strength indicator pada registrasi

### shadcn/ui Components (31 komponen)

Komponen yang digunakan: Alert, Avatar, Badge, Breadcrumb, Button, Card, Checkbox, Collapsible, Dialog, Dropdown Menu, Hover Card, Icon, Input, Input OTP, Label, Navigation Menu, Placeholder Pattern, Progress, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Sonner (Toast), Spinner, Table, Tabs, Toggle, Toggle Group, Tooltip.

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
| File Upload | Validasi tipe file (`image\|mimes:jpeg,png,jpg,webp`), max 10MB |
| SQL Injection | Eloquent ORM dengan parameterized queries |
| XSS | React auto-escaping, tidak ada `dangerouslySetInnerHTML` di halaman aplikasi |
| Mass Assignment | `$fillable` whitelist pada semua model, `user_id` di-set eksplisit |
| Password | Bcrypt 12 rounds, hashed cast pada model, strength indicator pada registrasi |
| Self-Protection | Super Admin tidak bisa mengubah role sendiri atau menghapus akun sendiri |

## API Structure

API menggunakan **dual-prefix architecture** untuk memisahkan endpoint public dan private:

### `/public/api/v1/*` - Public Endpoints
- ✅ **No authentication required**
- Semua endpoint GET (read-only)
- Login & Register

**Contoh:**
```bash
GET  /public/api/v1/diseases
GET  /public/api/v1/symptoms
GET  /public/api/v1/detections
POST /public/api/v1/login
POST /public/api/v1/register
```

### `/private/api/v1/*` - Private Endpoints
- 🔒 **Authentication required** (Bearer token)
- Semua endpoint POST/PUT/DELETE (write operations)
- User info & Logout
- Admin endpoints (`/private/api/v1/admin/*`)

**Contoh:**
```bash
GET    /private/api/v1/user
POST   /private/api/v1/logout
POST   /private/api/v1/detections
POST   /private/api/v1/detections/predict
DELETE /private/api/v1/detections/{id}
POST   /private/api/v1/expert-system/diagnose

# Admin endpoints (admin/super_admin only)
GET    /private/api/v1/admin/dashboard/stats
GET    /private/api/v1/admin/diseases
POST   /private/api/v1/admin/diseases
PUT    /private/api/v1/admin/diseases/{id}
DELETE /private/api/v1/admin/diseases/{id}
```

### Testing API

Gunakan **Bruno** collection di folder `bruno/Mapan_API/`:
- Environment: Local6000, Local8000, Ngrok
- Folder structure: `Public/` dan `Private/`
- 21 request files sudah dikonfigurasi

Lihat `bruno/README.md` untuk dokumentasi lengkap.

**Migration Guide:** Jika Anda mengupdate dari versi sebelumnya, baca `MIGRATION_GUIDE.md` untuk panduan migrasi frontend.

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

144 tests mencakup:

| Test File | Cakupan |
|-----------|---------|
| `Models/DiseaseTest` | Create, relasi symptoms/treatments/detections |
| `Models/SymptomTest` | Create, unique constraint, relasi diseases |
| `Models/TreatmentTest` | Create dengan/tanpa dosis, relasi disease |
| `Models/DetectionTest` | 9 variabel, expert system, relasi, JSON casts, mass assignment protection |
| `DashboardControllerTest` | Statistik, empty state, isolasi user, auth |
| `DetectionControllerTest` | CRUD, validasi, history, filter, auth, isolasi user, image upload |
| `ExpertSystemControllerTest` | Diagnosa, CF calculation, validasi, store, auth |
| `DiseaseControllerTest` | Index, detail, auth, detection count scoping |
| `SeederTest` | 11 penyakit, 47 gejala, relasi+bobot, treatments+dosis |
| `RoleMiddlewareTest` | Akses per role (super_admin, admin, user), unauthenticated |
| `WeatherControllerTest` | API proxy, validasi, error handling, auth |
| `Admin/DiseaseManagementTest` | CRUD penyakit, authorization, validasi |
| `Admin/SymptomManagementTest` | CRUD gejala, unique code, cascade delete |
| `Admin/TreatmentManagementTest` | CRUD penanganan, dosage validation, type enum |
| `Admin/DetectionManagementTest` | View all, filter, search, delete, authorization |
| `Admin/UserManagementTest` | CRUD user, edit role, self-protection, validasi |
| `Unit/UserRoleTest` | Role constants, helper methods, default role |

### Frontend Tests (Vitest)

```bash
npm test
```

38 tests mencakup:

| Test File | Cakupan |
|-----------|---------|
| `expert-system.test.ts` | diagnose(), CF combination formula, filtering, edge cases |
| `expert-system-advanced.test.ts` | Shared symptoms, CF commutativity, weight edge cases |
| `geo-weather.test.ts` | formatCoordinates(), getGoogleMapsUrl(), getConnectionStatus() |
| `ml-model.test.ts` | CLASS_LABELS (11 kelas), getTopPrediction() |

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
| `backend` | Pest PHP | 144 tests di PHP 8.3, 8.4, 8.5 (matrix) |
| `frontend` | Vitest | 38 tests (tanpa PHP dependency) |

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

# 4. Labeling dataset (jika belum dilabel)
python label_dataset.py

# 5. Split dataset ke train/val/test
python split_dataset.py

# 6. Training model (~10 menit GPU / ~1-3 jam CPU)
python train_model.py

# 7. Konversi ke ONNX format
python convert_to_tfjs.py

# 8. Deaktifkan venv
deactivate
```

Hasil training:
- `ml/model/rice_disease_model.h5` - Model Keras
- `ml/model/rice_disease.onnx` - Model ONNX
- `ml/model/training_history.png` - Grafik training
- `ml/model/confusion_matrix.png` - Confusion matrix
- `public/models/rice-disease/model.onnx` - Model ONNX (untuk browser)

> Tanpa model, fitur deteksi citra tetap bisa diakses tetapi akan menampilkan pesan error. Fitur Sistem Pakar (input gejala manual) tetap berfungsi tanpa model.

### ML Pipeline

```
Dataset (foto berlabel)
    │
    ├── label_dataset.py     # Tool labeling interaktif
    ├── clean_dataset.py     # Hapus foto corrupt
    ├── split_dataset.py     # Split train/val/test (80/10/10)
    │
    ▼
Training (MobileNetV2 Transfer Learning)
    │
    ├── train_model.py       # 2-phase training (head + fine-tune)
    │
    ▼
Konversi
    │
    ├── convert_to_tfjs.py   # Keras → ONNX → browser
    │
    ▼
Browser (ONNX Runtime Web via WASM)
```

### Catatan: Keras 3 vs TF.js

Project ini menggunakan **ONNX Runtime Web** sebagai pengganti TensorFlow.js karena:
- TensorFlow 2.16+ menggunakan Keras 3 yang memiliki format serialisasi model berbeda
- TF.js `loadLayersModel` tidak kompatibel dengan topology Keras 3
- ONNX format menyimpan computational graph yang sudah final (tidak perlu reconstruction)
- `tf2onnx` converter sudah mature dan output-nya diverifikasi match 100% dengan Keras

## Struktur Project

```
├── .github/workflows/
│   ├── lint.yml                  # CI: code quality checks
│   └── tests.yml                 # CI: automated testing
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/            # 5 admin controllers
│   │   │   ├── DashboardController.php
│   │   │   ├── DetectionController.php
│   │   │   ├── DiseaseController.php
│   │   │   ├── ExpertSystemController.php
│   │   │   └── WeatherController.php
│   │   └── Middleware/
│   │       └── CheckRole.php
│   └── Models/                   # 5 models (User, Disease, Symptom, Treatment, Detection)
├── database/
│   ├── migrations/               # 6 migration files
│   └── seeders/                  # Knowledge base (11 penyakit) + 3 default users
├── ml/
│   ├── train_model.py            # Training script (MobileNetV2, 11 kelas)
│   ├── convert_to_tfjs.py        # Keras 3 → ONNX converter
│   ├── split_dataset.py          # Dataset splitter (train/val/test)
│   ├── label_dataset.py          # Interactive labeling tool
│   ├── clean_dataset.py          # Remove corrupt images
│   └── requirements.txt
├── public/models/                 # ONNX model file (setelah training)
├── resources/js/
│   ├── components/ui/            # 31 shadcn/ui components
│   ├── lib/
│   │   ├── ml-model.ts           # ONNX Runtime Web loader & inference
│   │   ├── expert-system.ts      # Forward Chaining + CF engine
│   │   └── geo-weather.ts        # Geolocation + Weather (via backend proxy)
│   └── pages/
│       ├── welcome.tsx            # Landing page (animated)
│       ├── dashboard.tsx          # Dashboard (Tabs, HoverCard, Progress, Table)
│       ├── auth/                  # Login (Alert, Tooltip) + Register (Progress strength)
│       ├── detection/             # Deteksi citra + history + detail
│       ├── expert-system/         # Sistem pakar
│       ├── diseases/              # Knowledge base
│       └── admin/                 # Admin panel (5 sections)
├── tests/
│   ├── Feature/                  # 144 backend tests
│   └── Unit/
├── routes/web.php
└── vitest.config.ts              # Frontend test config
```

## Knowledge Base

### Penyakit yang Dideteksi (11 Kelas)

| Penyakit | Nama Latin | Gejala |
|----------|-----------|:------:|
| Blast | Pyricularia oryzae | 5 |
| Brown Spot | Bipolaris oryzae | 5 |
| Tungro | Rice Tungro Virus (RTBV + RTSV) | 6 |
| Bacterial Leaf Blight | Xanthomonas oryzae pv. oryzae | 5 |
| Hispa | Dicladispa armigera | 5 |
| Dead Heart | Scirpophaga incertulas | 5 |
| Downy Mildew | Sclerophthora macrospora | 5 |
| Bacterial Leaf Streak | Xanthomonas oryzae pv. oryzicola | 4 |
| Bacterial Panicle Blight | Burkholderia glumae | 5 |
| Leaf Smut | Entyloma oryzae | 4 |
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
