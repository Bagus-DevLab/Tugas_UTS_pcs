# 🔄 API Migration Guide - Public/Private Split

## Overview

API telah direfactor menjadi 2 prefix berbeda untuk memisahkan endpoint public dan private:

- **`/public/api/v1/*`** - Public endpoints (no authentication)
- **`/private/api/v1/*`** - Private endpoints (authentication required)

## 📋 What Changed

### Backend Changes (✅ Already Done)

1. **Routes Structure** (`routes/api.php`)
   - Semua endpoint GET (read-only) → `/public/api/v1/*`
   - Semua endpoint POST/PUT/DELETE (write operations) → `/private/api/v1/*`
   - Admin endpoints → `/private/api/v1/admin/*`

2. **Bootstrap Configuration** (`bootstrap/app.php`)
   - `apiPrefix` diubah menjadi empty string
   - Full path sekarang didefinisikan di `routes/api.php`

3. **Bruno Collection** (`bruno/Mapan_API/`)
   - Reorganisasi folder: `Public/` dan `Private/`
   - Environment variables: `public_url` dan `private_url`
   - 21 file .bru telah diupdate

---

## 🚨 Breaking Changes for Frontend

### URL Changes

Semua endpoint POST/PUT/DELETE sekarang menggunakan `/private/api/v1/*` prefix.

#### ❌ OLD URLs (No Longer Work)
```javascript
// POST/PUT/DELETE menggunakan /public
fetch('/public/api/v1/detections', { method: 'POST', ... })
fetch('/public/api/v1/detections/predict', { method: 'POST', ... })
fetch('/public/api/v1/admin/dashboard/stats', { ... })
```

#### ✅ NEW URLs (Must Update To)
```javascript
// POST/PUT/DELETE menggunakan /private
fetch('/private/api/v1/detections', { method: 'POST', ... })
fetch('/private/api/v1/detections/predict', { method: 'POST', ... })
fetch('/private/api/v1/admin/dashboard/stats', { ... })

// GET tetap menggunakan /public (tidak berubah)
fetch('/public/api/v1/diseases', { method: 'GET', ... })
fetch('/public/api/v1/symptoms', { method: 'GET', ... })
```

---

## 📝 Frontend Migration Checklist

### Step 1: Find All API Calls

Search for API calls in your frontend code:

```bash
# Search for all API calls
grep -r "public/api/v1" resources/js/
grep -r "fetch(" resources/js/
grep -r "axios" resources/js/
```

### Step 2: Update URLs Based on HTTP Method

#### Rule of Thumb:
- **GET requests** → Keep `/public/api/v1/*` (no change)
- **POST/PUT/DELETE requests** → Change to `/private/api/v1/*`
- **Admin endpoints** → Change to `/private/api/v1/admin/*`

### Step 3: Endpoint-by-Endpoint Migration

#### 🔓 Auth Endpoints

| Endpoint | Old URL | New URL | Method |
|----------|---------|---------|--------|
| Login | `/public/api/v1/login` | ✅ No change | POST |
| Register | `/public/api/v1/register` | ✅ No change | POST |
| Get User | `/public/api/v1/user` | `/private/api/v1/user` | GET |
| Logout | `/public/api/v1/logout` | `/private/api/v1/logout` | POST |

**Example:**
```javascript
// ❌ OLD
fetch('/public/api/v1/user', {
  headers: { 'Authorization': `Bearer ${token}` }
})

// ✅ NEW
fetch('/private/api/v1/user', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

---

#### 🌾 Diseases Endpoints

| Endpoint | Old URL | New URL | Method |
|----------|---------|---------|--------|
| Get All | `/public/api/v1/diseases` | ✅ No change | GET |
| Get by Slug | `/public/api/v1/diseases/{slug}` | ✅ No change | GET |

**No changes needed** - All diseases endpoints are GET requests.

---

#### 🔬 Detections Endpoints

| Endpoint | Old URL | New URL | Method |
|----------|---------|---------|--------|
| Get All | `/public/api/v1/detections` | ✅ No change | GET |
| Get by ID | `/public/api/v1/detections/{id}` | ✅ No change | GET |
| Create | `/public/api/v1/detections` | `/private/api/v1/detections` | POST |
| Predict | `/public/api/v1/detections/predict` | `/private/api/v1/detections/predict` | POST |
| Delete | `/public/api/v1/detections/{id}` | `/private/api/v1/detections/{id}` | DELETE |

**Example:**
```javascript
// ❌ OLD
fetch('/public/api/v1/detections/predict', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
})

// ✅ NEW
fetch('/private/api/v1/detections/predict', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
})
```

---

#### 🧠 Expert System Endpoints

| Endpoint | Old URL | New URL | Method |
|----------|---------|---------|--------|
| Get Symptoms | `/public/api/v1/symptoms` | ✅ No change | GET |
| Diagnose | `/public/api/v1/expert-system/diagnose` | `/private/api/v1/expert-system/diagnose` | POST |
| Store | `/public/api/v1/expert-system` | `/private/api/v1/expert-system` | POST |

**Example:**
```javascript
// ❌ OLD
fetch('/public/api/v1/expert-system/diagnose', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ symptoms: [1, 2, 3] })
})

// ✅ NEW
fetch('/private/api/v1/expert-system/diagnose', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ symptoms: [1, 2, 3] })
})
```

---

#### 👑 Admin Endpoints

**All admin endpoints** now use `/private/api/v1/admin/*`

| Endpoint | Old URL | New URL | Method |
|----------|---------|---------|--------|
| Dashboard Stats | `/public/api/v1/admin/dashboard/stats` | `/private/api/v1/admin/dashboard/stats` | GET |
| Get Diseases | `/public/api/v1/admin/diseases` | `/private/api/v1/admin/diseases` | GET |
| Create Disease | `/public/api/v1/admin/diseases` | `/private/api/v1/admin/diseases` | POST |
| Update Disease | `/public/api/v1/admin/diseases/{id}` | `/private/api/v1/admin/diseases/{id}` | PUT |
| Delete Disease | `/public/api/v1/admin/diseases/{id}` | `/private/api/v1/admin/diseases/{id}` | DELETE |
| Get Symptoms | `/public/api/v1/admin/symptoms` | `/private/api/v1/admin/symptoms` | GET |
| Create Symptom | `/public/api/v1/admin/symptoms` | `/private/api/v1/admin/symptoms` | POST |
| Update Symptom | `/public/api/v1/admin/symptoms/{id}` | `/private/api/v1/admin/symptoms/{id}` | PUT |
| Delete Symptom | `/public/api/v1/admin/symptoms/{id}` | `/private/api/v1/admin/symptoms/{id}` | DELETE |
| Get Treatments | `/public/api/v1/admin/treatments` | `/private/api/v1/admin/treatments` | GET |
| Create Treatment | `/public/api/v1/admin/treatments` | `/private/api/v1/admin/treatments` | POST |
| Update Treatment | `/public/api/v1/admin/treatments/{id}` | `/private/api/v1/admin/treatments/{id}` | PUT |
| Delete Treatment | `/public/api/v1/admin/treatments/{id}` | `/private/api/v1/admin/treatments/{id}` | DELETE |
| Get Users | `/public/api/v1/admin/users` | `/private/api/v1/admin/users` | GET |
| Update User | `/public/api/v1/admin/users/{id}` | `/private/api/v1/admin/users/{id}` | PUT |
| Delete User | `/public/api/v1/admin/users/{id}` | `/private/api/v1/admin/users/{id}` | DELETE |

**Example:**
```javascript
// ❌ OLD
fetch('/public/api/v1/admin/dashboard/stats', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
})

// ✅ NEW
fetch('/private/api/v1/admin/dashboard/stats', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
})
```

---

## 🔧 Implementation Strategies

### Strategy 1: Global Search & Replace (Recommended)

Use your IDE's search & replace feature:

1. **Search for:** `/public/api/v1/detections/predict`
   **Replace with:** `/private/api/v1/detections/predict`

2. **Search for:** `/public/api/v1/detections` (POST/DELETE only)
   **Replace with:** `/private/api/v1/detections`

3. **Search for:** `/public/api/v1/admin/`
   **Replace with:** `/private/api/v1/admin/`

4. **Search for:** `/public/api/v1/expert-system`
   **Replace with:** `/private/api/v1/expert-system`

5. **Search for:** `/public/api/v1/user`
   **Replace with:** `/private/api/v1/user`

6. **Search for:** `/public/api/v1/logout`
   **Replace with:** `/private/api/v1/logout`

### Strategy 2: Create API Helper Function

Create a helper function to automatically determine the correct base URL:

```javascript
// utils/api.js
export function getApiUrl(endpoint, method = 'GET') {
  const publicEndpoints = [
    '/login',
    '/register',
    '/diseases',
    '/symptoms',
    '/detections' // GET only
  ];
  
  // Check if endpoint is public
  const isPublic = method === 'GET' && publicEndpoints.some(e => endpoint.startsWith(e));
  
  const baseUrl = isPublic ? '/public/api/v1' : '/private/api/v1';
  return `${baseUrl}${endpoint}`;
}

// Usage
fetch(getApiUrl('/detections/predict', 'POST'), {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
})
```

### Strategy 3: Update Axios/Fetch Wrapper

If you're using a custom API wrapper:

```javascript
// api/client.js
const API_BASE = {
  public: '/public/api/v1',
  private: '/private/api/v1'
};

export const api = {
  get: (endpoint, isPrivate = false) => {
    const base = isPrivate ? API_BASE.private : API_BASE.public;
    return fetch(`${base}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
  },
  
  post: (endpoint, data) => {
    // POST always uses private
    return fetch(`${API_BASE.private}${endpoint}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  },
  
  // ... put, delete methods
};

// Usage
api.get('/diseases'); // Uses public
api.post('/detections/predict', formData); // Uses private
```

---

## ✅ Testing Your Changes

### 1. Test Public Endpoints (No Auth)
```bash
# Should work without token
curl http://localhost:6000/public/api/v1/diseases
curl http://localhost:6000/public/api/v1/symptoms
```

### 2. Test Private Endpoints (With Auth)
```bash
# Should fail without token (401)
curl http://localhost:6000/private/api/v1/detections -X POST

# Should work with token
curl http://localhost:6000/private/api/v1/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Admin Endpoints
```bash
# Should fail with user token (403)
curl http://localhost:6000/private/api/v1/admin/dashboard/stats \
  -H "Authorization: Bearer USER_TOKEN"

# Should work with admin token
curl http://localhost:6000/private/api/v1/admin/dashboard/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🐛 Common Issues & Solutions

### Issue 1: 404 Not Found
**Cause:** Using old URL structure  
**Solution:** Check if you're using `/public` for POST/PUT/DELETE requests

### Issue 2: 401 Unauthorized
**Cause:** Missing or invalid token  
**Solution:** Ensure token is included in Authorization header

### Issue 3: 403 Forbidden
**Cause:** User doesn't have required role  
**Solution:** Check user role (admin endpoints require admin/super_admin role)

### Issue 4: CORS Errors
**Cause:** Frontend and backend on different ports  
**Solution:** Ensure CORS is properly configured in `bootstrap/app.php`

---

## 📊 Summary Table

| Category | GET (Read) | POST/PUT/DELETE (Write) |
|----------|------------|-------------------------|
| Auth (Login/Register) | `/public/api/v1/*` | `/public/api/v1/*` |
| Auth (User/Logout) | `/private/api/v1/*` | `/private/api/v1/*` |
| Diseases | `/public/api/v1/*` | N/A |
| Symptoms | `/public/api/v1/*` | N/A |
| Detections (List) | `/public/api/v1/*` | N/A |
| Detections (Create/Predict/Delete) | N/A | `/private/api/v1/*` |
| Expert System | `/public/api/v1/*` (symptoms) | `/private/api/v1/*` (diagnose) |
| Admin | `/private/api/v1/admin/*` | `/private/api/v1/admin/*` |

---

## 📞 Need Help?

If you encounter issues during migration:

1. Check Laravel logs: `storage/logs/laravel.log`
2. Verify routes: `php artisan route:list`
3. Test with Bruno collection (already updated)
4. Check network tab in browser DevTools

---

## 🎯 Migration Completion Checklist

- [ ] Search for all `/public/api/v1` references in frontend code
- [ ] Update POST/PUT/DELETE endpoints to `/private/api/v1`
- [ ] Update admin endpoints to `/private/api/v1/admin`
- [ ] Test login flow
- [ ] Test detection creation/prediction
- [ ] Test admin dashboard (if applicable)
- [ ] Test expert system diagnosis
- [ ] Verify all API calls work correctly
- [ ] Update any API documentation in your frontend
- [ ] Clear browser cache and test again

---

**Last Updated:** 2026-04-30  
**API Version:** v1  
**Breaking Changes:** Yes (URL structure changed)

---

## 🔐 Role System Changes (2026-05-03)

### What Changed

Role system expanded from 3-tier to 4-tier with domain separation:

**Old Roles (3-tier):**
- `super_admin` - Full access
- `admin` - IT + Medical management
- `user` - End user

**New Roles (4-tier):**
- `super_admin` - Full system access
- `admin` - IT/System operations (user management, system dashboard)
- `pakar` - Domain expert pertanian (diseases, symptoms, treatments management)
- `user` - End user/petani

### API URL Changes

Admin endpoints split by domain:

#### Knowledge Base (Pakar Domain)
```javascript
// OLD
fetch('/private/api/v1/admin/diseases')
fetch('/private/api/v1/admin/symptoms')
fetch('/private/api/v1/admin/treatments')

// NEW
fetch('/private/api/v1/admin/knowledge-base/diseases')
fetch('/private/api/v1/admin/knowledge-base/symptoms')
fetch('/private/api/v1/admin/knowledge-base/treatments')
```

#### System Management (Admin Domain)
```javascript
// OLD
fetch('/private/api/v1/admin/dashboard/stats')
fetch('/private/api/v1/admin/users')

// NEW
fetch('/private/api/v1/admin/system/dashboard/stats')
fetch('/private/api/v1/admin/system/users')
```

#### Shared Admin (Unchanged)
```javascript
// No change
fetch('/private/api/v1/admin/detections')
```

### Frontend Changes

#### 1. Inertia Shared Props

New permission flags available in `auth.user.permissions`:

```typescript
// OLD
{auth.user.role === 'admin' && <AdminMenu />}

// NEW
{auth.user.permissions.canManageKnowledgeBase && <KnowledgeBaseMenu />}
{auth.user.permissions.canManageSystem && <SystemMenu />}
{auth.user.permissions.canViewAllDetections && <DetectionsMenu />}
```

#### 2. Route Names

Web route names updated:

```typescript
// OLD
route('admin.diseases.index')
route('admin.symptoms.index')
route('admin.treatments.index')
route('admin.users.index')

// NEW
route('admin.knowledge-base.diseases.index')
route('admin.knowledge-base.symptoms.index')
route('admin.knowledge-base.treatments.index')
route('admin.system.users.index')
```

#### 3. TypeScript Types

User type now includes role and permissions:

```typescript
type User = {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'pakar' | 'user'; // NEW
  permissions: {                                      // NEW
    canManageKnowledgeBase: boolean;
    canManageSystem: boolean;
    canViewAllDetections: boolean;
  };
  // ... other fields
};
```

### Migration Steps

1. **Update API Calls**
   ```bash
   # Search for old admin URLs
   grep -r "/admin/diseases\|/admin/symptoms\|/admin/treatments" resources/js/
   
   # Replace with new knowledge-base URLs
   # /admin/diseases → /admin/knowledge-base/diseases
   # /admin/symptoms → /admin/knowledge-base/symptoms
   # /admin/treatments → /admin/knowledge-base/treatments
   ```

2. **Update Permission Checks**
   ```typescript
   // Replace role checks with permission checks
   // OLD: auth.user.role === 'admin'
   // NEW: auth.user.permissions.canManageKnowledgeBase
   ```

3. **Update Route Helpers**
   ```bash
   # Regenerate Wayfinder routes
   php artisan wayfinder:generate
   ```

4. **Test All Roles**
   - Login as `pakar@mapan.test` → Should access knowledge base only
   - Login as `admin@mapan.test` → Should access system management only
   - Login as `superadmin@mapan.test` → Should access everything

### Test Users

All test users have password: `"password"`

| Email | Role | Access |
|-------|------|--------|
| `user@mapan.test` | user | Basic features only |
| `pakar@mapan.test` | pakar | Knowledge base management |
| `admin@mapan.test` | admin | System management |
| `superadmin@mapan.test` | super_admin | Full access |

### Breaking Changes

⚠️ **Admin role no longer has access to knowledge base management**

If you have existing admin users who need to manage diseases/symptoms/treatments, you need to:
1. Change their role to `pakar`, OR
2. Create a new user with `pakar` role for them

---

**Last Updated:** 2026-05-03  
**RBAC Version:** 4-tier (super_admin, admin, pakar, user)
