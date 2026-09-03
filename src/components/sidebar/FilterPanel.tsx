'use client';

import React, { useState } from 'react';
import { Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { FilterConfig } from '@/types';

interface FilterPanelProps {
  filter: FilterConfig;
  onFilterChange: (newFilter: FilterConfig) => void;
  kecamatanList: string[];
  desaList: string[];
  defaultOpen?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filter,
  onFilterChange,
  kecamatanList,
  desaList,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onFilterChange({
      kecamatan: val === 'all' ? null : val,
      desa: null, // reset desa when kecamatan changes
    });
  };

  const handleDesaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onFilterChange({
      ...filter,
      desa: val === 'all' ? null : val,
    });
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFilterChange({ kecamatan: null, desa: null });
  };

  const activeLabel = filter.desa
    ? `Desa ${filter.desa}`
    : filter.kecamatan
    ? `Kec. ${filter.kecamatan}`
    : null;

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200">
      {/* Header / Accordion Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 select-none transition"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <span>Filter Wilayah Administrasi</span>
        </div>

        <div className="flex items-center gap-2">
          {activeLabel && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 max-w-[110px] truncate">
              {activeLabel}
            </span>
          )}
          {(filter.kecamatan || filter.desa) && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 transition px-1 py-0.5"
              title="Reset Filter"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
          <span className="text-slate-400 hover:text-slate-600 transition">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-3 pb-3.5 pt-1 border-t border-slate-200/70 grid grid-cols-1 gap-2.5">
          {/* Dropdown Kecamatan */}
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">
              Kecamatan ({kecamatanList.length})
            </label>
            <select
              value={filter.kecamatan || 'all'}
              onChange={handleKecamatanChange}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-2xs transition"
            >
              <option value="all">Semua Kecamatan (Kabupaten Banjarnegara)</option>
              {kecamatanList.map((kec) => (
                <option key={kec} value={kec}>
                  Kecamatan {kec}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Desa */}
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">
              Desa / Kelurahan {filter.kecamatan ? `(${desaList.length})` : ''}
            </label>
            <select
              value={filter.desa || 'all'}
              onChange={handleDesaChange}
              disabled={!filter.kecamatan}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shadow-2xs transition"
            >
              <option value="all">
                {filter.kecamatan ? 'Semua Desa di Kecamatan' : 'Pilih Kecamatan Dahulu'}
              </option>
              {desaList.map((desa, idx) => (
                <option key={`${desa}-${idx}`} value={desa}>
                  Desa {desa}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
