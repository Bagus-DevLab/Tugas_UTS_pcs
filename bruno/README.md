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
3. Semua request POST/PUT/DELETE akan menggunakan token ini di header `Authorization: Bearer {token}`

## All Available Endpoints

### 🌐 Public Endpoints (No Auth Required)

#### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login to get token |

#### Knowledge Base (GET - Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/diseases` | Get all diseases with symptoms & treatments |
| GET | `/diseases/{slug}` | Get disease by slug |
| GET | `/symptoms` | Get all symptoms |

#### Detections (GET - Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/detections` | Get all detections |
| GET | `/detections/{id}` | Get detection by ID |

---

### 🔒 Protected Endpoints (Auth Required)

#### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user` | Get current user info |
| POST | `/logout` | Logout and invalidate token |

#### Detections (POST/DELETE - Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/detections` | Create new detection |
| POST | `/detections/predict` | ML inference on image (server-side) |
| DELETE | `/detections/{id}` | Delete detection |

#### Expert System (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/expert-system/diagnose` | Diagnose disease by symptoms |
| POST | `/expert-system` | Store expert system consultation |

---

### 👑 Admin Endpoints (Admin/Super Admin Only)

#### Dashboard
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/admin/dashboard/stats` | Get dashboard statistics | admin/super_admin |

#### Diseases Management
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/admin/diseases` | Get all diseases (admin) | admin/super_admin |
| POST | `/admin/diseases` | Create disease | admin/super_admin |
| PUT | `/admin/diseases/{id}` | Update disease | admin/super_admin |
| DELETE | `/admin/diseases/{id}` | Delete disease | admin/super_admin |

#### Symptoms Management
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/admin/symptoms` | Get all symptoms (admin) | admin/super_admin |
| POST | `/admin/symptoms` | Create symptom | admin/super_admin |
| PUT | `/admin/symptoms/{id}` | Update symptom | admin/super_admin |
| DELETE | `/admin/symptoms/{id}` | Delete symptom | admin/super_admin |

#### Treatments Management
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/admin/treatments` | Get all treatments | admin/super_admin |
| POST | `/admin/treatments` | Create treatment | admin/super_admin |
| PUT | `/admin/treatments/{id}` | Update treatment | admin/super_admin |
| DELETE | `/admin/treatments/{id}` | Delete treatment | admin/super_admin |

#### Detections Management
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/admin/detections` | Get all detections (admin view) | admin/super_admin |

#### User Management
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/admin/users` | Get all users | super_admin |
| PUT | `/admin/users/{id}` | Update user | super_admin |
| DELETE | `/admin/users/{id}` | Delete user | super_admin |

---

## 📋 API Rules (Instruksi Dosen)

### ✅ Public (No Auth)
- **Semua endpoint GET** untuk mengambil data
- Login & Register

### 🔒 Protected (Auth Required)
- **Semua endpoint POST/PUT/DELETE** untuk modifikasi data
- User info & Logout

### 👑 Admin Only
- Dashboard stats
- Management endpoints (CRUD diseases, symptoms, treatments)
- User management (super admin only)

---

## Collection Structure

```
bruno/Mapan_API/
├── bruno.json
├── environments/
│   ├── Local8000.bru
│   ├── Local6000.bru
│   └── Ngrok.bru
├── Auth/
│   ├── Register.bru
│   ├── Login.bru
│   ├── Get Current User.bru
│   └── Logout.bru
├── Detection/
│   ├── Get All Detections.bru (Public)
│   ├── Get Detection by ID.bru (Public)
│   ├── Create Detection.bru (Protected)
│   ├── Predict Disease.bru (Protected)
│   └── Delete Detection.bru (Protected)
├── Disease/
│   ├── Get All Diseases.bru (Public)
│   └── Get Disease by Slug.bru (Public)
├── Expert System/
│   ├── Get All Symptoms.bru (Public)
│   └── Diagnose Disease.bru (Protected)
└── Admin/
    ├── Get Dashboard Stats.bru (Admin)
    ├── Disease CRUD (Admin)
    ├── Symptom CRUD (Admin)
    ├── Treatment CRUD (Admin)
    └── User Management (Super Admin)
```

---

## Example Usage

### Public Access (No Token)
```bash
# Get all diseases
curl http://localhost:6000/public/api/v1/diseases

# Get symptoms
curl http://localhost:6000/public/api/v1/symptoms

# Get detections
curl http://localhost:6000/public/api/v1/detections
```

### Protected Access (Need Token)
```bash
# Login first
curl -X POST http://localhost:6000/public/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@mapan.test","password":"password"}'

# Use token for protected endpoints
curl -X POST http://localhost:6000/public/api/v1/detections/predict \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@image.jpg"
```

---

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

---

## Troubleshooting

- **401 Unauthorized**: Token expired atau tidak valid, login ulang
- **403 Forbidden**: User tidak memiliki role yang sesuai
- **404 Not Found**: Endpoint salah atau parameter tidak valid
- **422 Validation Error**: Periksa format request body
- **500 Server Error**: Periksa Laravel logs di `storage/logs/laravel.log`
