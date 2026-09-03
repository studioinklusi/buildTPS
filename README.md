# 🗺️ Inklusi TPS Spatial Intelligence — WebGIS Kabupaten Banjarnegara

> **WebGIS Interaktif & Spatial Decision Support System (SDSS) untuk Identifikasi, Pembobotan, dan Visualisasi Prioritas Pembangunan TPS Baru Berbasis Data Geospasial di Kabupaten Banjarnegara, Jawa Tengah.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![MapLibre GL JS](https://img.shields.io/badge/MapLibre_GL_JS-4.0-3969EC?style=flat&logo=maplibre)](https://maplibre.org/)
[![Turf.js](https://img.shields.io/badge/Turf.js-Spatial_Engine-green?style=flat)](https://turfjs.org/)
[![Deploy with Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat&logo=vercel)](https://vercel.com/)

---

## 📌 Ringkasan Proyek

Penentuan lokasi Tempat Penampungan Sementara (TPS) sampah seringkali dilakukan tanpa integrasi data spasial yang komprehensif. **Inklusi TPS Spatial Intelligence** hadir sebagai peta overlay interaktif satu halaman (*Single Page WebGIS*) yang mengintegrasikan data tata ruang, kepadatan penduduk (*dasymetric*), topografi, aksesibilitas jaringan jalan, serta risiko kebencanaan (longsor & banjir) untuk memberikan rekomendasi objektif berbasis bukti (*evidence-based policy*).

### 🎯 3 Pertanyaan Utama yang Dijawab:
1. **Di mana wilayah yang saat ini belum terlayani oleh TPS?** $\rightarrow$ *Service Gap Overlay*
2. **Di area yang belum terlayani, mana lokasi yang paling optimal untuk pembangunan TPS baru?** $\rightarrow$ *Multi-Criteria Suitability Overlay*
3. **Berapa banyak populasi masyarakat yang berpotensi terlayani jika TPS baru dibangun?** $\rightarrow$ *Population Coverage & KPI*

---

## ✨ Fitur Utama

- 🗺️ **Peta Interaktif WebGL (MapLibre GL JS)**: Rendering data vektor berkecepatan tinggi dengan akselerasi GPU, mendukung basemap satelit, street, dan terrain.
- ⚖️ **Multi-Criteria Decision Analysis (WLC)**: Pembobotan kriteria spasial interaktif dengan slider bobot (Kepadatan Penduduk 25%, Jalan 20%, Slope 15%, RTRW 15%, Longsor 15%, Banjir 5%, Buffer 5%).
- 📈 **Forecasting Populasi & Timbulan Sampah ($t = 0 - 5$ Tahun)**: Slider horizon perencanaan pembangunan dinamis ($P_t = P_0 (1+r)^t$) dan estimasi volume timbulan sampah harian ($Q_t = P_t \times 2.5\text{ liter/hari}$) untuk memproyeksikan kebutuhan kapasitas kontainer TPS.
- 📖 **Modul "Bantuan & Rumus" (White-Box SDSS)**: Modal interaktif transparan bagi DLH & Bappeda yang merangkum dasar hukum (SNI 19-3983-1995 & Permen PU No. 03/PRT/M/2013), kamus data (*data dictionary*), logika kalkulasi WLC, dan fitur cetak laporan teknis (*print-friendly*).
- 🛡️ **Logika Spasial Realistis Banjarnegara**:
  - **Hard Constraint (Eliminasi Mutlak = 0)**: Badan air, sempadan sungai terlarang ($<50$ m), lereng ekstrem ($>40\%$), dan Pola Ruang Kawasan Lindung.
  - **Soft Scoring (Penalti Gradasi)**: Zona rawan longsor regional diberi penalti nilai bertingkat (bukan dieliminasi 0), sehingga kecamatan pegunungan di Banjarnegara utara dan selatan tetap mendapatkan rekomendasi prioritas yang realistis.
- ⭕ **Service Coverage & Gap Analysis**: Buffer radius dinamis dari TPS eksisting (default 1 km) untuk memvisualisasikan wilayah yang belum terlayani (*service gap*).
- 📥 **Input Dinamis TPS Eksisting**: Fitur upload data CSV/GeoJSON langsung di browser, dilengkapi template resmi (`template_tps_eksisting.csv`), auto-detect nama kolom, dan validasi koordinat batas Banjarnegara.
- 📊 **KPI Bar Ringkas**: Ringkasan persentase populasi terlayani, estimasi jumlah penduduk di service gap, total timbulan sampah, dan total fasilitas persampahan.
- ⚡ **100% Client-Side Computation (Zero Database / Zero Backend)**: Seluruh kalkulasi spasial berjalan langsung di browser pengguna menggunakan **Turf.js** — hemat biaya, zero-latency, dan siap dideploy ke Vercel Free Tier.

---

## 🏗️ Arsitektur & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js (App Router)                     │
│               Single Page Application (SPA/SSG)             │
├──────────────────────────────┬──────────────────────────────┤
│           UI Layer           │          Map Layer           │
│  - Tailwind CSS + shadcn/ui  │  - MapLibre GL JS (WebGL)    │
│  - Sidebar & Sliders (WLC,   │  - Vector Layer Management   │
│    Radius, Planning Horizon) │  - Popups & Thematic Legend  │
│  - Bantuan & Rumus Modal     │  - Dynamic KPI Summary Bar   │
├──────────────────────────────┴──────────────────────────────┤
│               Spatial Engine (Client-Side)                  │
│  - Turf.js (Buffer, Distance, Intersection, Area)           │
│  - Weighted Linear Combination (WLC) Scoring Engine         │
│  - Population & Waste Generation Forecasting Engine (Pt, Qt)│
│  - Constraint Filtering & Service Gap Analyzer              │
├──────────────────────────────┬──────────────────────────────┤
│         Data Layer           │       Client Persistence     │
│  - Static GeoJSON in public/ │  - IndexedDB / localStorage  │
│  - On-demand Lazy Loading    │  - TPS Uploaded Session      │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 📂 Struktur Folder

```
rekomtps/
├── data/                                 # Sumber data geospasial asli
│   ├── BOUNDARY/                         # Batas Administrasi Kecamatan & Desa
│   ├── DAMPAK/                           # Populasi Dasymetric & Risiko Bencana
│   ├── DOWNLOAD/                         # Unduhan OSM (Jalan, Sungai) & GEE (Slope)
│   ├── KELAS DAN INDEKS BENCANA/         # Peta Risiko Bencana
│   ├── POLA RUANG V2/                    # Rencana Pola Ruang WGS84 (RTRW)
│   └── TEMPLATE/                         # Template CSV & GeoJSON Input TPS
├── notebooks/                            # Google Colab Data Preprocessing
│   ├── download_osm_banjarnegara.ipynb   # Download Jalan & Hidrologi (OSMnx)
│   └── download_dem_slope_banjarnegara.ipynb # Download DEM & Slope (GEE)
├── src/                                  # Source Code WebGIS (Next.js)
│   ├── app/                              # Next.js App Router
│   ├── components/                       # Komponen UI & Peta
│   │   ├── map/                          # Komponen MapLibre
│   │   ├── sidebar/                      # Sidebar, Filter & Sliders
│   │   ├── modal/                        # Modal Bantuan & Rumus (SNI, Data Dict, Print)
│   │   ├── kpi/                          # KPI Bar
│   │   └── ui/                           # Komponen shadcn/ui
│   ├── engine/                           # Pure Spatial Analysis & Forecasting Engine
│   │   ├── constraint.ts                 # Hard Constraint Filter
│   │   ├── scoring.ts                    # WLC Scoring Engine
│   │   ├── coverage.ts                   # Service Coverage & Gap
│   │   ├── forecasting.ts                # Population & Waste Forecasting (Pt, Qt)
│   │   └── types.ts                      # TypeScript Definitions
│   └── lib/                              # Constants, Colors & Helpers
├── agent.md                              # Panduan Aturan Pengembangan AI Agent
├── prd.md                                # Product Requirement Document (PRD)
└── README.md                             # Dokumentasi Utama Proyek
```

---

## 🚀 Panduan Memulai (Development)

### Prasyarat:
- [Node.js](https://nodejs.org/) versi 18.x atau 20.x
- Package manager: `npm` atau `pnpm`

### 1. Kloning Repositori & Masuk Direktori:
```bash
cd U:/Project/rekomtps
```

### 2. Install Dependensi:
```bash
npm install
```

### 3. Jalankan Development Server:
```bash
npm run dev
```
Buka browser di `http://localhost:3000` untuk melihat aplikasi WebGIS.

---

## 🌐 Panduan Deployment ke Vercel

Aplikasi ini dirancang **100% statis & client-side**, sehingga dapat dideploy secara instan ke [Vercel](https://vercel.com/) tanpa konfigurasi server atau database:

1. Push repository ke GitHub:
   ```bash
   git add .
   git commit -m "feat: complete Inklusi TPS WebGIS"
   git push origin main
   ```
2. Buka dashboard [Vercel](https://vercel.com/) $\rightarrow$ **Add New Project** $\rightarrow$ Import repositori GitHub Anda.
3. Klik **Deploy** (Framework Preset otomatis terdeteksi sebagai Next.js).
4. Aplikasi akan live dalam hitungan detik dengan kompresi Edge CDN Brotli/Gzip otomatis!

---

## 📊 Format Input Template TPS Eksisting

Pengguna di Dinas Lingkungan Hidup (DLH) dapat mengunggah titik sebaran TPS eksisting menggunakan file CSV dengan format standar:

```csv
nama_tps,kecamatan,desa,latitude,longitude,status,kapasitas_m3,keterangan
TPS Pasar Banjarnegara,Banjarnegara,Kutabanjarnegara,-7.398512,109.697415,Aktif,12,TPS Kontainer Pasar
TPS Karangkobar 1,Karangkobar,Karangkobar,-7.283145,109.712530,Aktif,6,TPS Pemukiman
TPS Mandiraja Wetan,Mandiraja,Mandiraja Wetan,-7.468920,109.512400,Perlu Evaluasi,8,Dekat saluran air
```

File template dapat diunduh langsung di folder [`data/TEMPLATE/template_tps_eksisting.csv`](file:///U:/Project/rekomtps/data/TEMPLATE/template_tps_eksisting.csv).

---

## ⚖️ Disclaimer

> *Hasil visualisasi dan rekomendasi spasial pada aplikasi ini merupakan alat bantu pengambilan keputusan berbasis indikasi data geospasial dan **bukan** merupakan pengganti survei teknis lapangan, analisis kelayakan lingkungan (AMDAL/UKL-UPL), kepemilikan lahan resmi, maupun keputusan hukum pemerintah yang berwenang.*

---

## 📄 Lisensi & Hak Cipta

© 2026 **PT. INKLUSI TEKNOLOGI STRATEGIS**  
📞 WhatsApp / HP: **+62 881-0108-90925**  

Dikembangkan untuk mendukung perencanaan pengelolaan persampahan berkelanjutan di Kabupaten Banjarnegara, Jawa Tengah.
