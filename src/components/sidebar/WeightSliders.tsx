'use client';

import React, { useState } from 'react';
import { Sliders, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { WeightConfig } from '@/types';
import { DEFAULT_WEIGHTS } from '@/lib/constants';

interface WeightSlidersProps {
  weights: WeightConfig;
  onWeightChange: (key: keyof WeightConfig, val: number) => void;
  onReset: () => void;
  defaultOpen?: boolean;
}

const CRITERIA_METADATA: {
  key: keyof WeightConfig;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    key: 'population',
    label: 'Kepadatan Penduduk',
    description: 'Prioritas ke konsentrasi timbulan sampah',
    color: 'accent-emerald-600',
  },
  {
    key: 'accessibility',
    label: 'Aksesibilitas Jalan',
    description: 'Kemudahan manuver truk sampah',
    color: 'accent-blue-600',
  },
  {
    key: 'slope',
    label: 'Kemiringan Lereng (Slope)',
    description: 'Kelayakan topografi kontruksi',
    color: 'accent-amber-600',
  },
  {
    key: 'spatialPlanning',
    label: 'Tata Ruang (RTRW)',
    description: 'Kawasan Budidaya vs Lindung',
    color: 'accent-purple-600',
  },
  {
    key: 'landslideRisk',
    label: 'Risiko Tanah Longsor',
    description: 'Mitigasi kerentanan lereng',
    color: 'accent-rose-600',
  },
  {
    key: 'floodRisk',
    label: 'Risiko Banjir',
    description: 'Keamanan dari genangan air',
    color: 'accent-cyan-600',
  },
  {
    key: 'sensitiveDistance',
    label: 'Jarak Badan Air / Sungai',
    description: 'Perlindungan sempadan sungai',
    color: 'accent-teal-600',
  },
];

export const WeightSliders: React.FC<WeightSlidersProps> = ({
  weights,
  onWeightChange,
  onReset,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleResetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReset();
  };

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200">
      {/* Header / Accordion Toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 select-none transition"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <span>Bobot Kriteria (WLC)</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              totalWeight === 100
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            Total: {totalWeight}%
          </span>
          <button
            onClick={handleResetClick}
            className="text-slate-400 hover:text-emerald-700 p-0.5 transition"
            title="Reset ke Bobot Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-400 hover:text-slate-600 transition">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-3 pb-3.5 pt-1 border-t border-slate-200/70 space-y-3">
          {CRITERIA_METADATA.map((c) => {
            const val = weights[c.key];
            return (
              <div key={c.key} className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-medium text-slate-700">{c.label}</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    {val}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={val}
                  onChange={(e) => onWeightChange(c.key, parseInt(e.target.value, 10))}
                  className={`w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer ${c.color}`}
                />
                <span className="text-[9.5px] text-slate-500 block truncate">
                  {c.description}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
