# PadiScan - Sistem Pakar Deteksi Penyakit Tanaman Padi

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
| Weather API | OpenWeatherMap |

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
| 4 | Suhu | Derajat Celsius (°C) | OpenWeatherMap API |
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
# VITE_OPENWEATHERMAP_API_KEY=your_api_key_here

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

**Akun default:**
- Email: `test@example.com`
- Password: `password`

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
├── app/
│   ├── Http/Controllers/
│   │   ├── DashboardController.php
│   │   ├── DetectionController.php
│   │   ├── DiseaseController.php
│   │   └── ExpertSystemController.php
│   └── Models/
│       ├── Detection.php
│       ├── Disease.php
│       ├── Symptom.php
│       └── Treatment.php
├── database/
│   ├── migrations/          # 5 migration files
│   └── seeders/             # Knowledge base seeders
├── ml/
│   ├── train_model.py       # Training script (MobileNetV2)
│   ├── convert_to_tfjs.py   # Konversi ke TF.js
│   └── requirements.txt
├── public/models/            # TF.js model files (setelah training)
├── resources/js/
│   ├── lib/
│   │   ├── ml-model.ts      # TF.js loader & inference
│   │   ├── expert-system.ts  # Forward Chaining + CF engine
│   │   └── geo-weather.ts   # Geolocation + Weather API
│   └── pages/
│       ├── welcome.tsx       # Landing page
│       ├── dashboard.tsx     # Dashboard + statistik
│       ├── detection/        # Deteksi citra + history + detail
│       ├── expert-system/    # Sistem pakar
│       └── diseases/         # Knowledge base
└── routes/web.php
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
