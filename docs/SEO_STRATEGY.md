# SEO Strategy & Implementation Plan — MAPAN

**Project:** Sistem Pakar Deteksi Penyakit Tanaman Padi  
**Stack:** Laravel 13 + React 19 + Inertia.js v3  
**Target:** SEO-friendly SPA untuk portofolio/project showcase  
**Last Updated:** 2026-05-11

---

## 📊 Current State Analysis

### ✅ Existing SEO Assets
- ✅ `robots.txt` di `public/` (allow all)
- ✅ Inertia `<Head>` component digunakan di beberapa page (welcome, diseases/show)
- ✅ URL structure rapi dengan slug (`/diseases/{slug}`)
- ✅ Alt text pada gambar penyakit (basic)
- ✅ 11 disease pages yang bisa diindeks

### ❌ Missing SEO Components
- ❌ **Sitemap.xml** — Google tidak tahu URL mana yang harus di-crawl
- ❌ **Dynamic meta tags** (description, keywords, OG tags) — hanya title yang di-set
- ❌ **Structured Data (JSON-LD)** — Google tidak memahami konten sebagai "Medical/Agricultural Knowledge"
- ❌ **Canonical tags** — risiko duplicate content
- ❌ **SSR** — Googlebot harus execute JavaScript untuk melihat konten
- ❌ **Semantic HTML audit** — heading hierarchy belum diverifikasi
- ❌ **Image optimization** — alt text masih generic

---

## 🎯 SEO Goals & Priorities

| Goal | Priority | Rationale |
|------|----------|-----------|
| **Indexable Knowledge Base** | 🔴 HIGH | 11 disease pages = 11 landing pages potensial |
| **Rich Snippets** | 🟡 MEDIUM | Structured data untuk tampil di SERP |
| **Fast Crawlability** | 🔴 HIGH | Sitemap + robots.txt = faster indexing |
| **Social Sharing** | 🟡 MEDIUM | OG tags untuk share di WhatsApp/Facebook |
| **Accessibility = SEO** | 🟢 LOW | Alt text & semantic HTML boost SEO |

---

## 📋 Implementation Phases

### **PHASE 1: Foundation — Meta Tags & Crawlability** ✅ IN PROGRESS
**Effort:** 2-3 hours | **Impact:** 🔴 HIGH

#### 1.1 Dynamic Meta Tags
- **Target Pages:** Landing, Disease detail, Disease index, Expert System, Detection
- **Implementation:** Controller-level meta array passed to Inertia
- **Meta Tags:** Title, Description, Keywords, OG (title, description, image, type, url), Twitter Card
- **Priority Diseases:** Blast, Brown Spot, Tungro
- **Keywords Focus:** Bahasa Indonesia ("penyakit padi", "gejala [nama]", "cara mengatasi [nama] padi")

**Files to Modify:**
- `app/Http/Controllers/DiseaseController.php`
- `app/Http/Controllers/ExpertSystemController.php`
- `app/Http/Controllers/DetectionController.php`
- `resources/js/pages/diseases/show.tsx`
- `resources/js/pages/diseases/index.tsx`
- `resources/js/pages/expert-system/index.tsx`
- `resources/js/pages/detection/index.tsx`

#### 1.2 Sitemap.xml Generation
- **Package:** `spatie/laravel-sitemap`
- **Command:** `php artisan sitemap:generate`
- **Automation:** Daily regeneration via Laravel Scheduler
- **Priority Pages:**
  - `/` (priority: 1.0)
  - `/diseases` (priority: 0.9)
  - `/diseases/blast`, `/diseases/brown-spot`, `/diseases/tungro` (priority: 0.9)
  - Other diseases (priority: 0.8)
  - `/expert-system`, `/detection` (priority: 0.8)

#### 1.3 Canonical Tags
- Add `<link rel="canonical">` to all public pages
- Use `APP_URL` from environment for dynamic base URL

#### 1.4 robots.txt Update
```
User-agent: *
Disallow: /admin
Disallow: /dashboard
Disallow: /detection/history
Disallow: /api/

Sitemap: https://mapan.test/sitemap.xml
```

---

### **PHASE 2: Content Optimization — Semantic HTML & Structured Data**
**Effort:** 3-4 hours | **Impact:** 🟡 MEDIUM

#### 2.1 Semantic HTML Audit
- Verify heading hierarchy (`<h1>` → `<h2>` → `<h3>`)
- Add `<main>`, `<article>`, `<section>` tags
- Add ARIA labels for accessibility

#### 2.2 Enhanced Alt Text
- Current: `alt={disease.name}` (generic)
- Better: `alt="Gejala penyakit ${disease.name} pada tanaman padi - daun menguning dan bercak coklat"`
- Strategy: Add `alt_text` column to `diseases` table or generate in controller

#### 2.3 Structured Data (JSON-LD)
- **Schema.org Type:** `MedicalCondition` for diseases
- **Fields:** name, alternateName (latin_name), description, cause, signOrSymptom, possibleTreatment
- **Implementation:** JSON-LD script in `<Head>` component
- **Validation:** Google Rich Results Test

---

### **PHASE 3: Advanced — Performance & Internal Linking**
**Effort:** 4-6 hours | **Impact:** 🟢 LOW-MEDIUM

#### 3.1 SSR Evaluation
**Decision:** ❌ **SKIP SSR**

**Rationale:**
- Googlebot 2024 can execute JavaScript (React)
- Inertia.js already renders meta tags server-side via `app.blade.php`
- Social crawlers get OG tags from initial HTML
- Complexity vs benefit: SSR adds significant overhead for minimal SEO gain

**Alternative:** Pre-rendering with `spatie/laravel-prerender` (if needed later)

#### 3.2 Performance Optimization
- Add `loading="lazy"` to all images
- Add `width` and `height` to prevent CLS
- Preload hero images
- **Target:** Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)

#### 3.3 Internal Linking Strategy
- Disease index → link to all 11 diseases
- Disease detail → link to related diseases (same symptoms)
- Footer → link to sitemap, diseases index, expert system

---

## 🛠️ Technical Implementation Details

### Meta Tags Structure
```php
// Controller
'meta' => [
    'title' => "{$disease->name} - Penyakit Tanaman Padi | MAPAN",
    'description' => Str::limit($disease->description, 155),
    'keywords' => "penyakit padi, {$disease->name}, gejala, penanganan, pertanian",
    'og_image' => $disease->image ?: asset('images/og-default.jpg'),
    'og_type' => 'article',
    'canonical' => url("/diseases/{$disease->slug}"),
]
```

```tsx
// Frontend (React)
<Head>
    <title>{meta.title}</title>
    <meta name="description" content={meta.description} />
    <meta name="keywords" content={meta.keywords} />
    <meta property="og:title" content={meta.title} />
    <meta property="og:description" content={meta.description} />
    <meta property="og:image" content={meta.og_image} />
    <meta property="og:type" content={meta.og_type} />
    <meta property="og:url" content={window.location.href} />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="canonical" href={meta.canonical} />
</Head>
```

### Sitemap Generation
```php
// app/Console/Commands/GenerateSitemap.php
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

$sitemap = Sitemap::create();

// Static pages
$sitemap->add(Url::create('/')->setPriority(1.0));
$sitemap->add(Url::create('/diseases')->setPriority(0.9));

// Dynamic: Disease pages
Disease::all()->each(function (Disease $disease) use ($sitemap) {
    $priority = in_array($disease->slug, ['blast', 'brown-spot', 'tungro']) ? 0.9 : 0.8;
    $sitemap->add(
        Url::create("/diseases/{$disease->slug}")
            ->setLastModificationDate($disease->updated_at)
            ->setPriority($priority)
            ->setChangeFrequency('monthly')
    );
});

$sitemap->writeToFile(public_path('sitemap.xml'));
```

### Structured Data Example
```json
{
  "@context": "https://schema.org",
  "@type": "MedicalCondition",
  "name": "Blast",
  "alternateName": "Pyricularia oryzae",
  "description": "Penyakit blast adalah...",
  "cause": "Jamur Pyricularia oryzae",
  "signOrSymptom": [
    {"@type": "MedicalSymptom", "name": "Bercak coklat pada daun"},
    {"@type": "MedicalSymptom", "name": "Daun menguning"}
  ],
  "possibleTreatment": [
    {"@type": "MedicalTherapy", "name": "Fungisida berbahan aktif..."}
  ]
}
```

---

## 📊 Success Metrics

| Metric | Baseline | Target (3 months) | Measurement Tool |
|--------|----------|-------------------|------------------|
| **Indexed Pages** | 0 | 15+ | Google Search Console |
| **Organic Traffic** | 0 | 50+ visits/month | Google Analytics |
| **Avg. Position** | N/A | Top 20 for "penyakit padi [name]" | GSC |
| **Rich Snippets** | 0 | 5+ diseases | Google SERP |
| **Core Web Vitals** | Unknown | All "Good" | PageSpeed Insights |

---

## 🛠️ Tools & Resources

| Tool | Purpose | Cost |
|------|---------|------|
| **Google Search Console** | Monitor indexing, search performance | Free |
| **Google Rich Results Test** | Validate structured data | Free |
| **PageSpeed Insights** | Core Web Vitals | Free |
| **Screaming Frog** | Crawl site like Googlebot | Free (500 URLs) |

---

## ⚠️ Important Constraints

1. **Auth-gated content** — `/dashboard`, `/detection/history`, `/admin/*` stay `Disallow` in robots.txt
2. **API routes** — `/api/*` disallowed (not meant for indexing)
3. **Duplicate content** — Ensure `/diseases` (web) and `/public/api/v1/diseases` (API) serve different purposes
4. **Mobile-first** — Google uses mobile-first indexing (already responsive with Tailwind)
5. **HTTPS** — Production must use HTTPS (SEO ranking factor)
6. **Dynamic URLs** — Use `APP_URL` from `.env` for canonical and sitemap URLs

---

## 📝 Configuration

### Environment Variables
```env
APP_URL=https://mapan.test  # Change to production domain when deployed
```

### Priority Diseases (Higher Ranking)
1. Blast (`blast`)
2. Brown Spot (`brown-spot`)
3. Tungro (`tungro`)

### Keyword Strategy
- Primary: "penyakit padi", "penyakit tanaman padi"
- Secondary: "gejala [nama penyakit]", "cara mengatasi [nama penyakit] padi"
- Long-tail: "penyakit blast pada padi", "ciri-ciri brown spot padi"

---

## 🚀 Execution Timeline

### Sprint 1 (Week 1): Phase 1 — Foundation
- Day 1-2: Dynamic meta tags
- Day 3: Sitemap generation
- Day 4: Canonical tags + robots.txt
- Day 5: Testing & validation

### Sprint 2 (Week 2): Phase 2 — Content
- Day 1-2: Semantic HTML audit
- Day 3: Enhanced alt text
- Day 4-5: Structured data

### Sprint 3 (Week 3): Phase 3 — Advanced (Optional)
- Day 1: SSR evaluation documentation
- Day 2-3: Performance optimization
- Day 4-5: Internal linking

---

## 📚 References

- [Google Search Central - JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Schema.org - MedicalCondition](https://schema.org/MedicalCondition)
- [Inertia.js - Title & Meta](https://inertiajs.com/title-and-meta)
- [Spatie Laravel Sitemap](https://github.com/spatie/laravel-sitemap)

---

**Status:** Phase 1 in progress  
**Next Action:** Implement dynamic meta tags in controllers
