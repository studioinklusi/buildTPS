# PRD — Inklusi TPS Spatial Intelligence

## 1. Ringkasan Proyek

| Item | Detail |
|---|---|
| Nama | Inklusi TPS Spatial Intelligence |
| Tipe | WebGIS — Peta Overlay Interaktif |
| Lokasi | Kabupaten Banjarnegara, Jawa Tengah |
| Tujuan | Memvisualisasikan prioritas lokasi pembangunan TPS berbasis data spasial |

Aplikasi ini adalah **peta overlay interaktif** yang menggabungkan data tata ruang, lingkungan, topografi, aksesibilitas, permukiman, dan fasilitas persampahan untuk memberikan **rekomendasi visual** di mana pembangunan TPS paling perlu diintervensi.

**Bukan** sistem manajemen data, bukan platform analisis multi-skenario, bukan decision support system lengkap. Ini adalah **alat visualisasi berbasis data** yang membantu pengambil keputusan melihat gambaran prioritas secara spasial.

---

## 2. Masalah

Penentuan lokasi TPS baru sering dilakukan tanpa integrasi data spasial yang memadai:

- Sulit melihat hubungan antara lokasi TPS dengan konsentrasi permukiman secara visual
- Belum ada peta yang menunjukkan di mana service gap terbesar
- Evaluasi kelayakan lokasi belum mempertimbangkan banyak faktor bersamaan (slope, bencana, akses, tata ruang)
- Tidak ada gambaran visual prioritas: area mana yang paling mendesak untuk diintervensi

---

## 3. Target Pengguna

| Pengguna | Kebutuhan Utama |
|---|---|
| Dinas Lingkungan Hidup (DLH) | Melihat prioritas & gap layanan TPS kabupaten-wide |
| Pemerintah Kecamatan | Melihat kondisi persampahan di wilayah kecamatannya |
| Pemerintah Desa/Kelurahan | Melihat apakah wilayahnya sudah terlayani TPS |
| Konsultan / GIS Analyst | Mengeksplorasi data dan mengatur parameter analisis |

---

## 4. Pertanyaan yang Harus Dijawab Peta

1. **Di mana wilayah yang belum terlayani TPS?** → Service Gap Overlay
2. **Di area yang belum terlayani, mana yang paling sesuai untuk TPS baru?** → Suitability Overlay
3. **Berapa banyak penduduk di wilayah yang belum terlayani?** → KPI & Popup Info

---

## 5. Fitur Utama

### 5.1 Peta Interaktif

Peta adalah elemen utama dan menempati ~75% layar.

Fungsi dasar peta:
- Zoom, pan, search lokasi
- Basemap switcher (satelit, street, terrain)
- Fullscreen
- Legend
- Geolocation (jika tersedia)

### 5.2 Layer Overlay

Layer yang bisa di-toggle on/off:

**Administratif:**
- Batas Kabupaten
- Batas Kecamatan
- Batas Desa/Kelurahan

**Infrastruktur Persampahan:**
- TPS Eksisting (titik)
- TPA, TPST, TPS3R (titik)

**Permukiman & Populasi:**
- Area permukiman
- Kepadatan penduduk (choropleth per desa)

**Lingkungan & Topografi:**
- Sungai & badan air
- Slope (kemiringan lereng)
- Risiko banjir
- Risiko longsor
- Tutupan lahan

**Tata Ruang:**
- RTRW (kawasan lindung & budidaya)

**Layer Analisis (computed):**
- Suitability overlay (gradient warna)
- Service coverage (buffer dari TPS eksisting)
- Service gap (area belum terlayani)

### 5.3 Sidebar Kontrol

Sidebar kiri berisi:
- Dropdown Kecamatan & Desa (filter/zoom)
- Toggle layer (checkbox)
- Slider radius layanan (default: 1 km)
- **Slider Horizon Perencanaan Pembangunan** (0 s/d 5 tahun, default: 0 tahun / saat ini)
- **Input Laju Pertumbuhan Penduduk** (default: 0.8% / tahun dari BPS)
- Slider weight parameter analisis (total harus 100%)
- Tombol "Hitung Ulang"

### 5.4 Popup Informasi

Saat klik area di peta, tampilkan popup berisi:
- Lokasi (Desa, Kecamatan)
- Skor kesesuaian (0–100)
- Kategori (Sangat Sesuai / Sesuai / Cukup / Kurang / Tidak Sesuai)
- Populasi area (saat ini & proyeksi tahun ke-$t$)
- Estimasi timbulan sampah ($m^3$/hari)
- Jarak ke jalan terdekat
- Jarak ke TPS terdekat
- Tingkat risiko bencana
- Status tata ruang (Pola Ruang RTRW)

### 5.5 KPI Bar

Bar ringkas di bagian bawah peta:
- Total TPS Eksisting
- Persentase populasi terlayani
- Populasi di service gap (baseline & terproyeksi)
- Estimasi total timbulan sampah ($m^3$/hari)
- Luas area sangat sesuai

### 5.6 Modul "Bantuan & Rumus" (Transparansi Model & Metodologi)

Tombol **`📖 Bantuan & Rumus`** di header membuka modal/drawer interaktif untuk transparansi model (*White-Box System*) bagi DLH, Bappeda, dan dinas teknis:
1. **Dasar Hukum & Regulasi**: Standar SNI 19-3983-1995, Permen PU No. 03/PRT/M/2013, dan Perda RTRW Kab. Banjarnegara.
2. **Logika Pemodelan Spasial**: Diagram alir 2 tahap (Hard Constraint & WLC Multi-Criteria).
3. **Kamus Data & Variabel (*Data Dictionary*)**: Tabel sumber data (BPS, OSM, Dasymetric, RTRW), rentang normalisasi, dan bobot.
4. **Rumus Matematika**: Formula eksplisit WLC, forecasting populasi ($P_t$), timbulan sampah ($Q_t$), dan buffer coverage.
5. **Print-Friendly / Export PDF**: Tombol cetak untuk langsung dijadikan lampiran laporan dinas resmi.

---

## 6. Logika Analisis Spasial

Pendekatan SDSS membedakan secara tegas antara **Hard Constraint** (eliminasi mutlak) dan **Soft Scoring** (pembobotan bertingkat / penalti gradasi). Hal ini krusial agar wilayah pegunungan Banjarnegara (utara & selatan) yang secara umum berada di zona rawan longsor regional tidak tereliminasi total dan tetap mendapatkan rekomendasi prioritas yang realistis.

### 6.1 Hard Constraint (Eliminasi Fisik Mutlak = Skor 0)

Area yang otomatis **dikecualikan mutlak** (tidak layak dibangun TPS):
1. **Badan Air & Sungai**: Berada tepat di dalam polygon badan air atau garis sungai.
2. **Sempadan Sungai Terlarang**: Buffer sungai (configurable, default: 50–100 m).
3. **Kemiringan Lereng Ekstrem**: Slope > 40% (Kelas 5 / tebing curam berbahaya).
4. **Kawasan Lindung Inti**: Cagar alam mutlak berdasarkan RTRW.

> **Catatan:** Zona risiko bencana longsor regional **TIDAK** dijadikan *Hard Constraint*, melainkan dikelola via *Soft Scoring (Graded Penalty)* di bawah ini.

### 6.2 Multi-Criteria Suitability Scoring (WLC)

Metode: **Weighted Linear Combination (WLC)**
Semua parameter non-constraint dinormalisasi ke skala 0–100, lalu dihitung bobotnya:

$$\text{Suitability Score} = \sum (\text{Skor Parameter}_i \times \text{Bobot}_i)$$

| Parameter | Default Bobot | Aturan Skor & Normalisasi (0–100) |
|---|---|---|
| **Kepadatan Penduduk (Dasymetric)** | 25% | Semakin padat populasi (`JML_JIWA`), skor semakin mendekati 100 |
| **Aksesibilitas Jalan** | 20% | Jarak ke jalan: <100m (100), 100-300m (80), 300-500m (60), >1km (20) |
| **Kemiringan Lereng (Slope)** | 15% | 0–8% Datar (100), 8–15% Landai (80), 15–25% Agak Curam (50), 25–40% Curam (20) |
| **Kesesuaian Tata Ruang (RTRW)** | 15% | Kawasan Budidaya/Permukiman (100), Pertanian/Kebun (70), Lainnya (30) |
| **Risiko Bencana Longsor (Penalti)** | 15% | **Rendah (100), Sedang (60), Tinggi (30)** *(Bukan 0, agar daerah atas tetap terakomodasi)* |
| **Risiko Bencana Banjir (Penalti)** | 5% | Rendah (100), Sedang (60), Tinggi (20) |
| **Jarak Sempadan / Buffer Lingkungan** | 5% | Semakin jauh dari sempadan sungai/badan air, skor semakin tinggi |

**Total Bobot = 100%** (Dapat dikonfigurasi secara dinamis oleh pengguna melalui slider).

### Justifikasi Khusus Risiko Longsor Banjarnegara:
Karena >60% wilayah Banjarnegara (terutama kecamatan utara seperti Karangkobar, Batur, Wanayasa, Kalibening) masuk ke zona risiko longsor tinggi, pemberian skor **30 (penalti bertingkat)** pada zona merah memastikan:
- Wilayah padat di pegunungan tetap bisa mendapat rekomendasi jika lereng lokalnya landai & akses jalan baik (skor akhir ~60–75).
- Wilayah datar di lembah tengah (Purwanegara, Bawang, Klampok) otomatis mendapatkan skor tertinggi (~80–95).
- Rekomendasi di zona risiko tinggi akan disertai catatan mitigasi (misal: konstruksi kontainer angkut cepat / *retaining wall*).

### 6.3 Kategori Kesesuaian Lokasi

| Skor | Kategori | Warna di Peta |
|---|---|---|
| 80–100 | Sangat Sesuai | Hijau tua |
| 60–79 | Sesuai | Hijau muda |
| 40–59 | Cukup Sesuai | Kuning |
| 20–39 | Kurang Sesuai | Oranye |
| 0–19 | Tidak Sesuai | Merah |

Threshold kategori configurable.

### 6.4 Service Coverage & Gap

- Buffer radius dari setiap TPS eksisting (default: 1 km, adjustable)
- **Metode: Euclidean distance** (garis lurus)
- Area di luar semua buffer = **Service Gap**
- Hitung populasi di dalam dan di luar coverage

> **Catatan:** Radius menggunakan jarak garis lurus, bukan jarak tempuh via jalan. Di daerah berbukit seperti Banjarnegara, jarak tempuh sebenarnya bisa lebih jauh. Label ini harus tampil di UI.

### 6.5 Proyeksi Kependudukan & Timbulan Sampah (Forecasting Multi-Tahun)

Untuk mendukung perencanaan pembangunan jangka pendek dan menengah ($t = 0 \text{ s/d } 5 \text{ tahun}$):
1. **Model Pertumbuhan Geometrik**:
   $$P_t = P_0 \times (1 + r)^t$$
   - $P_0$: Populasi baseline dari data spasial dasymetric (`JML_JIWA`).
   - $r$: Laju pertumbuhan tahunan (default: $0.8\%$/tahun, berdasarkan statistik BPS Banjarnegara, dapat diatur via slider).
   - $t$: Horizon tahun perencanaan ($0, 1, 2, 3, 4, 5$ tahun).
2. **Estimasi Timbulan Sampah ($Q_t$)**:
   $$Q_t = P_t \times q$$
   - $q$: Standar timbulan sampah per kapita ($2.5 \text{ liter/jiwa/hari}$ atau $\approx 0.6 \text{ kg/jiwa/hari}$ sesuai SNI 19-3983-1995).
3. **Evaluasi Kebutuhan Kapasitas Kontainer TPS**:
   Sistem memproyeksikan kecukupan kapasitas volume tampung ($m^3/\text{hari}$) dari TPS eksisting vs timbulan sampah masa depan di tiap klaster layanan.

---

## 7. Data

### 7.1 Strategi Data

Semua data di-load sebagai file GeoJSON statis. Tidak ada database. Data menggunakan sumber resmi dan OSM, bukan mock.

### 7.2 Dataset yang Sudah Tersedia

| # | Dataset | File | Properties Utama | CRS |
|---|---|---|---|---|
| 1 | Batas Kecamatan | `data/BOUNDARY/Administrasi Kecamatan.geojson` | `KECAMATAN` | WGS84 ✅ |
| 2 | Batas Desa | `data/BOUNDARY/Administrasi Desa.geojson` | `DESA` | WGS84 ✅ |
| 3 | Risiko Banjir + Populasi | `data/DAMPAK/kelas Banjir.geojson` | `NAMA_DESA`, `NAMA_KEC`, `KLS_BENC`, `LUAS_HA`, `JML_JIWA` | WGS84 ✅ |
| 4 | Risiko Longsor + Populasi | `data/DAMPAK/kelas Longsor.geojson` | `NAMA_DESA`, `NAMA_KEC`, `KLS_BENC`, `LUAS_HA`, `JML_JIWA` | WGS84 ✅ |
| 5 | Jaringan Jalan (OSM) | `data/DOWNLOAD/jaringan_jalan_banjarnegara.geojson` | `highway`, `name`, `length`, `road_class`, `road_class_label` | WGS84 ✅ |
| 6 | Sungai (OSM) | `data/DOWNLOAD/sungai_banjarnegara.geojson` | `waterway`, `name` | WGS84 ✅ |
| 7 | Badan Air (OSM) | `data/DOWNLOAD/badan_air_banjarnegara.geojson` | `natural`, `name`, `water` | WGS84 ✅ |
| 8 | Indeks Banjir (raster) | `data/KELAS DAN INDEKS BENCANA/INDEKS BENCANA 30/Indeks_Banjir.tif` | Kontinu | - |
| 9 | Indeks Longsor (raster) | `data/KELAS DAN INDEKS BENCANA/INDEKS BENCANA 30/Indeks_Longsor.tif` | Kontinu | - |
| 10 | Pola Ruang (RTRW V2) | `data/POLA RUANG V2/POLA RUANG.geojson` (atau `new/Pola Ruang 4336.geojson`) | `NAMOBJ`, `JNSRPR`, `Status` | WGS84 ✅ |

**Catatan penting:**
- `JML_JIWA` di folder DAMPAK adalah hasil analisis **dasymetric raster** — digunakan sebagai sumber data populasi baseline ($P_0$)
- Batas Kabupaten di-generate otomatis via dissolve dari `Administrasi Kecamatan.geojson`
- Dataset Pola Ruang RTRW V2 telah berformat WGS84 (EPSG:4326) dengan 13 klasifikasi zona dan atribut `Status` (`Lindung` vs `Budidaya`)

### 7.3 Dataset Tambahan & Notebook Pendukung

| # | Dataset | Sumber | Cara / Notebook |
|---|---|---|---|
| 1 | Jaringan Jalan, Sungai & Badan Air | OpenStreetMap | `notebooks/download_osm_banjarnegara.ipynb` ✅ (sudah di-download) |
| 2 | DEM & Kelas Slope (Vektor Ringan) | SRTM/Copernicus 30m | `notebooks/download_dem_slope_banjarnegara.ipynb` |
| 3 | Tutupan Lahan (Land Cover) | GEE (ESA WorldCover) | Google Earth Engine (Opsional) |

### 7.4 TPS Eksisting — Input Dinamis & Standar Format

Data TPS Eksisting **bersifat dinamis** dan diinput oleh pengguna/DLH via antarmuka web.

- **Kondisi Awal (Default):** 0 TPS → service coverage = 0%, service gap = 100%, status: *"Belum ada data TPS Eksisting. Unduh template dan unggah data untuk melihat service coverage."*
- **Kondisi Setelah Upload:** Sistem langsung melakukan perhitungan spasial (buffer radius & gap analysis) secara real-time di browser.

#### Skema Kolom Template (CSV & GeoJSON):
File template tersedia di `data/TEMPLATE/template_tps_eksisting.csv` dan `template_tps_eksisting.geojson`.

| Kolom | Wajib? | Tipe Data | Keterangan & Aturan |
|---|---|---|---|
| `nama_tps` | 🔴 Ya | String | Nama/kode TPS |
| `latitude` | 🔴 Ya | Float | Lintang desimal (koordinat Y), rentang Banjarnegara: -7.55 s/d -7.20 |
| `longitude` | 🔴 Ya | Float | Bujur desimal (koordinat X), rentang Banjarnegara: 109.35 s/d 109.90 |
| `kecamatan` | 🟡 Tidak | String | Nama kecamatan lokasi TPS |
| `desa` | 🟡 Tidak | String | Nama desa/kelurahan lokasi TPS |
| `status` | 🟡 Tidak | String | Nilai: `Aktif`, `Tidak Aktif`, `Perlu Evaluasi` (default: `Aktif`) |
| `kapasitas_m3` | 🟡 Tidak | Float | Kapasitas tampung harian ($m^3$) |
| `keterangan` | 🟡 Tidak | String | Catatan lapangan / tipe fasilitas |

#### Fitur Validasi Upload:
1. **Penyedia Template:** Tombol "Unduh Template CSV" langsung di UI.
2. **Fleksibilitas Header:** Alias otomatis untuk kolom lat/long (`lat`, `LAT`, `latitude`, `Y` dan `lon`, `lng`, `longitude`, `X`).
3. **Pengecekan Koordinat:** Deteksi otomatis koordinat tertukar atau di luar batas wilayah Banjarnegara.

### 7.5 Keamanan Data Sensitif (Pola Ruang / RTRW)

Untuk melindungi data tata ruang resmi pemerintah kabupaten dari risiko *scraping* atau kebocoran dokumen legal:
1. **Metode Pre-Scoring**: Nilai kesesuaian tata ruang di-intersect langsung ke level unit analisis spasial (`skor_tataruang`), sehingga raw masterplan shapefile tidak diekspos mentah ke publik.
2. **Data Masking & Generalisasi**: Layer visual Pola Ruang di peta disederhanakan dengan atribut `Status` yang jelas:
   - **Kawasan Lindung / Non-Budidaya** (`Status: Lindung` / `JNSRPR: 31000000` — Merah / Constraint)
   - **Kawasan Budidaya / Permukiman** (`Status: Budidaya` / `JNSRPR: 32000000` — Hijau / Sesuai)
   Atribut hukum sensitif, nomor perda detail, dan kepemilikan persil tidak diekspos ke publik.

---

## 8. Tech Stack & Strategi Deployment

| Komponen | Teknologi | Alasan & Peran |
|---|---|---|
| **Framework** | Next.js (App Router) + TypeScript | Static Site Generation (SSG), performa tinggi, zero-server cost |
| **Styling** | Tailwind CSS + shadcn/ui | Desain modern, clean, government-tech, map-centric |
| **Map Engine** | MapLibre GL JS | GPU-accelerated WebGL vector rendering, rendering layer besar sangat smooth |
| **Spatial Engine** | Turf.js (Client-side) | Buffer, intersection, distance calculation, dan WLC scoring 100% di browser |
| **Data Storage** | Static GeoJSON di `public/data/` | Data di-load via *on-demand fetch* per layer (lazy-loading) |
| **Session Upload** | `IndexedDB` / `localStorage` | Menyimpan data TPS hasil upload dinas di browser lokal pengguna |
| **Platform Deploy** | Vercel (Free Tier) | CDN Edge otomatis dengan kompresi Brotli/Gzip bawaan |

### 8.1 Arsitektur: 100% Client-Side (Tanpa Backend / Database)
- ❌ **Tidak Memerlukan Supabase / PostgreSQL / PostGIS**
- ❌ **Tidak Memerlukan Python Backend / Serverless API Functions**
- ✅ **Keuntungan**: Biaya Rp 0 (Gratis selamanya), 0 latency request database, 0 maintenance server, dan aman dari kerentanan database.
- ✅ **Optimasi Vercel**: File GeoJSON besar (seperti jaringan jalan 26 MB) otomatis terkompresi menjadi ~4-6 MB melalui kompresi Brotli/Gzip bawaan Vercel saat ditransfer ke browser pengguna.

---

## 9. Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                │
│  🏛️ Inklusi TPS Spatial Intelligence       [📖 Bantuan & Rumus] [Export]│
├──────────────┬─────────────────────────────────────────────────────────┤
│ SIDEBAR      │              PETA INTERAKTIF                            │
│              │                                                         │
│ Filter:      │   Basemap + Layer Overlay                               │
│ - Kecamatan  │                                                         │
│ - Desa       │   Suitability gradient (WLC)                            │
│              │   Service gap shading                                   │
│ □ Layers     │   ● TPS Eksisting                                       │
│              │                                                         │
│ ◯ Radius TPS │   ┌───────────────────────────────┐                     │
│   (1.0 km)   │   │ Popup: Info lokasi            │                     │
│              │   │ Skor: 85 (Sangat Sesuai)      │                     │
│ 📅 Horizon:  │   │ Populasi (t=0): 3,240 jiwa    │                     │
│   [●──○──○]  │   │ Populasi (t=2): 3,292 jiwa    │                     │
│   (2 Tahun)  │   │ Timbulan: 8.23 m³/hari        │                     │
│              │   │ Jarak TPS: 2.3 km             │                     │
│ Weight       │   └───────────────────────────────┘                     │
│ sliders      │                                                         │
│ [Hitung]     │                                             [Legend]    │
├──────────────┴─────────────────────────────────────────────────────────┤
│ KPI: TPS: 126 │ Terlayani: 58% │ Gap (t=2): 43,240 jiwa │ Timbulan: 2,607 m³/hari
└────────────────────────────────────────────────────────────────────────┘
```

Desain: Clean, minimal, government-style, map-centric, banyak whitespace.

---

## 10. Disclaimer

Tampilkan di footer atau panel info:

> "Hasil visualisasi merupakan rekomendasi berbasis data spasial dan bukan pengganti verifikasi lapangan, kajian teknis, ketentuan tata ruang, maupun keputusan pemerintah yang berwenang. Data yang ditampilkan bersifat indikatif."

Gunakan istilah: "Rekomendasi", "Prioritas", "Indikasi" — **bukan** "Lokasi pasti" atau "Harus dibangun".

---

## 11. Kriteria Sukses

MVP berhasil jika:

1. Peta Banjarnegara tampil dengan basemap dan batas administrasi
2. Layer bisa di-toggle on/off (termasuk Pola Ruang RTRW V2 WGS84)
3. Suitability overlay tampil dengan gradient warna berbasis WLC interaktif
4. Service gap terlihat jelas di peta dengan buffer TPS eksisting
5. Popup info muncul saat klik area (skor, populasi eksisting & terproyeksi, timbulan sampah, risiko)
6. User bisa mengatur weight, radius, dan **slider horizon perencanaan (0-5 tahun)** via sidebar
7. KPI bar menampilkan ringkasan data dan estimasi timbulan sampah
8. Modal **Bantuan & Rumus** interaktif dapat diakses dengan penjelasan rumus, regulasi (SNI/Permen PU), dan kamus data
9. Semua kalkulasi berjalan 100% client-side tanpa backend

---

## 12. Batasan Scope

Berikut hal yang **tidak** termasuk dalam scope proyek ini:

- Database server / backend API
- User authentication / login
- Multi-scenario analysis engine rumit
- AI / LLM integration di dalam app runtime
- Google Earth Engine integration langsung di dalam app
- Network-based routing service area (cukup Euclidean buffer)
- Mobile-native app (cukup responsive web)

---

## 13. Lisensi & Hak Cipta

© 2026 **PT. INKLUSI TEKNOLOGI STRATEGIS**  
📞 WhatsApp / HP: **+62 881-0108-90925**  

Dikembangkan untuk mendukung perencanaan pengelolaan persampahan berkelanjutan di Kabupaten Banjarnegara, Jawa Tengah.