'use client';

import React, { useState } from 'react';
import {
  X,
  Printer,
  Scale,
  GitFork,
  BookOpen,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle,
  Truck,
} from 'lucide-react';

interface HelpAndFormulasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'regulasi' | 'metodologi' | 'kamus' | 'rumus';

export const HelpAndFormulasModal: React.FC<HelpAndFormulasModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('regulasi');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 print:p-0 print:bg-white print:static">
      {/* Modal Container */}
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-h-none print:w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:bg-white print:border-b-2 print:border-black">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 print:hidden shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 print:text-black">
                Bantuan & Metodologi Perhitungan Spasial (White-Box SDSS)
              </h2>
              <p className="text-xs text-slate-500 print:text-gray-600">
                Dokumentasi Transparansi Algoritma, Regulasi, Kamus Data & Formula Matematis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 shadow-2xs transition cursor-pointer"
              title="Cetak lampiran dokumentasi untuk laporan dinas"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/60 px-6 gap-2 print:hidden overflow-x-auto">
          <button
            onClick={() => setActiveTab('regulasi')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'regulasi'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>1. Dasar Hukum & Standar</span>
          </button>

          <button
            onClick={() => setActiveTab('metodologi')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'metodologi'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GitFork className="w-4 h-4" />
            <span>2. Alur Metodologi 2-Tahap</span>
          </button>

          <button
            onClick={() => setActiveTab('kamus')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'kamus'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. Kamus Data & Variabel</span>
          </button>

          <button
            onClick={() => setActiveTab('rumus')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'rumus'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>4. Formula & Rumus Matematis</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 text-slate-700 text-xs leading-relaxed print:text-black print:text-sm">
          {/* TAB 1: REGULASI */}
          {(activeTab === 'regulasi' || typeof window === 'undefined') && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 print:bg-transparent print:border-gray-300">
                <h3 className="text-sm font-bold text-slate-900 print:text-black mb-2 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600 print:text-black" />
                  Landasan Regulasi Penempatan TPS di Indonesia
                </h3>
                <p className="text-slate-600 print:text-gray-700 mb-3">
                  Sistem WebGIS ini dirancang mengacu pada standar teknis persampahan dan tata ruang nasional:
                </p>

                <div className="space-y-3">
                  <div className="border-l-3 border-emerald-500 pl-3 bg-white p-2.5 rounded-r-lg border border-slate-200/70 shadow-2xs">
                    <h4 className="font-bold text-emerald-700 print:text-black">
                      1. UU No. 18 Tahun 2008 tentang Pengelolaan Sampah
                    </h4>
                    <p className="text-[11px] text-slate-600 print:text-gray-700 mt-1">
                      Pasal 19–22 mewajibkan Pemerintah Daerah memfasilitasi dan menyediakan Tempat Penampungan Sementara (TPS) dan Tempat Pengolahan Sampah 3R (TPS 3R) yang memenuhi persyaratan teknis berwawasan lingkungan, higienis, dan mudah diakses armada angkutan.
                    </p>
                  </div>

                  <div className="border-l-3 border-teal-500 pl-3 bg-white p-2.5 rounded-r-lg border border-slate-200/70 shadow-2xs">
                    <h4 className="font-bold text-teal-700 print:text-black">
                      2. SNI 19-3241-1994 & SNI 19-3983-1995 (Spesifikasi Teknis & Timbulan Sampah)
                    </h4>
                    <p className="text-[11px] text-slate-600 print:text-gray-700 mt-1">
                      Menetapkan standar pemilihan lokasi: tidak boleh berada di daerah genangan banjir, sempadan sungai (&lt;50m), sempadan waduk/danau (&lt;100m), dan kawasan lindung air baku. Menetapkan timbulan sampah rata-rata untuk wilayah kabupaten/kota di Pulau Jawa berada pada rentang <b>2.5 hingga 3.0 liter/orang/hari</b> (sistem ini mengadopsi konstanta <b>2.5 L/jiwa/hari</b> atau <b>0.0025 m³/hari</b>).
                    </p>
                  </div>

                  <div className="border-l-3 border-blue-500 pl-3 bg-white p-2.5 rounded-r-lg border border-slate-200/70 shadow-2xs">
                    <h4 className="font-bold text-blue-700 print:text-black">
                      3. Permen Pekerjaan Umum No. 03/PRT/M/2013 (Penyelenggaraan Prasarana Sampah)
                    </h4>
                    <p className="text-[11px] text-slate-600 print:text-gray-700 mt-1">
                      Mengatur kriteria operasional TPS: kemudahan akses jalan kendaraan pengangkut (truk armroll / gerobak motor), radius pelayanan pemukiman ideal (500m pejalan kaki / 1000m kendaraan roda 3), dan larangan berada di daerah rawan bencana geologi.
                    </p>
                  </div>

                  <div className="border-l-3 border-cyan-500 pl-3 bg-white p-2.5 rounded-r-lg border border-slate-200/70 shadow-2xs">
                    <h4 className="font-bold text-cyan-700 print:text-black">
                      4. PP No. 38 Tahun 2011 & Permen PUPR No. 28/PRT/M/2015 (Garis Sempadan Sungai)
                    </h4>
                    <p className="text-[11px] text-slate-600 print:text-gray-700 mt-1">
                      Menetapkan batas sempadan sungai bertanggul/aliran utama minimal <b>50 meter</b> dari palung sungai. Daerah sempadan dilarang dialihfungsikan untuk kegiatan persampahan guna mencegah pencucian lindi (leachate) langsung ke perairan umum.
                    </p>
                  </div>

                  <div className="border-l-3 border-purple-500 pl-3 bg-white p-2.5 rounded-r-lg border border-slate-200/70 shadow-2xs">
                    <h4 className="font-bold text-purple-700 print:text-black">
                      5. Perda RTRW Kabupaten Banjarnegara (Perlindungan Kawasan Lindung)
                    </h4>
                    <p className="text-[11px] text-slate-600 print:text-gray-700 mt-1">
                      Melarang pembangunan sarana persampahan pada Kawasan Lindung (hutan lindung, sempadan mata air, sempadan Waduk Mrica). Lokasi TPS hanya diizinkan pada Kawasan Budidaya (Permukiman, Perkotaan, Perdagangan, atau Pertanian).
                    </p>
                  </div>

                  <div className="border-l-3 border-amber-500 pl-3 bg-white p-2.5 rounded-r-lg border border-slate-200/70 shadow-2xs">
                    <h4 className="font-bold text-amber-700 print:text-black">
                      6. Standar Kemiringan Lereng PUPR & SK Mentan No. 837/1980
                    </h4>
                    <p className="text-[11px] text-slate-600 print:text-gray-700 mt-1">
                      Konstruksi fasilitas umum dilarang pada kemiringan lereng <b>&gt; 40% (Kelas 5 / Sangat Curam)</b> karena bahaya longsor masif dan ketidakmampuan manuver armada pengangkut sampah.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: METODOLOGI */}
          {activeTab === 'metodologi' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <GitFork className="w-4 h-4 text-indigo-600" />
                    Alur Pemodelan Spasial 2-Tahap (Spatial Multi-Criteria Evaluation)
                  </h3>
                  <p className="text-slate-600 text-[11px]">
                    Sistem menggunakan pendekatan ilmiah 2 tahap (Boolean Elimination dilanjutkan Weighted Linear Combination) untuk menjamin rekomendasi lokasi tidak melanggar batasan hukum fisik:
                  </p>
                </div>

                {/* Flowchart Diagram */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tahap 1 */}
                  <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>TAHAP 1: Hard Constraints (Eliminasi Mutlak)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Menyaring seluruh area terlarang secara hukum/geografis. Jika satu saja kriteria di bawah terlanggar, skor otomatis menjadi <b>0 (Tereliminasi Mutlak)</b>:
                    </p>
                    <ul className="text-[11px] space-y-1 text-slate-700 list-disc pl-4 font-medium">
                      <li>Kemiringan Lereng &gt; 40% (Topografi Ekstrem)</li>
                      <li>Sempadan Waduk / Badan Air &lt; 100 meter</li>
                      <li>Sempadan Sungai &lt; 50 meter</li>
                      <li>Kawasan Lindung RTRW (Bukan Budidaya)</li>
                    </ul>
                  </div>

                  {/* Tahap 2 */}
                  <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>TAHAP 2: Weighted Linear Combination (WLC)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Area yang lolos Tahap 1 dinilai kelayakannya dengan pembobotan 7 kriteria terstandardisasi (skala 0–100):
                    </p>
                    <ul className="text-[11px] space-y-1 text-slate-700 list-disc pl-4 font-medium">
                      <li>Kepadatan Penduduk (Bobot: 25%)</li>
                      <li>Aksesibilitas Truk Pengangkut (Bobot: 20%)</li>
                      <li>Kemiringan Lereng Datar/Landai (Bobot: 15%)</li>
                      <li>Kesesuaian Tata Ruang RTRW (Bobot: 15%)</li>
                      <li>Mitigasi Risiko Longsor BPBD (Bobot: 15%)</li>
                      <li>Mitigasi Risiko Banjir BPBD (Bobot: 5%)</li>
                      <li>Jarak Aman Lingkungan (Bobot: 5%)</li>
                    </ul>

                    {/* Catatan Teknis Aksesibilitas Truk */}
                    <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 space-y-1 mt-2">
                      <div className="font-bold flex items-center gap-1.5 text-blue-950">
                        <Truck className="w-3.5 h-3.5 text-blue-700" />
                        Mengapa Menggunakan 7.215 Ruas Jalan Utama & Kolektor?
                      </div>
                      <p className="text-blue-800/90 leading-relaxed text-[10.5px]">
                        Berdasarkan <b>SNI 19-3241-1994</b> dan <b>Permen PU 03/2013</b>, sarana TPS memerlukan akses kendaraan operasional pengangkut sampah (Truk Armroll kapasitas 6–8 m³, Truk Compactor, atau Truk Tipper). Truk ini membutuhkan lebar badan jalan minimal 4–6 meter dengan daya dukung perkerasan memadai. Ruas gang pemukiman sempit (&lt;3 meter) dieksklusi dari perhitungan kelayakan jarak agar dinas tidak menempatkan kontainer sampah di lokasi yang mustahil dijangkau oleh armada truk pengangkut.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skala Klasifikasi Skor */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    Skala Klasifikasi Kesesuaian Lokasi (Hasil Akhir SMCE/WLC)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[10.5px]">
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                      <div className="font-bold text-xs text-emerald-700">80 – 100</div>
                      <div className="font-semibold text-[11px]">Sangat Sesuai</div>
                      <div className="text-[10px] text-emerald-800 mt-1">Prioritas utama pembangunan TPS / TPS 3R baru.</div>
                    </div>
                    <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-900">
                      <div className="font-bold text-xs text-teal-700">60 – 79</div>
                      <div className="font-semibold text-[11px]">Sesuai</div>
                      <div className="text-[10px] text-teal-800 mt-1">Layak direkomendasikan tanpa kendala berarti.</div>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                      <div className="font-bold text-xs text-amber-700">40 – 59</div>
                      <div className="font-semibold text-[11px]">Cukup Sesuai</div>
                      <div className="text-[10px] text-amber-800 mt-1">Layak bersyarat dengan mitigasi teknis infrastruktur.</div>
                    </div>
                    <div className="p-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-900">
                      <div className="font-bold text-xs text-orange-700">20 – 39</div>
                      <div className="font-semibold text-[11px]">Kurang Sesuai</div>
                      <div className="text-[10px] text-orange-800 mt-1">Tidak disarankan karena kendala akses / bahaya alam.</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100 border border-slate-300 text-slate-800">
                      <div className="font-bold text-xs text-rose-600">0 (Eliminasi)</div>
                      <div className="font-semibold text-[11px]">Tidak Sesuai</div>
                      <div className="text-[10px] text-slate-600 mt-1">Dilarang mutlak (Kawasan Lindung, Sempadan, Lereng &gt;40%).</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KAMUS DATA */}
          {activeTab === 'kamus' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    Kamus Data & Variabel Spasial
                  </h3>
                  <p className="text-slate-600 text-[11px]">
                    Tabel transparansi atribut data spasial, sumber data resmi, dan rincian formula normalisasi scoring:
                  </p>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 bg-slate-100 font-semibold">
                        <th className="p-2.5">Variabel</th>
                        <th className="p-2.5">Sumber Data</th>
                        <th className="p-2.5">Satuan</th>
                        <th className="p-2.5">Normalisasi</th>
                        <th className="p-2.5">Bobot</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800">Kepadatan Penduduk</td>
                        <td className="p-2.5 text-slate-600">DKB Kemendagri 2026</td>
                        <td className="p-2.5 text-slate-600">Jiwa / Area</td>
                        <td className="p-2.5 text-slate-600">0 - 100 (Linear: P / 15.000 × 100)</td>
                        <td className="p-2.5 font-bold text-emerald-700">25%</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800">Aksesibilitas Truk Pengangkut</td>
                        <td className="p-2.5 text-slate-600">
                          <div>Koridor Jalan Arteri & Kolektor (7.215 Ruas)</div>
                          <div className="text-[10px] text-blue-700 font-medium mt-0.5">*Standar manuver armada truk kontainer armroll 6–8 m³ (SNI 19-3241-1994)</div>
                        </td>
                        <td className="p-2.5 text-slate-600">Meter (Euclidean)</td>
                        <td className="p-2.5 text-slate-600">&le;50m=100; inverse linear s.d. &gt;1000m=10</td>
                        <td className="p-2.5 font-bold text-blue-700">20%</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800">Kemiringan Lereng</td>
                        <td className="p-2.5 text-slate-600">DEM SRTM / Copernicus 30m</td>
                        <td className="p-2.5 text-slate-600">Persen (%)</td>
                        <td className="p-2.5 text-slate-600">0-8%=100, 8-15%=80, 15-25%=50, 25-40%=20, &gt;40%=0</td>
                        <td className="p-2.5 font-bold text-amber-700">15%</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800">Tata Ruang (RTRW)</td>
                        <td className="p-2.5 text-slate-600">Pola Ruang Perda RTRW Banjarnegara</td>
                        <td className="p-2.5 text-slate-600">Zonasi</td>
                        <td className="p-2.5 text-slate-600">Budidaya=50-100; Lindung/Air=0 (Eliminasi)</td>
                        <td className="p-2.5 font-bold text-purple-700">15%</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800">Risiko Tanah Longsor</td>
                        <td className="p-2.5 text-slate-600">BPBD Banjarnegara (7.747 Poligon)</td>
                        <td className="p-2.5 text-slate-600">Kelas Risiko</td>
                        <td className="p-2.5 text-slate-600">Rendah=100, Sedang=60, Tinggi=20</td>
                        <td className="p-2.5 font-bold text-rose-700">15%</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800">Risiko Banjir</td>
                        <td className="p-2.5 text-slate-600">BPBD Banjarnegara (591 Poligon)</td>
                        <td className="p-2.5 text-slate-600">Kelas Risiko</td>
                        <td className="p-2.5 text-slate-600">Rendah=100, Sedang=60, Tinggi=20</td>
                        <td className="p-2.5 font-bold text-cyan-700">5%</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800">Sempadan Air / Sungai</td>
                        <td className="p-2.5 text-slate-600">Badan Air & Sempadan Sungai 50m</td>
                        <td className="p-2.5 text-slate-600">Meter</td>
                        <td className="p-2.5 text-slate-600">&ge;200m=100, 100-200m=70, 50-100m=40, &lt;50m=0</td>
                        <td className="p-2.5 font-bold text-teal-700">5%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Rincian Skor Normalisasi Pola Ruang RTRW */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-purple-600" />
                    Rincian Pembobotan Zonasi Pola Ruang RTRW (Skala 0 - 100)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block">Kawasan Perkotaan:</span>
                      <b className="text-emerald-700">Skor 100</b>
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block">Permukiman Perdesaan:</span>
                      <b className="text-emerald-700">Skor 95</b>
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block">Perdagangan & Jasa:</span>
                      <b className="text-teal-700">Skor 90</b>
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block">Peruntukan Industri:</span>
                      <b className="text-teal-700">Skor 80</b>
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block">Pertanian Tanaman Pangan:</span>
                      <b className="text-blue-700">Skor 75</b>
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block">Kawasan Hortikultura:</span>
                      <b className="text-blue-700">Skor 70</b>
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block">Kawasan Perkebunan:</span>
                      <b className="text-amber-700">Skor 65</b>
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block">Hutan Produksi Terbatas:</span>
                      <b className="text-amber-700">Skor 55</b>
                    </div>
                    <div className="p-1.5 rounded bg-rose-50 border border-rose-200 col-span-2 sm:col-span-4">
                      <span className="text-rose-700 block font-semibold">Kawasan Lindung / Konservasi / Badan Air / Sempadan:</span>
                      <b className="text-rose-800">Skor 0 (Hard Constraint: Dilarang Mutlak)</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FORMULA & RUMUS */}
          {activeTab === 'rumus' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-indigo-600" />
                    Formula Matematika & Pemodelan Spasial
                  </h3>
                  <p className="text-slate-600 text-[11px]">
                    Algoritma white-box yang dapat diaudit secara independen untuk keperluan verifikasi teknis kedinasan:
                  </p>
                </div>

                {/* Rumus 1: WLC */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                  <div className="text-xs font-bold text-emerald-700">
                    1. Skor Kesesuaian Lokasi (Weighted Linear Combination):
                  </div>
                  <div className="text-sm text-slate-900 bg-slate-100 p-2.5 rounded-lg border border-slate-300 font-mono font-bold">
                    Suitability = Σ ( Score_i × Weight_i / 100 )
                  </div>
                  <p className="text-[10.5px] text-slate-600">
                    Di mana <i>Score_i</i> adalah skor ternormalisasi kriteria ke-<i>i</i> (0–100), dan <i>Weight_i</i> adalah bobot persen kriteria ke-<i>i</i> (Σ Weight = 100%).
                  </p>
                </div>

                {/* Rumus 2: Geometrik Populasi */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                  <div className="text-xs font-bold text-indigo-700">
                    2. Proyeksi Penduduk (Model Pertumbuhan Geometrik BPS):
                  </div>
                  <div className="text-sm text-slate-900 bg-slate-100 p-2.5 rounded-lg border border-slate-300 font-mono font-bold">
                    P_t = P_0 × (1 + r)^t
                  </div>
                  <p className="text-[10.5px] text-slate-600 leading-relaxed">
                    Di mana:
                    <br />• <b>P_t</b>: Jumlah penduduk pada tahun proyeksi ke-<i>t</i> (jiwa).
                    <br />• <b>P_0</b>: Penduduk tahun dasar (Semester 1 2026 dari DKB Kemendagri).
                    <br />• <b>r</b>: Laju pertumbuhan penduduk tahunan riil per kecamatan (dihitung dari time series 2023–2026, rata-rata Banjarnegara = 0.722%/tahun).
                    <br />• <b>t</b>: Horizon perencanaan masa depan (0 s.d. 5 tahun).
                  </p>
                </div>

                {/* Rumus 3: Timbulan Sampah */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                  <div className="text-xs font-bold text-amber-700">
                    3. Estimasi Timbulan Sampah Harian (SNI 19-3983-1995):
                  </div>
                  <div className="text-sm text-slate-900 bg-slate-100 p-2.5 rounded-lg border border-slate-300 font-mono font-bold">
                    Q_t = (P_t × q) / 1000
                  </div>
                  <p className="text-[10.5px] text-slate-600">
                    Di mana <b>Q_t</b> adalah total timbulan harian dalam m³/hari, dan <b>q</b> adalah konstanta timbulan per kapita (2.5 liter/orang/hari atau 0.0025 m³/hari).
                  </p>
                </div>

                {/* Rumus 4: Radius Layanan (Buffer) */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                  <div className="text-xs font-bold text-blue-700">
                    4. Radius Pelayanan TPS (Spatial Buffer Geodesic):
                  </div>
                  <div className="text-sm text-slate-900 bg-slate-100 p-2.5 rounded-lg border border-slate-300 font-mono font-bold">
                    B_i = &#123; p &isin; R&sup2; | dist(p, TPS_i) &le; R_service &#125;
                  </div>
                  <p className="text-[10.5px] text-slate-600 leading-relaxed">
                    Sesuai Permen PU No. 03/2013, radius pelayanan dihitung menggunakan geodesic circle buffer:
                    <br />• <b>R = 500 meter</b>: Jarak tempuh ideal pejalan kaki / gerobak dorong sampah manual.
                    <br />• <b>R = 1.000 meter</b>: Jarak tempuh armada motor sampah roda 3 (TPS 3R).
                    <br />• Cakupan total diperoleh dari operasi <b>Dissolve/Union Spasial</b>: <i>U = &cup; B_i</i>
                  </p>
                </div>

                {/* Rumus 5: Analisis Kesenjangan Layanan (Service Gap) */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                  <div className="text-xs font-bold text-rose-700">
                    5. Analisis Kesenjangan Layanan (Service Gap Analysis):
                  </div>
                  <div className="text-sm text-slate-900 bg-slate-100 p-2.5 rounded-lg border border-slate-300 font-mono font-bold">
                    P_terlayani = &Sigma; [ P_t,j &times; ( Area(Desa_j &cap; U_cov) / Area(Desa_j) ) ]
                    <br />
                    Gap = P_total - P_terlayani
                  </div>
                  <p className="text-[10.5px] text-slate-600 leading-relaxed">
                    Menghitung estimasi penduduk dan luas wilayah yang belum terjangkau fasilitas TPS eksisting secara proporsional spasial.
                  </p>
                </div>

                {/* Rumus 6: Kebutuhan Kapasitas Wadah TPS */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                  <div className="text-xs font-bold text-purple-700">
                    6. Kebutuhan Dimensi / Kapasitas Wadah Kontainer TPS:
                  </div>
                  <div className="text-sm text-slate-900 bg-slate-100 p-2.5 rounded-lg border border-slate-300 font-mono font-bold">
                    V_wadah = ( Q_t &times; H_r ) / F_p
                  </div>
                  <p className="text-[10.5px] text-slate-600 leading-relaxed">
                    Di mana <b>V_wadah</b> adalah volume kapasitas kontainer yang harus disediakan (m³), <b>H_r</b> adalah interval pengangkutan armada (hari), dan <b>F_p</b> adalah faktor pemadatan sampah di wadah (rata-rata 1.2).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center print:hidden">
          <span className="text-[11px] text-slate-500 font-medium">
            Inklusi TPS Spatial Intelligence • Modul Transparansi SDSS
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
