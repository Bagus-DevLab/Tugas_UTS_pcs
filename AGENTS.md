# Agent Instructions

## Development Commands

### Start Development
```bash
composer dev  # Starts all: server (8000), queue, logs, vite
```
This runs 4 concurrent processes. If you need individual control:
```bash
php artisan serve --port=8000  # Backend only
npm run dev                     # Frontend only (Vite on 5173)
```

**Port 6000 is blocked by Chrome** (ERR_UNSAFE_PORT). Use port 8000, 3000, or 9000 for API testing in browser.

### Testing
```bash
composer test        # Backend: Pint lint + Pest tests
npm test             # Frontend: Vitest
npm run test:watch   # Frontend: watch mode
```

### Linting & Formatting
```bash
composer lint        # PHP: Laravel Pint (auto-fix)
npm run lint         # JS/TS: ESLint (auto-fix)
npm run format       # Prettier (auto-fix)
```

Check-only variants: `composer lint:check`, `npm run lint:check`, `npm run format:check`

### Type Checking
```bash
npm run types:check  # TypeScript (no emit)
```

## API Architecture

**Dual-prefix structure** (see `routes/api.php`):
- `/public/api/v1/*` - No auth required (GET endpoints, login, register)
- `/private/api/v1/*` - Auth required (POST/PUT/DELETE, admin routes)

**Critical:** `bootstrap/app.php` sets `apiPrefix: ''` (empty). Full paths defined in routes file.

**Frontend API Rule:** When modifying React/TypeScript files in `resources/js/`, absolutely ensure all `fetch()` or `axios` calls follow the split: GET requests MUST use `/public/api/v1/`, while POST/PUT/DELETE requests MUST use `/private/api/v1/` and include the Authorization header. Admin endpoints MUST use `/private/api/v1/admin/`.

### Testing API
- **Bruno collection:** `bruno/Mapan_API/` (organized as Public/ and Private/ folders)
- **Environments:** Local8000, Local6000 (blocked in Chrome), Ngrok
- **Migration guide:** `docs/MIGRATION_GUIDE.md` for frontend URL changes

### Route Verification
```bash
php artisan route:list --path=public/api   # 7 public routes
php artisan route:list --path=private/api  # 24 private routes
```

## Project Structure

- **Backend:** Laravel 13, PHP 8.3, SQLite
- **Frontend:** React 19, TypeScript, Inertia.js, Tailwind CSS v4
- **ML:** ONNX Runtime Web (browser-side), Python training in `ml/`
- **Auth:** Laravel Sanctum (Bearer tokens), Fortify (2FA)
- **Roles:** 4-tier system (super_admin, admin, pakar, user) via `CheckRole` middleware
  - `super_admin` - Full system access
  - `admin` - IT/System operations (user management, system dashboard)
  - `pakar` - Domain expert pertanian (diseases, symptoms, treatments management)
  - `user` - End user/petani

## Key Files

- `routes/api.php` - Dual-prefix API routes (public/private split)
  - `/private/api/v1/admin/knowledge-base/*` - Pakar domain (diseases, symptoms, treatments)
  - `/private/api/v1/admin/system/*` - Admin domain (users, system dashboard)
- `routes/web.php` - Inertia routes with same domain split
- `bootstrap/app.php` - Empty apiPrefix, custom middleware aliases
- `app/Http/Middleware/CheckRole.php` - Role-based authorization
- `app/Models/User.php` - Role constants and permission helpers
- `database/seeders/DatabaseSeeder.php` - Creates 4 test users (all password: "password")
  - user@mapan.test (user)
  - pakar@mapan.test (pakar)
  - admin@mapan.test (admin)
  - superadmin@mapan.test (super_admin)

## Environment Setup

```bash
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed  # Creates SQLite DB + test users
php artisan storage:link
npm install
```

**Required:** `OPENWEATHERMAP_API_KEY` in `.env` (proxied via backend, not exposed to frontend)

## CI/CD

GitHub Actions runs on `develop`, `main`, `master`, `workos` branches:
- Backend: PHP 8.3, 8.4, 8.5 matrix, runs Pest tests
- Frontend: Node 22, runs Vitest

## Python ML Training

```bash
cd ml
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python train.py
```

Model output: `public/models/model.onnx` (used by ONNX Runtime Web in browser)

## Common Gotchas

1. **Port 6000 blocked by Chrome** - Use 8000, 3000, or Firefox
2. **API prefix is empty** - Routes define full paths (`/public/api/v1/*`, `/private/api/v1/*`)
3. **Bruno collection updated** - Old structure deprecated, use Public/Private folders
4. **Frontend migration needed** - POST/PUT/DELETE changed from `/public` to `/private` (see `docs/MIGRATION_GUIDE.md`)
5. **SQLite database** - `database/database.sqlite` created by migrations
6. **Test users seeded** - 4 users with different roles (all password: "password")
   - user@mapan.test (user)
   - pakar@mapan.test (pakar)
   - admin@mapan.test (admin)
   - superadmin@mapan.test (super_admin)
7. **Role-based routes** - Knowledge base routes (`/admin/knowledge-base/*`) require `pakar` or `super_admin` role. System routes (`/admin/system/*`) require `admin` or `super_admin` role.
8. **Domain separation** - Pakar manages diseases/symptoms/treatments. Admin manages users/system. Both can view all detections.

## Session Context

See `docs/MEMORY.md` for recent API refactoring work (public/private split completed, 100% tested).

---

## Agent SOPs (Standard Operating Procedures)

### Memory Update
Setiap selesai mengimplementasikan fitur baru, melakukan refactor, atau mengubah URL endpoint di frontend, kamu WAJIB mencatat perubahannya di `docs/MEMORY.md`.

### Testing Discipline
Sebelum melaporkan sebuah task selesai, selalu jalankan `composer test` untuk backend atau `npm run test` untuk frontend untuk memastikan tidak ada code yang breaking.

### Strict Typings
Karena project menggunakan TypeScript dan PHP 8.3, selalu gunakan strict typings. Gunakan Form Requests Laravel untuk semua validasi POST/PUT.
