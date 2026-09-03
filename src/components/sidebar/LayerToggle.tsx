'use client';

import React, { useState } from 'react';
import { Layers, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { LayerVisibilityState } from '@/types';

interface LayerToggleProps {
  layers: LayerVisibilityState;
  onToggle: (key: keyof LayerVisibilityState) => void;
  onToggleAllIntelligence?: (active: boolean) => void;
  defaultOpen?: boolean;
}

interface LayerGroup {
  title: string;
  items: {
    key: keyof LayerVisibilityState;
    label: string;
    color: string;
    badge?: string;
  }[];
}

const LAYER_GROUPS: LayerGroup[] = [
  {
    title: 'Spatial Intelligence (Hasil Analisis)',
    items: [
      {
        key: 'suitabilityOverlay',
        label: 'Peta Kesesuaian Lahan (WLC)',
        color: '#10B981',
        badge: 'Utama',
      },
      {
        key: 'serviceCoverage',
        label: 'Buffer Radius Layanan TPS',
        color: '#3B82F6',
        badge: 'Buffer',
      },
      {
        key: 'serviceGap',
        label: 'Wilayah Kesenjangan (Service Gap)',
        color: '#EF4444',
        badge: 'Gap',
      },
    ],
  },
  {
    title: 'Batas Wilayah Administrasi',
    items: [
      {
        key: 'administrasiKecamatan',
        label: 'Batas Kecamatan (20 Kecamatan)',
        color: '#4338CA',
      },
      {
        key: 'administrasiDesa',
        label: 'Batas Desa / Kelurahan (276 Desa)',
        color: '#64748B',
      },
    ],
  },
  {
    title: 'Infrastruktur & Persampahan',
    items: [
      {
        key: 'tpsEksisting',
        label: 'Titik TPS Eksisting Terdata',
        color: '#E11D48',
      },
      {
        key: 'jaringanJalan',
        label: 'Akses Truk Pengangkut',
        color: '#2563EB',
        badge: '7.215 Ruas',
      },
    ],
  },
  {
    title: 'Lingkungan, Topografi & Bencana',
    items: [
      {
        key: 'slope',
        label: 'Kemiringan Lereng (5 Kelas Slope)',
        color: '#F59E0B',
      },
      {
        key: 'sungai',
        label: 'Sempadan Sungai (50m Buffer)',
        color: '#0284C7',
      },
      {
        key: 'badanAir',
        label: 'Badan Air & Waduk Mrica',
        color: '#0EA5E9',
      },
      {
        key: 'polaRuang',
        label: 'Pola Ruang RTRW V2',
        color: '#7C3AED',
      },
      {
        key: 'kelasLongsor',
        label: 'Zona Risiko Tanah Longsor',
        color: '#DC2626',
      },
      {
        key: 'kelasBanjir',
        label: 'Zona Risiko Banjir',
        color: '#2563EB',
      },
    ],
  },
];

export const LayerToggle: React.FC<LayerToggleProps> = ({
  layers,
  onToggle,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const activeCount = Object.values(layers).filter(Boolean).length;

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200">
      {/* Header / Accordion Toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 select-none transition"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <div className="w-6 h-6 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span>Manajemen Layer Peta</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            {activeCount} Aktif
          </span>
          <span className="text-slate-400 hover:text-slate-600 transition">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-3 pb-3.5 pt-1 border-t border-slate-200/70 space-y-3">
          {LAYER_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {group.title}
              </h4>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = layers[item.key];
                  return (
                    <button
                      key={item.key}
                      onClick={() => onToggle(item.key)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition border cursor-pointer ${
                        isActive
                          ? 'bg-white text-slate-900 border-slate-300 shadow-2xs font-medium'
                          : 'bg-slate-100/70 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate text-[11px]">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {item.badge}
                          </span>
                        )}
                        {isActive ? (
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
