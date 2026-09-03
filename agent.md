# Agent Instructions — Inklusi TPS Spatial Intelligence

Dokumen ini berisi aturan dan konteks yang harus diikuti AI saat mengerjakan proyek ini.

---

## 1. Konteks Proyek

**Inklusi TPS Spatial Intelligence** adalah peta overlay interaktif (WebGIS) untuk memvisualisasikan prioritas lokasi pembangunan TPS (Tempat Penampungan Sementara sampah) di Kabupaten Banjarnegara, Jawa Tengah.

**Ini BUKAN:**
- Sistem manajemen data
- Platform analisis multi-skenario
- Decision support system lengkap
- Dashboard dengan banyak halaman

**Ini ADALAH:**
- Peta overlay interaktif satu halaman
- Alat visualisasi berbasis data spasial
- Menampilkan prioritas dan gap layanan TPS

Selalu rujuk ke [`prd.md`](./prd.md) untuk detail lengkap fitur dan spesifikasi.

---

## 2. Tech Stack (Wajib Diikuti)

```
Frontend  : Next.js (App Router) + TypeScript + React
Styling   : Tailwind CSS + shadcn/ui
Peta      : MapLibre GL JS (WebGL GPU Rendering)
Spatial   : Turf.js (100% Client-side Computation)
Data      : Static GeoJSON di `public/data/` (On-demand fetch)
Session   : `IndexedDB` / `localStorage` (untuk data TPS hasil upload)
Deploy    : Vercel (Edge CDN + Brotli/Gzip Compression)
```

### Yang TIDAK BOLEH digunakan:
- ❌ Backend/server API & Node.js dynamic server functions
- ❌ Database (Supabase, PostgreSQL, PostGIS, Firebase, MongoDB, dll.)
- ❌ Python / GeoPandas / Rasterio (di dalam app runtime)
- ❌ Google Earth Engine SDK di dalam web app runtime
- ❌ Leaflet (gunakan MapLibre GL JS)
- ❌ Mapbox GL JS (gunakan MapLibre GL JS)
- ❌ AI / LLM API calls di dalam web runtime

---

## 3. Arsitektur

```
┌─────────────────────────────────┐
│         Static Site             │
│  (Next.js SSG / Client-side)   │
├─────────────────────────────────┤
│  UI Layer                       │
│  - React Components             │
│  - shadcn/ui                    │
│  - Tailwind CSS                 │
├─────────────────────────────────┤
│  Map Layer                      │
│  - MapLibre GL JS               │
│  - Layer management             │
│  - Popup / Legend               │
├─────────────────────────────────┤
│  Spatial Engine (client-side)   │
│  - Turf.js                      │
│  - Constraint analysis          │
│  - Suitability scoring (WLC)    │
│  - Service coverage (buffer)    │
│  - Service gap                  │
├─────────────────────────────────┤
│  Data Layer                     │
│  - GeoJSON files (static)       │
│  - Mock data untuk MVP          │
└─────────────────────────────────┘
```

Semua computation dilakukan di browser. Tidak ada server call.

---

## 4. Struktur Folder

```
src/
├── app/                    # Next.js app router
│   ├── layout.tsx
│   └── page.tsx            # Single page application
├── components/
│   ├── map/                # MapLibre components
│   │   ├── Map.tsx
│   │   ├── LayerControl.tsx
│   │   ├── Legend.tsx
│   │   ├── Popup.tsx
│   │   └── BasemapSwitcher.tsx
│   ├── sidebar/            # Sidebar controls
│   │   ├── Sidebar.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── LayerToggle.tsx
│   │   ├── WeightSliders.tsx
│   │   ├── RadiusSlider.tsx
│   │   └── PlanningHorizonSlider.tsx # Slider tahun proyeksi (0-5 thn) & growth rate
│   ├── modal/              # Modal & Dialogs
│   │   └── HelpAndFormulasModal.tsx  # Modal Bantuan & Rumus (Transparansi Model, SNI, Data Dict, Print)
│   ├── kpi/                # KPI bar
│   │   └── KpiBar.tsx
│   └── ui/                 # shadcn/ui components
├── engine/                 # Spatial analysis & forecasting engine
│   ├── constraint.ts       # Constraint analysis (area tidak layak)
│   ├── scoring.ts          # WLC suitability scoring
│   ├── normalize.ts        # Normalisasi parameter 0-100
│   ├── coverage.ts         # Service coverage (buffer)
│   ├── gap.ts              # Service gap
│   ├── forecasting.ts      # Proyeksi populasi Pt & timbulan sampah Qt
│   └── types.ts            # TypeScript types untuk engine
├── data/                   # Data GeoJSON (real data, bukan mock)
│   ├── BOUNDARY/           # Batas administrasi
│   │   ├── Administrasi Kecamatan.geojson  # props: KECAMATAN
│   │   └── Administrasi Desa.geojson       # props: DESA
│   ├── DAMPAK/             # Risiko bencana + populasi dasymetric
│   │   ├── kelas Banjir.geojson   # props: NAMA_DESA, NAMA_KEC, KLS_BENC, LUAS_HA, JML_JIWA
│   │   └── kelas Longsor.geojson  # props: NAMA_DESA, NAMA_KEC, KLS_BENC, LUAS_HA, JML_JIWA
│   ├── DOWNLOAD/           # Unduhan OSM (OSMnx) & GEE
│   │   ├── jaringan_jalan_banjarnegara.geojson # props: highway, road_class, road_class_label
│   │   ├── sungai_banjarnegara.geojson        # props: waterway, name
│   │   ├── badan_air_banjarnegara.geojson     # props: natural, name, water
│   │   └── slope_banjarnegara.geojson         # props: kelas_slope, kategori, skor, warna
│   ├── TEMPLATE/           # Template upload data
│   │   ├── template_tps_eksisting.csv
│   │   └── template_tps_eksisting.geojson
│   ├── KELAS DAN INDEKS BENCANA/
│   │   ├── HASIL_GEOJSON/  # GeoJSON risiko bencana (WGS84)
│   │   └── INDEKS BENCANA 30/  # Raster indeks bencana (.tif)
│   └── POLA RUANG V2/      # RTRW V2 - WGS84 ✅
│       └── POLA RUANG.geojson  # props: NAMOBJ, JNSRPR, Status (Lindung/Budidaya)
├── hooks/                  # Custom React hooks
│   ├── useMap.ts
│   ├── useAnalysis.ts
│   └── useLayers.ts
├── lib/                    # Utilities
│   ├── constants.ts        # Default weights, thresholds, colors, forecasting params
│   ├── colors.ts           # Warna peta dan kategori
│   └── utils.ts
└── types/                  # Global TypeScript types
    └── index.ts
```

---

## 5. Aturan Kode

### 5.1 Umum
- Semua kode dalam **TypeScript** (strict mode)
- Gunakan **named exports**, bukan default exports
- Satu komponen per file
- Nama file: `PascalCase.tsx` untuk komponen, `camelCase.ts` untuk utilitas
- Komentar dalam **Bahasa Inggris**
- UI text dalam **Bahasa Indonesia**

### 5.2 Spatial Engine
- Engine harus **pure functions** — tidak boleh bergantung pada React state
- Semua weight dan threshold harus menjadi **parameter**, bukan hard-coded
- Gunakan **Turf.js** untuk semua operasi spasial (buffer, distance, area, boolean operations)
- Semua distance calculation harus menggunakan **great-circle distance** (Turf.js default), bukan Euclidean on lat/lng
- Input/output engine selalu **GeoJSON FeatureCollection**

```typescript
// ✅ Benar — pure function dengan parameter
function calculateSuitability(
  features: FeatureCollection,
  weights: WeightConfig,
  thresholds: ThresholdConfig
): FeatureCollection { ... }

// ❌ Salah — hard-coded, bergantung pada global state
function calculateSuitability() {
  const weight = 0.25; // hard-coded
  const data = globalStore.features; // side effect
}
```

### 5.3 Konfigurasi

Semua default disimpan di `src/lib/constants.ts`:

```typescript
export const DEFAULT_WEIGHTS: WeightConfig = {
  population: 25,          // Dasymetric JML_JIWA
  accessibility: 20,       // Jarak ke jaringan jalan
  slope: 15,               // 0-8% (100), 8-15% (80), 15-25% (50), 25-40% (20)
  spatialPlanning: 15,     // Kesesuaian RTRW
  landslideRisk: 15,       // Soft scoring penalti: Rendah (100), Sedang (60), Tinggi (30)
  floodRisk: 5,            // Soft scoring penalti: Rendah (100), Sedang (60), Tinggi (20)
  sensitiveDistance: 5,    // Buffer sempadan sungai/badan air
};

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  riverBuffer: 50,          // meter (Hard constraint)
  maxSlope: 40,             // persen (>40% adalah Hard constraint / eliminasi mutlak)
  maxRoadDistance: 2000,    // meter
  serviceRadius: 1000,      // meter (Euclidean buffer TPS eksisting)
  minSuitabilityScore: 60,  // untuk filter area prioritas
};

// Parameter Forecasting & Timbulan Sampah
export const DEFAULT_FORECASTING = {
  planningHorizonYears: 0,   // Slider 0 s/d 5 tahun (default: 0 = saat ini)
  annualGrowthRate: 0.8,     // % per tahun (BPS Banjarnegara)
  wasteGenPerCapitaLiter: 2.5, // liter/jiwa/hari (SNI 19-3983-1995)
};

export const SUITABILITY_CATEGORIES = [
  { min: 80, max: 100, label: 'Sangat Sesuai', color: '#1a7d3c' },
  { min: 60, max: 79,  label: 'Sesuai',        color: '#6abf4b' },
  { min: 40, max: 59,  label: 'Cukup Sesuai',  color: '#f0c93a' },
  { min: 20, max: 39,  label: 'Kurang Sesuai', color: '#e87d2f' },
  { min: 0,  max: 19,  label: 'Tidak Sesuai',  color: '#c92a2a' },
];
```

### 5.4 Data & Keamanan Data Sensitif
- Data di folder `data/` adalah **data asli** (bukan mock), kecuali yang secara eksplisit ditandai
- `JML_JIWA` dari folder DAMPAK adalah hasil **analisis dasymetric raster** — ini sumber populasi baseline ($P_0$)
- `KLS_BENC` adalah kelas bencana: "Rendah", "Sedang", "Tinggi"
- **POLA RUANG RTRW V2 (Data Sensitif)**: 
  - Gunakan dataset WGS84 (EPSG:4326) yang telah ter-dissolve di `data/POLA RUANG V2/POLA RUANG.geojson`.
  - Gunakan **Data Masking**: Kategori umum diklasifikasikan via field `Status` (`Lindung` vs `Budidaya`) dan `JNSRPR` (`31000000` vs `32000000`).
  - Atribut hukum detail/perda tidak diekspos mentah.
- **TPS Eksisting**: Menggunakan format standar di `data/TEMPLATE/template_tps_eksisting.csv` dan `template_tps_eksisting.geojson`
- Aplikasi HARUS berjalan normal dengan **default 0 TPS** (empty-state)
- Parser upload TPS harus toleran terhadap alias header (`lat`/`latitude`/`Y`, `lon`/`lng`/`longitude`/`X`) dan memvalidasi rentang bounding box Banjarnegara (-7.55 to -7.20 lat, 109.35 to 109.90 lon)
- Batas Kabupaten di-generate dari **dissolve** semua kecamatan (tidak perlu file terpisah)

```typescript
// Data loader — sesuaikan path dengan struktur folder data/
import kecamatan from '@/data/BOUNDARY/Administrasi Kecamatan.geojson';
import desa from '@/data/BOUNDARY/Administrasi Desa.geojson';
import dampakBanjir from '@/data/DAMPAK/kelas Banjir.geojson';
import dampakLongsor from '@/data/DAMPAK/kelas Longsor.geojson';
import roads from '@/data/DOWNLOAD/jaringan_jalan_banjarnegara.geojson';
import rivers from '@/data/DOWNLOAD/sungai_banjarnegara.geojson';
import waterbodies from '@/data/DOWNLOAD/badan_air_banjarnegara.geojson';
import slope from '@/data/DOWNLOAD/slope_banjarnegara.geojson';
import polaRuang from '@/data/POLA RUANG V2/POLA RUANG.geojson';
// TPS Eksisting: opsional, di-load dari user upload
```

### 5.5 Map
- MapLibre sebagai peta utama
- Peta menempati **~75% layar** — ini elemen visual utama
- Gunakan **vector rendering** (GeoJSON source di MapLibre), bukan raster tiles
- Popup muncul saat **klik**, bukan hover
- Legend selalu visible saat suitability overlay aktif
- Basemap options: Streets, Satellite, Terrain

### 5.6 UI/UX & Modal Bantuan & Rumus
- Desain: **Clean, minimal, government-style, professional**
- Warna utama: Biru tua / navy (government feel)
- **Map-centric** — peta dominan, sidebar kompak
- Banyak whitespace, tidak ramai
- Responsive (desktop-first, tapi tetap usable di tablet)
- Semua label UI dalam **Bahasa Indonesia**
- **Modal "Bantuan & Rumus"**: Tombol di header kanan atas untuk membuka dokumentasi interaktif (Dasar Regulasi SNI/Permen PU, Flowchart Logika Spasial, Kamus Data, Formula WLC & Forecasting, dan Tombol Print Laporan Teknis).
- Font: Inter atau system font stack

---

## 6. Workflow Analisis Spasial & Forecasting

Saat user klik "Hitung" atau mengubah parameter bobot/radius/tahun perencanaan:

```
1. Load GeoJSON data (Boundary, Populasi Dasymetric, Slope, Jalan, Sungai, Pola Ruang, Kebencanaan)
2. Apply Population Forecasting:
   → Pt = P0 × (1 + r)^t
   → Hitung estimasi timbulan sampah: Qt = Pt × 2.5 liter/hari
3. Apply Hard Constraint Analysis:
   → Area dalam badan air, sempadan sungai terlarang (<50m), slope >40%, dan Kawasan Lindung diberi status Constraint (Skor = 0)
4. Normalize & Score Parameter (WLC) untuk Area Non-Constraint:
   - Kepadatan Penduduk (25%) : Semakin padat (Pt) -> Skor 0-100
   - Aksesibilitas Jalan (20%) : Jarak ke jalan -> Skor 0-100
   - Kemiringan Lereng (15%)  : 0-8% (100), 8-15% (80), 15-25% (50), 25-40% (20)
   - Kesesuaian RTRW (15%)    : Kawasan Budidaya (100), lainnya (30)
   - Risiko Longsor (15%)     : Rendah (100), Sedang (60), Tinggi (30) [Soft scoring penalti]
   - Risiko Banjir (5%)       : Rendah (100), Sedang (60), Tinggi (20) [Soft scoring penalti]
   - Buffer Lingkungan (5%)   : Jarak dari sungai/badan air -> Skor 0-100
5. Hitung Suitability Score = Σ (Parameter_i × Weight_i / 100) -> Range 0–100
6. Kategorikan (Sangat Sesuai s/d Tidak Sesuai)
7. Hitung Service Coverage (Buffer TPS Eksisting jika ada data ter-upload)
8. Hitung Service Gap (Area permukiman di luar buffer TPS beserta populasi Pt di area gap)
9. Update Layer Overlay di MapLibre GL JS
10. Update KPI Bar & Ringkasan Data (Coverage %, Gap Population, Total Timbulan Sampah)
```

Semua langkah dilakukan di browser secara sinkron. Jika data besar dan performa bermasalah, gunakan Web Worker.

---

## 7. Hal yang TIDAK BOLEH Dilakukan

1. **Jangan membuat backend/API** — semua client-side
2. **Jangan membuat database** — data dari GeoJSON statis
3. **Jangan membuat halaman terpisah** — ini single page application (modal untuk Bantuan & Rumus)
4. **Jangan membuat sistem authentication** — tidak ada login
5. **Jangan membuat scenario analysis engine rumit** — cukup suitability overlay & forecasting slider
6. **Jangan membuat AI/LLM integration** — cukup template text & static formulas
7. **Jangan hard-code weight/threshold** — harus parameter
8. **Jangan mengasumsi ada TPS Eksisting** — default adalah 0 TPS
9. **Jangan membuat dashboard penuh card** — fokus pada peta
10. **Jangan menggunakan Leaflet** — gunakan MapLibre
11. **Jangan menggunakan data Pola Ruang UTM** — gunakan versi WGS84 yang sudah disiapkan
12. **Jangan mengekspos raw atribut sensitif POLA RUANG** — gunakan data masking (`Status: Lindung/Budidaya`)

---

## 8. Hal yang HARUS Dilakukan

1. **Peta harus elemen utama** — minimal 75% layar
2. **Semua parameter configurable** via sidebar (termasuk slider tahun proyeksi $t=0-5$)
3. **Scoring & Forecasting engine sebagai pure functions** terpisah dari UI
4. **Mock data realistis** mengikuti geometri Banjarnegara
5. **Modal "Bantuan & Rumus"** lengkap dengan rumus matematika, dasar hukum SNI/Permen, dan kamus data
6. **Disclaimer** harus tampil di UI
7. **Label Euclidean** pada service coverage
8. **Bahasa Indonesia** untuk semua teks UI
9. **Responsive** — desktop-first tapi usable di tablet
10. **Weight total harus selalu = 100%** — validasi di UI
11. **Warna peta konsisten** dengan tabel kategori kesesuaian

---

## 9. Prioritas Development

```
Phase 1: Fondasi
├── Setup Next.js + TypeScript + Tailwind + shadcn/ui
├── MapLibre — peta dasar Banjarnegara
├── GeoJSON Layer — batas administrasi, jalan, hidrologi, pola ruang WGS84
├── Sidebar — layer toggle & filter wilayah
├── Layout — header (dengan tombol Bantuan & Rumus), sidebar, map, KPI bar
└── Layer overlay dasar (administrasi, TPS)

Phase 2: Analisis, Forecasting & Transparansi
├── Pure engine (constraint, WLC scoring, forecasting Pt & Qt, service coverage/gap)
├── Suitability overlay (gradient warna di peta)
├── Service coverage (buffer TPS) & Service gap overlay
├── Sliders kontrol (Weight sliders, radius slider, planning horizon slider 0-5 thn)
├── Popup info saat klik (skor, populasi eksisting & terproyeksi, timbulan sampah)
├── Modal "Bantuan & Rumus" (Dokumentasi metode, regulasi SNI, kamus data & print view)
├── KPI bar dinamis (data dari hasil analisis & timbulan sampah)
└── Legend & Disclaimer
```

Fokus selesaikan Phase 1 terlebih dahulu sebelum lanjut ke Phase 2.

---

## 10. Referensi

- PRD: [`prd.md`](./prd.md)
- MapLibre: https://maplibre.org/maplibre-gl-js/docs/
- Turf.js: https://turfjs.org/
- shadcn/ui: https://ui.shadcn.com/

