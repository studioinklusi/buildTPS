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

          {/* 4. Natural & Environment */}
          {(layers.sungai || layers.badanAir || layers.jaringanJalan) && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Infrastruktur & Lingkungan
              </span>
              <div className="space-y-1">
                {layers.jaringanJalan && (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-1 rounded bg-slate-500 shrink-0" />
                    <span className="text-[10.5px]">Jaringan Jalan Utama</span>
                  </div>
                )}
                {layers.sungai && (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-1 rounded bg-cyan-600 shrink-0" />
                    <span className="text-[10.5px]">Sungai (Buffer Sempadan)</span>
                  </div>
                )}
                {layers.badanAir && (
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-sky-500/80 shrink-0" />
                    <span className="text-[10.5px]">Badan Air / Waduk Mrica</span>
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
