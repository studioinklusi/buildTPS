'use client';

import React from 'react';
import { BookOpen, MapPin, Layers, PanelLeftClose, PanelLeft } from 'lucide-react';
import { BASELINE_YEAR } from '@/lib/constants';

interface HeaderProps {
  onOpenHelpModal: () => void;
  planningHorizonYears: number;
  totalExistingTps: number;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHelpModal,
  planningHorizonYears,
  totalExistingTps,
  isSidebarOpen = true,
  onToggleSidebar,
}) => {
  const targetYear = BASELINE_YEAR + planningHorizonYears;

  return (
    <header className="h-16 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between px-5 z-20 shrink-0 shadow-2xs">
      {/* Brand / Logo + Sidebar Toggle */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 transition shadow-2xs mr-1"
            title={isSidebarOpen ? 'Sembunyikan Panel Samping' : 'Tampilkan Panel Samping'}
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-5 h-5 text-slate-600" />
            ) : (
              <PanelLeft className="w-5 h-5 text-emerald-600" />
            )}
          </button>
        )}

        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20 text-white shrink-0">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              Inklusi TPS{' '}
              <span className="text-emerald-700 font-semibold text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                Spatial Intelligence
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Sistem Rekomendasi Lokasi TPS Berbasis Data Spasial & Proyeksi Kependudukan • Kab. Banjarnegara
          </p>
        </div>
      </div>

      {/* Center Status Badges */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-500">Horizon:</span>
          <span className="font-semibold text-emerald-700">
            Tahun {targetYear} {planningHorizonYears > 0 ? `(+${planningHorizonYears} thn)` : '(Baseline 2026)'}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs shadow-2xs">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-500">TPS Terdata:</span>
          <span className="font-semibold text-blue-700">{totalExistingTps} Titik</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenHelpModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-xs font-semibold text-white shadow-sm transition-all duration-150"
          title="Buka modul transparansi rumus perhitungan, regulasi, dan kamus data"
        >
          <BookOpen className="w-4 h-4 text-indigo-100" />
          <span>Bantuan & Rumus</span>
        </button>
      </div>
    </header>
  );
};
