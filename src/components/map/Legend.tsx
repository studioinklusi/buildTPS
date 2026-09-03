'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { LayerVisibilityState } from '@/types';
import { SUITABILITY_COLORS } from '@/lib/colors';

interface LegendProps {
  layers: LayerVisibilityState;
}

export const Legend: React.FC<LegendProps> = ({ layers }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-xl overflow-hidden w-64 text-xs transition-all duration-200">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-slate-800 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 transition border-b border-slate-200/80 cursor-pointer"
      >
        <div className="flex items-center gap-2 font-semibold">
          <Info className="w-3.5 h-3.5 text-emerald-600" />
          <span>Legenda Peta</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="p-3 space-y-3 max-h-72 overflow-y-auto custom-scrollbar text-slate-700">
          {/* 1. Suitability Overlay Legend */}
          {layers.suitabilityOverlay && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Tingkat Kesesuaian Lokasi TPS
              </span>
              <div className="space-y-1">
                {Object.entries(SUITABILITY_COLORS).map(([cat, meta]) => (
                  <div key={cat} className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded border shrink-0"
                      style={{
                        backgroundColor: meta.fill,
                        borderColor: meta.stroke,
                      }}
                    />
                    <span className="text-[10.5px] truncate font-medium">{meta.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Coverage & Gap Legend */}
          {(layers.serviceCoverage || layers.serviceGap || layers.tpsEksisting) && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Layanan & Kesenjangan
              </span>
              <div className="space-y-1">
                {layers.tpsEksisting && (
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-white shrink-0 shadow-2xs" />
                    <span className="text-[10.5px]">Titik TPS Eksisting</span>
                  </div>
                )}
                {layers.serviceCoverage && (
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-blue-500/40 border border-blue-500 shrink-0" />
                    <span className="text-[10.5px]">Wilayah Terlayani (Buffer)</span>
                  </div>
                )}
                {layers.serviceGap && (
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-rose-600/30 border border-rose-500 shrink-0" />
                    <span className="text-[10.5px]">Service Gap (Belum Terlayani)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Slope Legend */}
          {layers.slope && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Kemiringan Lereng (Slope)
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#1a9850] shrink-0" />
                  <span className="text-[10.5px]">0 - 8% (Datar / Sangat Layak)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#91cf60] shrink-0" />
                  <span className="text-[10.5px]">8 - 15% (Landai / Layak)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#fee08b] shrink-0" />
                  <span className="text-[10.5px]">15 - 25% (Agak Curam)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#fc8d59] shrink-0" />
                  <span className="text-[10.5px]">25 - 40% (Curam / Terbatas)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#d73027] shrink-0" />
                  <span className="text-[10.5px]">&gt; 40% (Sangat Curam / Larangan)</span>
                </div>
              </div>
            </div>
          )}

          {/* 3b. Landslide Risk Legend */}
          {layers.kelasLongsor && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Risiko Tanah Longsor (BPBD)
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#E11D48] shrink-0" />
                  <span className="text-[10.5px]">Zona Risiko Tinggi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#F59E0B] shrink-0" />
                  <span className="text-[10.5px]">Zona Risiko Sedang</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#10B981] shrink-0" />
                  <span className="text-[10.5px]">Zona Risiko Rendah</span>
                </div>
              </div>
            </div>
          )}

          {/* 3c. Flood Risk Legend */}
          {layers.kelasBanjir && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Risiko Banjir (BPBD)
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#1D4ED8] shrink-0" />
                  <span className="text-[10.5px]">Zona Risiko Tinggi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#3B82F6] shrink-0" />
                  <span className="text-[10.5px]">Zona Risiko Sedang</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#93C5FD] shrink-0" />
                  <span className="text-[10.5px]">Zona Risiko Rendah</span>
                </div>
              </div>
            </div>
          )}

          {/* 3d. Pola Ruang RTRW Legend */}
          {layers.polaRuang && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Pola Ruang RTRW (ATR/BPN)
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#EA580C] shrink-0" />
                  <span className="truncate">Permukiman Kota</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#FBBF24] shrink-0" />
                  <span className="truncate">Permukiman Desa</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#84CC16] shrink-0" />
                  <span className="truncate">Tanaman Pangan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#65A30D] shrink-0" />
                  <span className="truncate">Hortikultura</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#15803D] shrink-0" />
                  <span className="truncate">Perkebunan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#16A34A] shrink-0" />
                  <span className="truncate">Hutan Produksi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#065F46] shrink-0" />
                  <span className="truncate">Hutan Lindung</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#7C3AED] shrink-0" />
                  <span className="truncate">Industri</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#0284C7] shrink-0" />
                  <span className="truncate">Badan Air</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#9333EA] shrink-0" />
                  <span className="truncate">Cagar Budaya</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Natural & Environment */}
          {(layers.sungai || layers.badanAir || layers.jaringanJalan) && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Infrastruktur & Lingkungan
              </span>
              <div className="space-y-1">
                {layers.jaringanJalan && (
                  <div className="space-y-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/80 mb-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                      <span>Aksesibilitas Truk Pengangkut</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold">SNI 19-3241-1994</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-[3px] rounded bg-[#2563EB] shrink-0" />
                      <span className="text-[10.5px] text-slate-700 font-medium">Jalan Arteri / Utama (Truk Kontainer Besar)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-[1.8px] rounded bg-[#64748B] shrink-0" />
                      <span className="text-[10.5px] text-slate-600">Jalan Kolektor / Sekunder (Truk Armroll 6–8m³)</span>
                    </div>
                    <div className="text-[9px] text-slate-400 italic pt-0.5 border-t border-slate-200/60 leading-tight">
                      *Ruas gang sempit (&lt;3m) dieksklusi karena tidak dapat dilalui truk kontainer dinas.
                    </div>
                  </div>
                )}
                {layers.sungai && (
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#0284C7]/40 border border-[#0284C7] shrink-0" />
                    <span className="text-[10.5px]">Sempadan Sungai (Buffer 50m - Skor 0)</span>
                  </div>
                )}
                {layers.badanAir && (
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#0284C7] border border-[#075985] shrink-0" />
                    <span className="text-[10.5px]">Badan Air / Waduk Mrica (Skor 0)</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
