# Frontend Architecture & Design Documentation

**Project:** Mapan (Rice Disease Detection & Expert System)  
**Framework:** React 19 + TypeScript  
**Build Tool:** Vite + Laravel Vite Plugin  
**Styling:** Tailwind CSS v4 + Radix UI  
**Date:** May 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture Patterns](#architecture-patterns)
5. [Key Components](#key-components)
6. [Routing System](#routing-system)
7. [State Management](#state-management)
8. [ML Integration](#ml-integration)
9. [Type System](#type-system)
10. [Development Guidelines](#development-guidelines)

---

## Overview

The Mapan frontend is a comprehensive React/TypeScript application integrating:

- **Role-based Dashboard** - Different UIs for superadmin, admin, pakar, and user roles
- **Detection Module** - Image upload and ML-based disease detection with history tracking
- **Expert System** - Rule-based diagnosis using Certainty Factor (CF) algorithm
- **Knowledge Management** - Admin interface for diseases, symptoms, and treatments (pakar role)
- **User Management** - System-level user administration (admin role)
- **Authentication** - Laravel Sanctum + Fortify integration with 2FA support
- **Real-time Analytics** - Dashboard with charts and detection statistics

### Core Features

| Feature | Module | Users |
|---------|--------|-------|
| Disease Detection | Detection | user, pakar, admin, super_admin |
| Expert System Diagnosis | Expert System | user, pakar, admin, super_admin |
| Disease Management | Admin > Knowledge Base | pakar, super_admin |
| Symptom Management | Admin > Knowledge Base | pakar, super_admin |
| Treatment Management | Admin > Knowledge Base | pakar, super_admin |
| User Management | Admin > System | admin, super_admin |
| System Dashboard | Admin > System | admin, super_admin |
| Profile & Settings | Settings | All authenticated users |
| Detection History | Detection | All authenticated users |

---

## Technology Stack

### Core Dependencies

```json
{
  "react": "19.x",
  "typescript": "5.x",
  "@inertiajs/react": "^3.0.0",
  "@tailwindcss/vite": "^4.x",
  "framer-motion": "^11.x",
  "recharts": "^2.x",
  "@radix-ui/*": "^1.x - ^2.x"
}
```

### UI Component Libraries

- **Radix UI** - Unstyled, accessible components
- **Lucide React** - Icon library
- **Shadcn/ui** - Pre-built component primitives (customized Radix UI)
- **Sonner** - Toast notifications
- **Framer Motion** - Animations

### Development Tools

- **ESLint** - Code linting with Stylistic rules
- **Prettier** - Code formatting with Tailwind CSS plugin
- **Vitest** - Unit testing framework
- **TypeScript** - Static type checking

### Build & Routing

- **Vite** - Modern bundler
- **Laravel Vite Plugin** - Laravel integration
- **Inertia.js** - Server-side routing with client-side reactivity
- **Wayfinder** - Type-safe route generation

---

## Project Structure

```
resources/js/
├── actions/              # Server actions (Fortify, API calls)
│   ├── login/
│   ├── register/
│   ├── password/
│   ├── profile/
│   ├── security/
│   └── two-factor/
├── app.tsx              # Application entry point
├── components/          # Reusable UI components
│   ├── ui/              # Shadcn/Radix UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── tooltip.tsx
│   │   ├── sidebar.tsx
│   │   └── [30+ other components]
│   ├── dashboard/       # Dashboard-specific components
│   ├── detection/       # Detection module components
│   ├── expert-system/   # Expert system components
│   ├── app-shell.tsx    # Layout wrapper (sidebar/header)
│   ├── app-header.tsx   # Top navigation
│   ├── app-sidebar.tsx  # Sidebar navigation
│   ├── nav-main.tsx     # Main navigation menu
│   ├── nav-user.tsx     # User profile menu
│   └── breadcrumbs.tsx  # Breadcrumb navigation
├── hooks/               # Custom React hooks
│   ├── use-clipboard.ts     # Clipboard operations
│   ├── use-current-url.ts   # URL utilities
│   ├── use-flash-toast.ts   # Toast notifications
│   ├── use-initials.tsx     # User initials
│   ├── use-mobile.tsx       # Mobile detection
│   ├── use-mobile-navigation.ts
│   └── use-two-factor-auth.ts
├── layouts/             # Page layouts
│   ├── app-layout.tsx       # Main app layout wrapper
│   ├── app/
│   │   └── app-sidebar-layout.tsx
│   ├── auth-layout.tsx      # Authentication pages
│   ├── auth/
│   │   └── [auth components]
│   └── settings/
│       └── layout.tsx
├── lib/                 # Utilities & ML/Expert System
│   ├── expert-system.ts         # Forward Chaining + CF diagnosis
│   ├── expert-system-advanced.ts
│   ├── ml-model.ts              # ONNX Runtime Web (image classification)
│   ├── geo-weather.ts           # Weather data integration
│   ├── utils.ts                 # General utilities
│   ├── *.test.ts                # Unit tests
├── pages/               # Page components (Inertia routes)
│   ├── dashboard.tsx            # Dashboard page
│   ├── welcome.tsx              # Welcome/landing page
│   ├── admin/
│   │   ├── detections/          # Admin detection view
│   │   ├── diseases/            # Disease management
│   │   ├── symptoms/            # Symptom management
│   │   ├── treatments/          # Treatment management
│   │   └── users/               # User management
│   ├── auth/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── password-reset.tsx
│   │   └── [other auth pages]
│   ├── detection/
│   │   ├── index.tsx            # Detection history
│   │   ├── show.tsx             # Detection details
│   │   └── history.tsx
│   ├── diseases/
│   │   ├── index.tsx            # Disease list
│   │   └── show.tsx
│   ├── expert-system/
│   │   └── index.tsx            # Expert system interface
│   └── settings/
│       ├── account.tsx
│       ├── security.tsx
│       └── profile.tsx
├── routes/              # Type-safe route definitions (Wayfinder)
│   ├── index.ts         # All route definitions
│   ├── admin/
│   ├── api/
│   ├── login/
│   ├── detection/
│   ├── diseases/
│   └── [other route modules]
├── types/               # TypeScript type definitions
│   ├── auth.ts          # Authentication types
│   ├── global.d.ts      # Global type definitions
│   ├── index.ts         # Type exports
│   ├── navigation.ts    # Navigation types
│   ├── ui.ts            # UI component props types
│   └── vite-env.d.ts    # Vite environment variables
└── wayfinder/           # Route generation (generated by Wayfinder)
    └── [auto-generated route helpers]

resources/css/
└── app.css              # Global Tailwind CSS + custom styles
```

---

## Architecture Patterns

### 1. **Inertia.js - Page-Component Model**

Inertia.js bridges Laravel backend with React frontend using a unique architecture:

```typescript
// Backend: Laravel controller returns props
return inertia('dashboard', [
    'stats' => ['totalDetections' => 42, ...],
    'diseaseDistribution' => [...]
])

// Frontend: React component receives props via Inertia
interface Props {
    stats: { totalDetections: number; ... }
    diseaseDistribution: Array<{ name: string; count: number }>
}

export default function Dashboard({ stats, diseaseDistribution }: Props) {
    // Component uses props directly
}
```

**Benefits:**
- Server-side routing (no client-side router)
- Persistent layouts across page transitions
- Full-page refresh only when needed
- Type-safe props via TypeScript

### 2. **Layout Nesting**

The app uses nested layouts for different sections:

```typescript
// app.tsx - Entry point with layout logic
createInertiaApp({
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;  // No layout
            case name.startsWith('auth/'):
                return AuthLayout;  // Auth-specific layout
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];  // Nested layouts
            default:
                return AppLayout;  // Main app layout
        }
    },
    withApp(app) {
        return (
            <TooltipProvider>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    }
})
```

**Layout Hierarchy:**
```
TooltipProvider + Toaster
├── AuthLayout
│   └── Login/Register pages
├── AppLayout
│   ├── Header
│   ├── Sidebar
│   ├── Main Content
│   └── (optional) SettingsLayout for settings pages
└── null
    └── Welcome page
```

### 3. **Component Organization**

#### UI Components (`components/ui/`)
Shadcn/Radix UI primitives - unstyled, accessible, headless components:
- No business logic
- Pure presentation
- Fully typed props
- Export as `<Button>`, `<Card>`, `<Input>`, etc.

#### Feature Components (`components/{feature}/`)
Domain-specific components:
- Combine UI components with business logic
- Fetch data or integrate with services
- Example: `DetectionUploadForm`, `DiseaseSearchTable`

#### Layout Components (`layouts/` and `components/app-*.tsx`)
Application shell and navigation:
- `AppShell` - Wrapper choosing sidebar vs header layout
- `AppLayout` - Main app layout (sidebar, header, content)
- `AuthLayout` - Authentication pages (centered form)
- Sidebar navigation and header components

### 4. **Role-Based Routing**

Routes are protected by middleware checking user roles:

```typescript
// routes/api.php (backend)
Route::middleware(['auth:sanctum', 'role:pakar,super_admin'])->group(function () {
    Route::get('/admin/knowledge-base/diseases', ...);  // Pakar routes
});

Route::middleware(['auth:sanctum', 'role:admin,super_admin'])->group(function () {
    Route::post('/admin/system/users', ...);  // Admin routes
});
```

**Frontend Responsibility:**
- Render only links user has access to (UI control)
- Handle 403 Forbidden responses gracefully
- Redirect unauthorized users to dashboard

### 5. **Inertia Middleware & Props**

Shared props sent to every page request via `HandleInertiaRequests` middleware:

```typescript
// Backend: app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return [
        'auth' => [
            'user' => $request->user(),
        ],
        'flash' => [
            'success' => session('message'),
            'error' => session('error'),
        ],
    ];
}

// Frontend: Access in any component
const { flash } = usePage().props;
```

---

## Key Components

### Page Layout Components

#### `AppShell` (`components/app-shell.tsx`)
Entry point for layout selection:
- Props: `children`, `variant` ('sidebar' | 'header')
- Uses Radix UI `SidebarProvider` for state management
- Reads `sidebarOpen` from page props

#### `AppLayout` (`layouts/app-layout.tsx`)
Main application layout wrapper:
- Props: `breadcrumbs`, `children`
- Wraps `AppSidebarLayout` template
- Used for all authenticated pages

#### `AuthLayout` (`layouts/auth-layout.tsx`)
Authentication page layout:
- Centered form container
- No header/sidebar
- Used for login, register, password reset

#### `SettingsLayout` (`layouts/settings/layout.tsx`)
Settings page layout:
- Two-column: sidebar with settings menu + content
- Nested inside `AppLayout`

### Navigation Components

#### `AppSidebar` (`components/app-sidebar.tsx`)
Sidebar navigation:
- Collapsible menu groups
- Role-based menu items visibility
- Active route highlighting
- Mobile responsive

#### `NavMain` (`components/nav-main.tsx`)
Main navigation menu:
- Groups menu items by category
- Integrates with route definitions
- Collapsible sections

#### `NavUser` (`components/nav-user.tsx`)
User profile dropdown menu:
- User avatar + name
- Settings link
- Logout action

#### `Breadcrumbs` (`components/breadcrumbs.tsx`)
Breadcrumb navigation:
- Props: `items` array with `label`, `href`
- Shows current page context
- Active page styling

### Dashboard Components

#### `dashboard.tsx` Page
Key features:
- **Stats Cards** - Total detections, this month, average confidence, top disease
- **Charts**:
  - Disease distribution (pie chart)
  - Detection trends (bar chart)
- **Recent Detections Table** - Last 5 detections with disease info
- **Skeleton Loading** - Loading states for data
- **HoverCards** - Detail tooltips on hover

Charts use `recharts` library:
```typescript
<PieChart data={diseaseDistribution}>
    <Pie dataKey="count" />
    <Cell fill={COLORS.primary} />
    <Tooltip content={CustomTooltip} />
</PieChart>
```

### Detection Module

#### Detection Pages
1. **`pages/detection/index.tsx`** - Detection history list
2. **`pages/detection/show.tsx`** - Detection detail view
3. **`pages/detection/history.tsx`** - Detailed history with filters

#### Detection Components
- **Image Upload Form** - Drag-drop or click to upload
- **ML Prediction Display** - Show classification results
- **Confidence Bar** - Progress bar for confidence percentage
- **Result Cards** - Disease info, treatments, recommendations

### Expert System Module

#### Expert System Interface (`pages/expert-system/index.tsx`)
**Workflow:**
1. Display symptom list (checkboxes)
2. User selects symptoms
3. Click "Diagnose"
4. Calculate using Certainty Factor algorithm
5. Display diagnosis results ranked by CF

**Result Display:**
- Ranking (1st, 2nd, 3rd...)
- Disease name + description
- Certainty Factor (0-100%)
- Matching symptoms count
- Treatment recommendations

#### Expert System Components
- **Symptom Selector** - Checkbox group or search/filter
- **Result Cards** - Disease + CF visualization
- **Treatment List** - Organized by type (prevention, chemical, biological, cultural)

### Admin Knowledge Base

#### Disease Management (`pages/admin/diseases/`)
- List view with search/filter
- Create/Edit/Delete modals
- Bulk actions
- Symptom association UI

#### Symptom Management (`pages/admin/symptoms/`)
- Symptom CRUD
- Link to diseases (many-to-many)
- Weight assignment for each disease-symptom pair

#### Treatment Management (`pages/admin/treatments/`)
- Treatment CRUD by disease
- Type selection (prevention, chemical, biological, cultural)
- Dosage information
- Priority ordering

#### Admin Detection View (`pages/admin/detections/`)
- All user detections (admin/pakar only)
- Filter by user, date, disease
- Detailed detection information
- Admin notes/comments

### Admin System Management

#### User Management (`pages/admin/users/`)
- User list with role assignment
- Create/Edit/Delete users
- Bulk role assignment
- 2FA status display

#### System Dashboard (`pages/admin/system/`)
- System statistics
- User activity logs
- Detection statistics by timeframe
- System health metrics

### Authentication Pages

#### Login (`pages/auth/login.tsx`)
- Email + password inputs
- Remember me checkbox
- 2FA redirect after login
- Error display

#### Register (`pages/auth/register.tsx`)
- Name, email, password inputs
- Password confirmation
- Terms acceptance
- Redirect to login on success

#### Password Reset
- Request form (email)
- Reset form (token + new password)
- Success confirmation

#### Two-Factor Setup (`components/two-factor-setup-modal.tsx`)
- QR code display for authenticator app
- Manual entry code
- Recovery codes generation

### Settings Pages

#### Profile Settings (`pages/settings/profile.tsx`)
- Name, email update
- Profile picture upload
- Preferences

#### Security Settings (`pages/settings/security.tsx`)
- Current password verification
- Change password form
- 2FA enable/disable
- Session management

#### Account Settings (`pages/settings/account.tsx`)
- Email preferences
- Notification settings
- Account deletion option

---

## Routing System

### Type-Safe Routes (Wayfinder)

Wayfinder generates type-safe route helpers from Laravel backend:

```typescript
// Generated in routes/index.ts
export const dashboard = (options?: RouteQueryOptions) => ({
    url: '/dashboard',
    method: 'get'
})

export const admin = {
    diseases: { index: () => ({ url: '/admin/diseases' }) },
    users: { show: (id: number) => ({ url: `/admin/users/${id}` }) }
}

// Usage in components
import { dashboard, admin } from '@/routes'

<Link href={dashboard.url}>Dashboard</Link>
<Link href={admin.diseases.index.url}>Diseases</Link>
<Link href={admin.users.show(5).url}>User 5</Link>
```

**Route Organization:**
```
/login, /register, /forgot-password, /reset-password
/dashboard
/detection (history)
/detection/{id} (show)
/diseases
/diseases/{id}
/expert-system
/settings/profile
/settings/security
/settings/account
/admin/detections
/admin/diseases
/admin/diseases/{id}
/admin/symptoms
/admin/treatments
/admin/users
/admin/users/{id}
/admin/system (dashboard)
```

### Inertia Navigation

```typescript
// Server-side redirect
return redirect()->route('dashboard');

// Client-side navigation
import { Link } from '@inertiajs/react'

<Link href="/dashboard">Home</Link>
<Link href={route('dashboard')}>Home</Link>  // Using route helper
```

---

## State Management

### Inertia Page Props

Primary state management through Inertia props:

```typescript
// Backend sends props
return inertia('detection/show', [
    'detection' => $detection,
    'mlPredictions' => [...],
])

// Frontend receives typed props
interface Props {
    detection: Detection
    mlPredictions: Prediction[]
}

export default function Show({ detection, mlPredictions }: Props) {
    // Props are reactive but immutable
}
```

### Session Flash Data

Temporary data for success/error messages:

```typescript
// Backend
return redirect('/')
    ->with('success', 'Disease created successfully')
    ->with('error', 'Invalid input');

// Frontend
const { flash } = usePage().props

useEffect(() => {
    if (flash.success) {
        toast.success(flash.success)
    }
}, [flash])
```

### Client State (React Hooks)

Local component state for UI interactions:

```typescript
// Form state
const [formData, setFormData] = useState({
    name: '',
    email: '',
})

// Modal state
const [openDialog, setOpenDialog] = useState(false)

// List filters
const [filters, setFilters] = useState({
    search: '',
    role: 'all'
})
```

### Custom Hooks

#### `use-flash-toast.ts`
Auto-show toast when flash messages update:
```typescript
useFlashToast()  // Listens to flash messages
```

#### `use-mobile.ts`
Detect mobile viewport:
```typescript
const isMobile = useMobile()  // Returns boolean
```

#### `use-clipboard.ts`
Copy to clipboard utility:
```typescript
const { copy } = useClipboard()
copy(text)  // Returns success boolean
```

#### `use-current-url.ts`
Get current page URL:
```typescript
const { pathname, href } = useCurrentUrl()
```

#### `use-initials.tsx`
Generate user initials:
```typescript
const initials = useInitials('John Doe')  // 'JD'
```

---

## ML Integration

### ONNX Runtime Web (`lib/ml-model.ts`)

Browser-side ML model inference using ONNX Runtime Web:

```typescript
// Model configuration
CLASS_LABELS = [
    'Bacterial Leaf Blight',
    'Bacterial Leaf Streak',
    'Bacterial Panicle Blight',
    'Blast',
    'Brown Spot',
    'Dead Heart',
    'Downy Mildew',
    'Healthy',
    'Hispa',
    'Leaf Smut',
    'Tungro'
]

// Load model (cached after first load)
const session = await loadModel()

// Predict from image
const prediction = await predict(imageData)
// Returns: { label: 'Blast', confidence: 85.5 }
```

**Features:**
- Lazy loading (load on first use)
- Caching (reuse loaded model)
- WASM + multi-threading support
- CDN-hosted WASM files (efficient)
- Error handling for missing model

**Usage in Components:**
```typescript
import { loadModel, predict, CLASS_LABELS } from '@/lib/ml-model'

async function handleImageUpload(file: File) {
    try {
        const session = await loadModel()
        const result = await predict(file)
        setMlResult(result)
    } catch (error) {
        toast.error('Model not available')
    }
}
```

### Expert System (`lib/expert-system.ts`)

Rule-based diagnosis using Forward Chaining + Certainty Factor:

```typescript
interface SymptomData {
    id: number
    code: string
    name: string
    description: string | null
}

interface DiseaseData {
    id: number
    name: string
    symptoms: Array<SymptomData & { pivot: { weight: number } }>
    treatments: TreatmentData[]
}

// Diagnosis process
const results = diagnose(selectedSymptomIds, diseases)
// Returns: DiagnosisResult[] sorted by certaintyFactor (highest first)

// Result contains:
interface DiagnosisResult {
    disease: DiseaseData
    certaintyFactor: number  // 0-100
    matchingSymptoms: number
    totalSymptoms: number
    matchedSymptomDetails: Array<{ symptom, weight }>
}
```

**Algorithm:**
1. User selects symptoms (checkboxes)
2. For each disease:
   - Find matching symptoms
   - Calculate CF = product of weighted symptoms
   - CF_combine = CF1 + CF2 * (1 - CF1) for multiple symptoms
3. Filter diseases with CF > threshold (e.g., 30%)
4. Sort by CF descending
5. Display top 3-5 results

---

## Type System

### Core Types (`types/index.ts`)

```typescript
// Authentication
interface User {
    id: number
    name: string
    email: string
    email_verified_at: string | null
    two_factor_enabled: boolean
    role: 'user' | 'pakar' | 'admin' | 'super_admin'
}

// Global props (shared via Inertia middleware)
interface GlobalProps {
    auth?: {
        user: User
    }
    flash?: {
        success?: string
        error?: string
    }
}

// UI types
type AppVariant = 'sidebar' | 'header'

interface BreadcrumbItem {
    label: string
    href?: string
}
```

### Global Type Definitions (`types/global.d.ts`)

```typescript
// Inertia page props typing
declare function route(name: string, params?: any): string
declare const InertiaApp: React.ComponentType

// Environment variables
declare const import.meta.env.VITE_APP_NAME: string
declare const import.meta.env.VITE_APP_URL: string
```

### Navigation Types (`types/navigation.ts`)

```typescript
interface NavItem {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: NavItem[]
}

interface NavGroup {
    title?: string
    items: NavItem[]
}
```

### UI Component Types (`types/ui.ts`)

Prop types for UI components (automatically generated by Radix UI):

```typescript
import { ButtonHTMLAttributes } from 'react'
import { VariantProps } from 'class-variance-authority'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants>

export type InputProps = InputHTMLAttributes<HTMLInputElement>

// ... etc for all UI components
```

---

## Development Guidelines

### Component Creation

#### UI Component Template
```typescript
// components/ui/my-component.tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface MyComponentProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'outline'
    size?: 'sm' | 'md' | 'lg'
}

export const MyComponent = forwardRef<
    HTMLDivElement,
    MyComponentProps
>(({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'base-styles',
            variant === 'default' && 'default-styles',
            variant === 'outline' && 'outline-styles',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-base',
            className
        )}
        {...props}
    />
))

MyComponent.displayName = 'MyComponent'
```

#### Feature Component Template
```typescript
// components/detection/upload-form.tsx
import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface UploadFormProps {
    onSuccess?: (detection: Detection) => void
}

export function UploadForm({ onSuccess }: UploadFormProps) {
    const { auth } = usePage().props
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleUpload = async (file: File) => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('image', file)

            const response = await fetch('/private/api/v1/detection', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                },
                body: formData
            })

            const result = await response.json()
            onSuccess?.(result.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            {/* Component JSX */}
        </Card>
    )
}
```

### Styling Guidelines

#### Tailwind CSS Best Practices
```typescript
// ✅ Good: Use utility classes
<div className="flex items-center justify-between gap-4 px-4 py-2">

// ❌ Avoid: Hardcoded styles
<div style={{ display: 'flex', padding: '8px 16px' }}>

// ✅ Use cn() for conditional classes
className={cn(
    'base-class',
    isActive && 'active-class',
    size === 'lg' && 'text-lg'
)}
```

#### Color Palette
```typescript
// Tailwind v4 CSS variables in app.css
@layer base {
    :root {
        --primary: #059669;      /* Emerald-600 */
        --secondary: #10b981;    /* Emerald-500 */
        --destructive: #dc2626;  /* Red-600 */
        --muted: #64748b;        /* Slate-500 */
    }
}

// Usage in components
<Button className="bg-primary text-white">Save</Button>
```

### Type Safety

#### Strict Mode
```typescript
// tsconfig.json
{
    "compilerOptions": {
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "strictFunctionTypes": true
    }
}
```

#### Props Typing
```typescript
// Always type component props
interface ComponentProps {
    title: string
    onSubmit: (data: FormData) => void | Promise<void>
    children?: React.ReactNode
    isLoading?: boolean
}

export function Component({
    title,
    onSubmit,
    children,
    isLoading = false
}: ComponentProps) {
    // Implementation
}
```

#### API Response Typing
```typescript
// types/api.ts
export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface Detection {
    id: number
    image_path: string
    ml_result?: MLPrediction
    disease_id?: number
    created_at: string
}

// Usage
const response: ApiResponse<Detection> = await fetch(...)
```

### Error Handling

#### Try-Catch with Toasts
```typescript
try {
    const result = await diagnose(selectedSymptoms)
    toast.success('Diagnosis complete')
    setResults(result)
} catch (error) {
    const message = error instanceof Error
        ? error.message
        : 'An error occurred'
    toast.error(message)
}
```

#### Form Validation
```typescript
const errors: Record<string, string> = {}

if (!formData.name.trim()) {
    errors.name = 'Name is required'
}

if (!formData.email.includes('@')) {
    errors.email = 'Valid email required'
}

if (Object.keys(errors).length > 0) {
    setFormErrors(errors)
    return
}
```

### Testing

#### Vitest Unit Tests
```typescript
// components/button.test.ts
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { describe, it, expect } from 'vitest'

describe('Button', () => {
    it('renders button with text', () => {
        render(<Button>Click me</Button>)
        expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('calls onClick handler', () => {
        const onClick = vi.fn()
        render(<Button onClick={onClick}>Click</Button>)
        screen.getByText('Click').click()
        expect(onClick).toHaveBeenCalled()
    })
})
```

#### Testing Expert System
```typescript
// lib/expert-system.test.ts
import { diagnose } from '@/lib/expert-system'
import { describe, it, expect } from 'vitest'

describe('Expert System', () => {
    it('diagnoses disease from symptoms', () => {
        const results = diagnose(
            [1, 2, 3],  // symptom ids
            mockDiseases
        )
        expect(results).toHaveLength(3)
        expect(results[0].certaintyFactor).toBeGreaterThan(results[1].certaintyFactor)
    })
})
```

### Development Commands

```bash
# Development server (Vite on port 5173, Laravel on 8000)
npm run dev

# Build for production
npm run build

# Type checking
npm run types:check

# Linting
npm run lint          # Auto-fix
npm run lint:check    # Check only

# Formatting
npm run format        # Auto-fix
npm run format:check  # Check only

# Testing
npm test              # Run once
npm run test:watch   # Watch mode
```

### Performance Optimization

#### Code Splitting
```typescript
// Lazy load heavy components
import { lazy, Suspense } from 'react'

const HeavyDashboard = lazy(() => import('./dashboard'))

export function App() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <HeavyDashboard />
        </Suspense>
    )
}
```

#### Image Optimization
```typescript
// Use Tailwind fill patterns for empty states
<div className="bg-pattern-dots-gray-100">
    <p>No data available</p>
</div>
```

#### React Compiler
```typescript
// vite.config.ts enables React Compiler
babel: {
    plugins: ['babel-plugin-react-compiler']
}
```

---

## API Integration

### Request Structure

#### Public API (No Auth)
```typescript
// GET requests - public endpoints
const response = await fetch('/public/api/v1/diseases', {
    method: 'GET'
})
```

#### Private API (Authenticated)
```typescript
// POST/PUT/DELETE - private endpoints with auth
const response = await fetch('/private/api/v1/detection', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-CSRF-TOKEN': csrfToken
    },
    body: JSON.stringify(data)
})
```

### Error Handling
```typescript
if (response.status === 401) {
    // Token expired - redirect to login
    window.location.href = '/login'
    return
}

if (response.status === 403) {
    // Insufficient permissions
    toast.error('You do not have permission for this action')
    return
}

if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Request failed')
}
```

---

## Deployment

### Build Process
```bash
# Vite builds frontend assets
npm run build
# Output: public/build/

# Laravel serves frontend through Inertia
# No separate frontend deployment needed
```

### Environment Variables
```
VITE_APP_NAME=Mapan
VITE_APP_URL=https://mapan.local
```

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)

---

## Performance Metrics

- **Lighthouse Score**: Target 90+
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Bundle Size**: ~120KB gzipped (JS + CSS combined)

---

## File Size Reference

| File | Size |
|------|------|
| React (core) | ~42KB |
| Inertia.js | ~15KB |
| Tailwind CSS | ~30KB |
| Radix UI components | ~40KB |
| App code | ~25KB |
| **Total (gzipped)** | **~120KB** |

---

## References & Resources

### Documentation
- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Inertia.js](https://inertiajs.com)
- [Radix UI](https://www.radix-ui.com)
- [Vite](https://vitejs.dev)

### UI Components
- [Shadcn/ui](https://ui.shadcn.com) - Component templates
- [Lucide Icons](https://lucide.dev) - Icon library
- [Sonner](https://sonner.emilkowal.ski) - Toast notifications
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Recharts](https://recharts.org) - Chart library

### Project Documentation
- [AGENTS.md](AGENTS.md) - Development commands and architecture
- [MEMORY.md](MEMORY.md) - API integration and recent changes
- [TESTING.md](TESTING.md) - Test guidelines and practices

---

## Support & Troubleshooting

### Common Issues

#### Module not found errors
```
Error: Cannot find module '@/components/ui/button'
Solution: Check tsconfig.json paths configuration
```

#### Styling not applied
```
Problem: Tailwind classes not working
Solution: Ensure css is imported in app.tsx
```

#### Type errors in props
```
Problem: Property 'xyz' is not assignable to type 'Props'
Solution: Check component props interface matches usage
```

### Debug Mode
```bash
# Enable Vite debug logging
DEBUG=* npm run dev

# Check type issues
npm run types:check

# Lint check
npm run lint:check
```

---

**Last Updated:** May 6, 2026  
**Maintained By:** Development Team  
**Version:** 1.0.0
