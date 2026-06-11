# Mapan API - Bruno Collection

Bruno collection untuk testing API Mapan (Sistem Pakar Deteksi Penyakit Tanaman Padi).

## Setup

1. Install Bruno: https://www.usebruno.com/downloads
2. Open Bruno dan klik "Open Collection"
3. Pilih folder `bruno/Mapan_API`

## Environments

Collection ini memiliki 3 environment dengan **2 base URLs** (Public & Private):

### Local8000 (Frontend + API)
- `public_url`: http://localhost:8000/public/api/v1
- `private_url`: http://localhost:8000/private/api/v1
- Command: `php -S localhost:8000 -t public`

### Local6000 (API Only) - **Recommended for API Testing**
- `public_url`: http://localhost:6000/public/api/v1
- `private_url`: http://localhost:6000/private/api/v1
- Command: `php -S localhost:6000 -t public`

### Ngrok
- `public_url`: https://your-ngrok-url.ngrok-free.app/public/api/v1
- `private_url`: https://your-ngrok-url.ngrok-free.app/private/api/v1
- Ganti `your-ngrok-url` dengan URL ngrok Anda
- Aktifkan ngrok: `ngrok http 8000`

## 🔄 API Structure (Public vs Private)

API sekarang dipisah menjadi 2 prefix berbeda:

### `/public/api/v1/*` - Public Endpoints
- ✅ **No authentication required**
- Semua endpoint GET (read-only)
- Login & Register

### `/private/api/v1/*` - Private Endpoints
- 🔒 **Authentication required** (Bearer token)
- Semua endpoint POST/PUT/DELETE (write operations)
- User info & Logout
- Admin endpoints

## Authentication Flow

1. **Register** atau **Login** untuk mendapatkan token
2. Token akan otomatis disimpan ke environment variable `token`
3. Semua request POST/PUT/DELETE akan menggunakan token ini di header `Authorization: Bearer {token}`

## All Available Endpoints

### 🌐 Public Endpoints - `/public/api/v1/*` (No Auth Required)

#### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/public/api/v1/register` | Register new user |
| POST | `/public/api/v1/login` | Login to get token |

#### Knowledge Base (GET - Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/public/api/v1/diseases` | Get all diseases with symptoms & treatments |
| GET | `/public/api/v1/diseases/{slug}` | Get disease by slug |
| GET | `/public/api/v1/symptoms` | Get all symptoms |

#### Detections (GET - Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/public/api/v1/detections` | Get all detections |
| GET | `/public/api/v1/detections/{id}` | Get detection by ID |

---

### 🔒 Private Endpoints - `/private/api/v1/*` (Auth Required)

#### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/private/api/v1/user` | Get current user info |
| POST | `/private/api/v1/logout` | Logout and invalidate token |

#### Detections (POST/DELETE - Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/private/api/v1/detections` | Create new detection |
| POST | `/private/api/v1/detections/predict` | ML inference on image (server-side) |
| DELETE | `/private/api/v1/detections/{id}` | Delete detection |

#### Expert System (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/private/api/v1/expert-system/diagnose` | Diagnose disease by symptoms |
| POST | `/private/api/v1/expert-system` | Store expert system consultation |

---

### 👑 Admin Endpoints - `/private/api/v1/admin/*` (Role-Based)

#### System Dashboard
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/private/api/v1/admin/system/dashboard/stats` | Get dashboard statistics | admin/super_admin |

#### Knowledge Base: Diseases Management
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/private/api/v1/admin/knowledge-base/diseases` | Get all diseases for management | pakar/super_admin |
| POST | `/private/api/v1/admin/knowledge-base/diseases` | Create disease | pakar/super_admin |
| PUT | `/private/api/v1/admin/knowledge-base/diseases/{id}` | Update disease | pakar/super_admin |
| DELETE | `/private/api/v1/admin/knowledge-base/diseases/{id}` | Delete disease | pakar/super_admin |

#### Knowledge Base: Symptoms Management
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/private/api/v1/admin/knowledge-base/symptoms` | Get all symptoms for management | pakar/super_admin |
| POST | `/private/api/v1/admin/knowledge-base/symptoms` | Create symptom | pakar/super_admin |
| PUT | `/private/api/v1/admin/knowledge-base/symptoms/{id}` | Update symptom | pakar/super_admin |
| DELETE | `/private/api/v1/admin/knowledge-base/symptoms/{id}` | Delete symptom | pakar/super_admin |

#### Knowledge Base: Treatments Management
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/private/api/v1/admin/knowledge-base/treatments` | Get all treatments | pakar/super_admin |
| POST | `/private/api/v1/admin/knowledge-base/treatments` | Create treatment | pakar/super_admin |
| PUT | `/private/api/v1/admin/knowledge-base/treatments/{id}` | Update treatment | pakar/super_admin |
| DELETE | `/private/api/v1/admin/knowledge-base/treatments/{id}` | Delete treatment | pakar/super_admin |

#### Detections Management
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/private/api/v1/admin/detections` | Get all detections (admin view) | admin/pakar/super_admin |

#### User Management
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/private/api/v1/admin/system/users` | Get all users | super_admin |
| PUT | `/private/api/v1/admin/system/users/{id}` | Update user | super_admin |
| DELETE | `/private/api/v1/admin/system/users/{id}` | Delete user | super_admin |

---

## 📋 API Rules (Instruksi Dosen)

### ✅ Public (No Auth)
- **Semua endpoint GET** untuk mengambil data
- Login & Register

### 🔒 Protected (Auth Required)
- **Semua endpoint POST/PUT/DELETE** untuk modifikasi data
- User info & Logout

### 👑 Role-Based Admin Areas
- System dashboard: `admin` + `super_admin`
- Knowledge base CRUD (diseases, symptoms, treatments): `pakar` + `super_admin`
- User management: `super_admin` only
- All detections monitoring: `admin` + `pakar` + `super_admin`

---

## Collection Structure

```
bruno/Mapan_API/
├── bruno.json
├── environments/
│   ├── Local8000.bru (public_url + private_url)
│   ├── Local6000.bru (public_url + private_url)
│   └── Ngrok.bru (public_url + private_url)
├── Public/ (uses {{public_url}})
│   ├── Auth/
│   │   ├── Register.bru
│   │   └── Login.bru
│   ├── Diseases/
│   │   ├── Get All Diseases.bru
│   │   └── Get Disease by Slug.bru
│   ├── Symptoms/
│   │   └── Get All Symptoms.bru
│   └── Detections/
│       ├── Get All Detections.bru
│       └── Get Detection by ID.bru
└── Private/ (uses {{private_url}})
    ├── Auth/
    │   ├── Get Current User.bru
    │   └── Logout.bru
    ├── Detections/
    │   ├── Create Detection.bru
    │   ├── Predict Disease.bru
    │   └── Delete Detection.bru
    ├── Expert System/
    │   └── Diagnose Disease.bru
    └── Admin/
        ├── Get Dashboard Stats.bru
        ├── Disease CRUD (4 files)
        └── User Management (3 files)
```

---

## Example Usage

### Public Access (No Token) - `/public/api/v1/*`
```bash
# Get all diseases
curl http://localhost:6000/public/api/v1/diseases

# Get symptoms
curl http://localhost:6000/public/api/v1/symptoms

# Get detections
curl http://localhost:6000/public/api/v1/detections
```

### Protected Access (Need Token) - `/private/api/v1/*`
```bash
# Login first (public endpoint)
curl -X POST http://localhost:6000/public/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@mapan.test","password":"password"}'

# Use token for protected endpoints (private URL)
curl -X POST http://localhost:6000/private/api/v1/detections/predict \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@image.jpg"

# Get current user (private URL)
curl http://localhost:6000/private/api/v1/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Admin Access (Admin Token) - `/private/api/v1/admin/*`
```bash
# Get dashboard stats (admin or super_admin)
curl http://localhost:6000/private/api/v1/admin/system/dashboard/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
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
