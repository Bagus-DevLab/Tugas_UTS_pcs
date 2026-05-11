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
composer test        # Backend: Pint lint + Pest tests (353 tests, 1046 assertions)
npm test             # Frontend: Vitest (38 tests)
npm run test:watch   # Frontend: watch mode
npm run types:check  # TypeScript strict mode (noUncheckedIndexedAccess enabled)
```

**Testing Discipline:** Always run `composer test` (backend) or `npm test` (frontend) before reporting task complete. All tests must pass.

### Linting & Formatting
```bash
composer lint        # PHP: Laravel Pint (auto-fix)
npm run lint         # JS/TS: ESLint (auto-fix)
npm run format       # Prettier (auto-fix)
```

Check-only variants: `composer lint:check`, `npm run lint:check`, `npm run format:check`

---

## API Architecture

**Dual-prefix structure** (see `routes/api.php`):
- `/public/api/v1/*` - No auth required (GET endpoints, login, register)
- `/private/api/v1/*` - Auth required (POST/PUT/DELETE, admin routes)

**Critical:** `bootstrap/app.php` sets `apiPrefix: ''` (empty). Full paths defined in routes file.

**Frontend API Rule:** When modifying React/TypeScript files in `resources/js/`, absolutely ensure all `fetch()` or `axios` calls follow the split: GET requests MUST use `/public/api/v1/`, while POST/PUT/DELETE requests MUST use `/private/api/v1/` and include the Authorization header. Admin endpoints MUST use `/private/api/v1/admin/`.

### Route Verification
```bash
php artisan route:list --path=public/api   # 7 public routes
php artisan route:list --path=private/api  # 24 private routes
```

---

## Project Structure

- **Backend:** Laravel 13, PHP 8.3, SQLite
- **Frontend:** React 19, TypeScript, Inertia.js v3, Tailwind CSS v4
- **ML:** ONNX Runtime Web (browser-side), Python training in `ml/`
- **Auth:** Laravel Sanctum (Bearer tokens), Fortify (2FA)
- **Roles:** 4-tier system (super_admin, admin, pakar, user) via `CheckRole` middleware
  - `super_admin` - Full system access (including user management)
  - `admin` - IT/System operations (system dashboard, view all detections)
  - `pakar` - Domain expert pertanian (diseases, symptoms, treatments management)
  - `user` - End user/petani

### Key Files

- `routes/api.php` - Dual-prefix API routes (public/private split)
  - `/private/api/v1/admin/knowledge-base/*` - Pakar domain (diseases, symptoms, treatments)
  - `/private/api/v1/admin/system/*` - Admin domain (users, system dashboard)
- `routes/web.php` - Inertia routes with same domain split
- `app/Models/User.php` - Role constants and permission helpers:
  - `canManageKnowledgeBase()` - pakar + super_admin
  - `canManageSystem()` - admin + super_admin
  - `canManageUsers()` - super_admin only
  - `canViewAllDetections()` - admin + pakar + super_admin
- `app/Http/Middleware/HandleInertiaRequests.php` - Shares `auth.user.permissions` to frontend
- `resources/js/components/app-sidebar.tsx` - Dynamic sidebar based on permissions

### Test Users (password: "password")
```
user@mapan.test       - user role
pakar@mapan.test      - pakar role
admin@mapan.test      - admin role
superadmin@mapan.test - super_admin role
```

---

## Environment Setup

```bash
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed  # Creates SQLite DB + test users
php artisan storage:link
npm install
```

**Required:** `OPENWEATHERMAP_API_KEY` in `.env` (proxied via backend, not exposed to frontend)

---

## TypeScript Strict Mode

**Enabled options:**
- `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noUncheckedIndexedAccess`

**Common patterns:**
- Use `!` non-null assertion in tests where values are guaranteed
- Use `?.` optional chaining for potentially undefined properties
- Use `?? defaultValue` for null coalescing
- Use `cssVars()` utility from `lib/utils.ts` for CSS custom properties (eliminates `@ts-expect-error`)

**46 pre-existing framer-motion type errors** (TS2322) are known and acceptable. Only fix new errors introduced by your changes.

---

## Security & Authorization

### Mass Assignment Protection
- `User` model: `role` is NOT in `$fillable` (must be set explicitly via `$user->role = ...`)
- All other models: use `$fillable` whitelist, never `$guarded = []`

### Role-Based Access
- **User Management** (`/admin/system/users`) - super_admin only
- **Knowledge Base** (`/admin/knowledge-base/*`) - pakar + super_admin
- **System Dashboard** (`/admin/system/*`) - admin + super_admin
- **All Detections** (`/admin/detections`) - admin + pakar + super_admin

### Command Injection Prevention
- Use `Symfony\Component\Process\Process` instead of `shell_exec()` or `exec()`
- Always wrap file operations in `try/finally` for cleanup

---

## SEO Implementation (Phase 1 Complete)

**Dynamic Meta Tags:**
- All public pages use Inertia `<Head>` component with title, description, keywords, OG tags
- Meta data passed from controllers via `meta` array in Inertia props
- Canonical tags on all pages using `APP_URL` from env

**Sitemap:**
- Generated via `php artisan sitemap:generate` (spatie/laravel-sitemap)
- Includes: `/`, `/diseases`, `/expert-system`, `/detection`, and all 11 disease detail pages
- Scheduled daily regeneration in `app/Console/Kernel.php`
- Located at `public/sitemap.xml`

**robots.txt:**
- Allows all except `/admin`, `/dashboard`, `/detection/history`, `/api/`
- References sitemap URL

**Priority Pages:**
- Blast, Brown Spot, Tungro (priority 0.9)
- Other diseases (priority 0.8)

---

## Common Gotchas

1. **Port 6000 blocked by Chrome** - Use 8000, 3000, or Firefox
2. **API prefix is empty** - Routes define full paths (`/public/api/v1/*`, `/private/api/v1/*`)
3. **SQLite database** - `database/database.sqlite` created by migrations
4. **Role-based routes** - Knowledge base routes require `pakar` or `super_admin`. System routes require `admin` or `super_admin`. User management requires `super_admin` only.
5. **Domain separation** - Pakar manages diseases/symptoms/treatments. Admin manages users/system. Both can view all detections.
6. **TypeScript errors** - 46 framer-motion errors are pre-existing. Only fix new errors.
7. **Meta tags** - Always pass `meta` array from controller when rendering Inertia pages for SEO
8. **Sitemap regeneration** - Run `php artisan sitemap:generate` after adding/updating diseases

---

## Documentation

- `docs/MEMORY.md` - Recent changes and refactoring notes
- `docs/TESTING.md` - Comprehensive testing strategy (EP, BVA, DTT, Sampling)
- `docs/MIGRATION_GUIDE.md` - Frontend API URL migration guide
- `docs/FRONTEND_DESIGN.md` - React component architecture
- `docs/MOBILE_ACCESS_STRUCTURE.md` - Responsive design patterns

---

## Agent SOPs (Standard Operating Procedures)

### Before Committing
1. Run `composer test` (backend) or `npm test` (frontend)
2. Run `npm run types:check` if TypeScript files changed
3. Verify no new TypeScript errors introduced (46 framer-motion errors are acceptable)

### Memory Update
After implementing features, refactoring, or changing URL endpoints, update `docs/MEMORY.md`.

### Strict Typings
- Use TypeScript strict mode (no `any` types)
- Use Laravel Form Requests for all POST/PUT validation
- Use `!` for guaranteed values, `?.` for optional chaining, `??` for defaults
