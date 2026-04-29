# Mapan API - Bruno Collection

Bruno collection untuk testing API Mapan (Sistem Pakar Deteksi Penyakit Tanaman Padi).

## Setup

1. Install Bruno: https://www.usebruno.com/downloads
2. Open Bruno dan klik "Open Collection"
3. Pilih folder `bruno/Mapan_API`

## Environments

Collection ini memiliki 3 environment:

### Local8000 (Frontend + API)
- `base_url`: http://localhost:8000/public/api/v1
- Command: `php -S localhost:8000 -t public`

### Local6000 (API Only)
- `base_url`: http://localhost:6000/public/api/v1
- Command: `php -S localhost:6000 -t public`

### Ngrok
- `base_url`: https://your-ngrok-url.ngrok-free.app/public/api/v1
- Ganti `your-ngrok-url` dengan URL ngrok Anda
- Aktifkan ngrok: `ngrok http 8000`

## Authentication Flow

1. **Register** atau **Login** untuk mendapatkan token
2. Token akan otomatis disimpan ke environment variable `token`
3. Semua request lain akan menggunakan token ini di header `Authorization: Bearer {token}`

## All Available Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login to get token |

### Auth (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user` | Get current user info |
| POST | `/logout` | Logout and invalidate token |

### Dashboard
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/dashboard/stats` | Get dashboard statistics | admin/super_admin |

### Detections (CRUD)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/detections` | Get all detections |
| POST | `/detections` | Create new detection |
| POST | `/detections/predict` | ML inference on image (server-side) |
| GET | `/detections/{id}` | Get detection by ID |
| DELETE | `/detections/{id}` | Delete detection |

### Expert System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/symptoms` | Get all symptoms |
| POST | `/expert-system/diagnose` | Diagnose disease by symptoms |
| POST | `/expert-system` | Store expert system consultation |

### Knowledge Base (Read-only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/diseases` | Get all diseases with symptoms & treatments |
| GET | `/diseases/{slug}` | Get disease by slug |

### Admin - Diseases Management
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/admin/diseases` | Get all diseases (admin) | admin/super_admin |
| POST | `/admin/diseases` | Create disease | admin/super_admin |
| PUT | `/admin/diseases/{id}` | Update disease | admin/super_admin |
| DELETE | `/admin/diseases/{id}` | Delete disease | admin/super_admin |

### Admin - Symptoms Management
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/admin/symptoms` | Get all symptoms (admin) | admin/super_admin |
| POST | `/admin/symptoms` | Create symptom | admin/super_admin |
| PUT | `/admin/symptoms/{id}` | Update symptom | admin/super_admin |
| DELETE | `/admin/symptoms/{id}` | Delete symptom | admin/super_admin |

### Admin - Treatments Management
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/admin/treatments` | Get all treatments | admin/super_admin |
| POST | `/admin/treatments` | Create treatment | admin/super_admin |
| PUT | `/admin/treatments/{id}` | Update treatment | admin/super_admin |
| DELETE | `/admin/treatments/{id}` | Delete treatment | admin/super_admin |

### Admin - Detections (View All)
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/admin/detections` | Get all detections (admin view) | admin/super_admin |

### Super Admin - User Management
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/admin/users` | Get all users | super_admin |
| PUT | `/admin/users/{id}` | Update user | super_admin |
| DELETE | `/admin/users/{id}` | Delete user | super_admin |

## Collection Structure

```
bruno/Mapan_API/
├── bruno.json                          # Collection config
├── environments/
│   ├── Local.bru                       # Local environment
│   └── Ngrok.bru                       # Ngrok environment
├── Auth/
│   ├── Register.bru                    # POST /register
│   ├── Login.bru                       # POST /login
│   ├── Get Current User.bru            # GET /user
│   └── Logout.bru                      # POST /logout
├── Detection/
│   ├── Create Detection.bru            # POST /detections
│   ├── Get All Detections.bru          # GET /detections
│   ├── Get Detection by ID.bru         # GET /detections/{id}
│   └── Delete Detection.bru            # DELETE /detections/{id}
├── Disease/
│   ├── Get All Diseases.bru            # GET /diseases
│   └── Get Disease by Slug.bru         # GET /diseases/{slug}
├── Expert System/
│   ├── Get All Symptoms.bru            # GET /symptoms
│   └── Diagnose Disease.bru            # POST /expert-system/diagnose
└── Admin/
    ├── Get Dashboard Stats.bru         # GET /dashboard/stats (admin)
    ├── Get All Diseases (Admin).bru     # GET /admin/diseases (admin)
    ├── Create Disease (Admin).bru       # POST /admin/diseases (admin)
    ├── Update Disease (Admin).bru      # PUT /admin/diseases/{id} (admin)
    ├── Delete Disease (Admin).bru      # DELETE /admin/diseases/{id} (admin)
    ├── Get All Users.bru               # GET /admin/users (super_admin)
    ├── Update User.bru                 # PUT /admin/users/{id} (super_admin)
    └── Delete User.bru                 # DELETE /admin/users/{id} (super_admin)
```

## Role Requirements

- **User**: Auth, Detection, Disease, Expert System endpoints
- **Admin**: Semua User endpoints + Admin Disease CRUD + Dashboard Stats
- **Super Admin**: Semua Admin endpoints + User Management (GET/PUT/DELETE /admin/users)

## Example: Testing Flow

### 1. Authentication
```
1. Run "Register" untuk membuat user baru
2. Atau run "Login" dengan credentials yang sudah ada
3. Token akan otomatis tersimpan di environment variable
```

### 2. Basic User Flow
```
1. Get All Diseases - lihat daftar penyakit
2. Get Disease by Slug - detail penyakit tertentu (GET /diseases/blast)
3. Create Detection - upload gambar daun padi (ganti path file)
4. Get All Detections - lihat riwayat deteksi
```

### 3. Expert System Flow
```
1. Get All Symptoms - lihat daftar gejala
2. Diagnose Disease - kirim symptom_ids untuk diagnosis
```

### 4. Admin Flow (requires admin/super_admin role)
```
1. Get Dashboard Stats - statistik dashboard
2. Get All Diseases (Admin) - CRUD diseases
3. Create/Update/Delete Disease
```

### 5. Super Admin Flow (requires super_admin role)
```
1. Get All Users - user management
2. Update/Delete User
```

## Notes

- Untuk **Create Detection**, ganti path file di `@file(/path/to/rice-leaf-image.jpg)` dengan path gambar yang valid
- Semua request (kecuali Register/Login) memerlukan authentication token
- Token akan expired sesuai konfigurasi Sanctum di Laravel
- Setiap request memiliki test assertions untuk validasi response

## Available Diseases (Slug List)

1. `blast` - Blast
2. `brown-spot` - Brown Spot
3. `tungro` - Tungro
4. `bacterial-leaf-blight` - Bacterial Leaf Blight (BLB)
5. `healthy` - Healthy
6. `hispa` - Hispa
7. `dead-heart` - Dead Heart
8. `downy-mildew` - Downy Mildew
9. `bacterial-leaf-streak` - Bacterial Leaf Streak
10. `bacterial-panicle-blight` - Bacterial Panicle Blight
11. `leaf-smut` - Leaf Smut

## Troubleshooting

- **401 Unauthorized**: Token expired atau tidak valid, login ulang
- **403 Forbidden**: User tidak memiliki role yang sesuai
- **404 Not Found**: Endpoint salah atau parameter tidak valid
- **422 Validation Error**: Periksa format request body
- **500 Server Error**: Periksa Laravel logs di `storage/logs/laravel.log`