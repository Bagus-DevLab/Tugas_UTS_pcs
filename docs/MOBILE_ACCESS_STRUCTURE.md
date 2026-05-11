# Mobile Access & Role-Based Structure

**Last Updated:** May 6, 2026

---

## Role-Based Access (Sama di Mobile & Desktop)

Frontend **TIDAK membatasi role hanya untuk mobile**. Semua role dapat akses dengan responsive layout di mobile:

### Struktur 4 Tier Role

```
user                 pakar                admin              super_admin
(User/Petani)        (Domain Expert)      (IT Operations)    (Full Access)
    ↓                    ↓                    ↓                  ↓
├─ Dashboard         ├─ Dashboard         ├─ Dashboard       ├─ Semua fitur
├─ Deteksi           ├─ Deteksi           ├─ Deteksi
├─ Sistem Pakar      ├─ Sistem Pakar      ├─ Sistem Pakar
├─ Knowledge Base    ├─ Knowledge Base    ├─ Knowledge Base
├─ Riwayat Deteksi   ├─ Riwayat Deteksi   ├─ Riwayat Deteksi
                     ├─ Kelola Penyakit*  ├─ Kelola Penyakit*
                     ├─ Kelola Gejala*    ├─ Kelola Gejala*
                     ├─ Kelola Penanganan*├─ Kelola Penanganan*
                     ├─ Semua Deteksi*    ├─ Kelola User*
                                          ├─ Semua Deteksi*
```

*`*` = Menu items yang hanya ditampilkan untuk role yang memiliki permission

---

## Responsive Layout (Mobile & Desktop Sama)

### 1. Mobile Detection Hook (`use-mobile.tsx`)

```typescript
const MOBILE_BREAKPOINT = 768  // < 768px = mobile
```

Hanya untuk **layout responsiveness**, bukan untuk role filtering:

```
768px breakpoint
│
├─ < 768px (Mobile/Tablet)
│  └─ Sidebar: Collapsible dengan sheet overlay
│  └─ Header: Mobile-friendly dengan hamburger menu
│
└─ ≥ 768px (Desktop)
   └─ Sidebar: Expanded by default
   └─ Header: Full navigation visible
```

---

## Navigation Structure (Mobile & Desktop)

### AppSidebar - Rendered Sama di Semua Devices

```typescript
// Dari app-sidebar.tsx

// 1. Main items (untuk semua user)
const mainNavItems = [
    { title: 'Dashboard', href: '/', icon: LayoutGrid },
    { title: 'Deteksi Penyakit', href: '/detection', icon: ScanLine },
    { title: 'Sistem Pakar', href: '/expert-system', icon: BrainCircuit },
    { title: 'Knowledge Base', href: '/diseases', icon: BookOpen },
    { title: 'Riwayat Deteksi', href: '/detection/history', icon: History },
]

// 2. Conditional sections based on PERMISSIONS (tidak ada role filtering khusus mobile)
if (user.permissions.canManageKnowledgeBase) {  // pakar + super_admin
    ├─ Kelola Penyakit
    ├─ Kelola Gejala
    └─ Kelola Penanganan
}

if (user.permissions.canManageSystem) {  // admin + super_admin
    └─ Kelola User
}

if (user.permissions.canViewAllDetections) {  // pakar + admin + super_admin
    └─ Semua Deteksi
}
```

---

## Access Control Flow

```
User Login
    ↓
Backend validates role & permissions
    ↓
Props sent via Inertia: { auth: { user: { role, permissions } } }
    ↓
Frontend renders navigation based on permissions
    ↓
Same navigation items untuk mobile & desktop
    ↓
Layout adjusts (sidebar collapse di mobile, sheet overlay, etc)
```

---

## Mobile Layout Details

### Header on Mobile (`app-header.tsx`)

```typescript
// Mobile-specific UI
<div className="lg:hidden">
    <Sheet>  {/* Hamburger menu as sheet overlay */}
        <SheetTrigger>
            <Menu />
        </SheetTrigger>
        <SheetContent>
            {/* Full navigation in overlay */}
        </SheetContent>
    </Sheet>
</div>

// Desktop
<div className="hidden lg:flex">
    {/* Full navigation visible */}
</div>
```

### Sidebar on Mobile

```typescript
<Sidebar 
    collapsible="icon"  // Collapses to icons on mobile
    variant="inset"     // Inset style
>
    {/* Same navigation items as desktop */}
</Sidebar>
```

---

## Access Matrix

| Feature | user | pakar | admin | super_admin | Device |
|---------|------|-------|-------|------------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | Mobile & Desktop |
| Deteksi Penyakit | ✅ | ✅ | ✅ | ✅ | Mobile & Desktop |
| Sistem Pakar | ✅ | ✅ | ✅ | ✅ | Mobile & Desktop |
| Knowledge Base | ✅ | ✅ | ✅ | ✅ | Mobile & Desktop |
| Riwayat Deteksi | ✅ | ✅ | ✅ | ✅ | Mobile & Desktop |
| **Kelola Penyakit** | ❌ | ✅ | ❌ | ✅ | Mobile & Desktop |
| **Kelola Gejala** | ❌ | ✅ | ❌ | ✅ | Mobile & Desktop |
| **Kelola Penanganan** | ❌ | ✅ | ❌ | ✅ | Mobile & Desktop |
| **Kelola User** | ❌ | ❌ | ✅ | ✅ | Mobile & Desktop |
| **Semua Deteksi** | ❌ | ✅ | ✅ | ✅ | Mobile & Desktop |

---

## Frontend Role Authorization (No Mobile Restriction)

### Sidebar Permission Check

```typescript
// app-sidebar.tsx

const user = auth.user as {
    role: string
    permissions: {
        canManageKnowledgeBase: boolean  // pakar, super_admin
        canManageSystem: boolean          // admin, super_admin
        canViewAllDetections: boolean     // pakar, admin, super_admin
    }
} | null

// Same logic untuk mobile dan desktop
canManageKnowledgeBase && <AdminNav items={knowledgeBaseNavItems} />
canManageSystem && <AdminNav items={systemNavItems} />
canViewAllDetections && <AdminNav items={sharedAdminNavItems} />
```

### Backend Protection

```php
// routes/api.php - Backend juga check role

Route::middleware(['auth:sanctum', 'role:pakar,super_admin'])
    ->group(function () {
        Route::post('/admin/knowledge-base/diseases', ...);
    });

Route::middleware(['auth:sanctum', 'role:admin,super_admin'])
    ->group(function () {
        Route::post('/admin/system/users', ...);
    });
```

---

## Mobile-Specific UI Components

### AppShell Variant

```typescript
export function AppShell({ children, variant = 'sidebar' }: Props) {
    const isOpen = usePage().props.sidebarOpen

    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{children}</div>
    }

    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>
}
```

- **sidebar variant** = Default (responsive sidebar)
- **header variant** = Header-only layout (untuk special pages)

### Mobile Navigation Cleanup

```typescript
// use-mobile-navigation.ts
export function useMobileNavigation(): CleanupFn {
    return useCallback(() => {
        document.body.style.removeProperty('pointer-events')
    }, [])
}
```

---

## Device Breakpoints

```css
/* Tailwind CSS breakpoints */
sm:  640px
md:  768px    ← MOBILE_BREAKPOINT
lg:  1024px
xl:  1280px
2xl: 1536px
```

```typescript
// Usage in components
<div className="lg:hidden">Mobile only</div>
<div className="hidden lg:flex">Desktop only</div>
<div>All devices</div>
```

---

## Conclusion

✅ **Mobile bukan hanya untuk user role**
- Semua 4 role (user, pakar, admin, super_admin) dapat akses di mobile
- Navigation items di-filter berdasarkan permissions, bukan device type
- Layout responsif (sidebar collapse, sheet overlay) di mobile, tapi permissions tetap sama
- Backend authorization ada di kedua sisi (frontend UI + backend API)
- Mobile detection (`use-mobile`) hanya untuk UI layout adjustment, bukan role restriction

---

**Key Insight:**
```
Frontend Mobile = Full Role Support + Responsive Layout
Bukan pembatasan role untuk mobile, hanya responsive UI adjustment
```
