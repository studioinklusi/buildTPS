'use client';

import React, { useState } from 'react';
import { Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { ForecastingConfig } from '@/types';
import { BASELINE_YEAR } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';

interface PlanningHorizonSliderProps {
  forecasting: ForecastingConfig;
  onChange: (newConfig: ForecastingConfig) => void;
  projectedPopulation: number;
  dailyWasteM3: number;
  defaultOpen?: boolean;
}

export const PlanningHorizonSlider: React.FC<PlanningHorizonSliderProps> = ({
  forecasting,
  onChange,
  projectedPopulation,
  dailyWasteM3,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { planningHorizonYears, wastePerCapitaLiter } = forecasting;
  const targetYear = BASELINE_YEAR + planningHorizonYears;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...forecasting,
      planningHorizonYears: parseInt(e.target.value, 10),
    });
  };

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200">
      {/* Header / Accordion Toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 select-none transition"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <span>Horizon Perencanaan ({targetYear})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {planningHorizonYears === 0 ? 'Baseline 2026' : `+${planningHorizonYears} Thn (${targetYear})`}
          </span>
          <span className="text-slate-400 hover:text-slate-600 transition">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-3 pb-3.5 pt-1 border-t border-slate-200/70 space-y-3">
          {/* Slider */}
          <div className="space-y-1.5 pt-1">
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={planningHorizonYears}
              onChange={handleSliderChange}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            {/* Ticks 0 to 5 */}
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span className={planningHorizonYears === 0 ? 'text-indigo-700 font-bold' : ''}>2026 (0)</span>
              <span className={planningHorizonYears === 1 ? 'text-indigo-700 font-bold' : ''}>2027</span>
              <span className={planningHorizonYears === 2 ? 'text-indigo-700 font-bold' : ''}>2028</span>
              <span className={planningHorizonYears === 3 ? 'text-indigo-700 font-bold' : ''}>2029</span>
              <span className={planningHorizonYears === 4 ? 'text-indigo-700 font-bold' : ''}>2030</span>
              <span className={planningHorizonYears === 5 ? 'text-indigo-700 font-bold' : ''}>2031 (5)</span>
            </div>
          </div>

          {/* Dynamic Forecast Preview */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/70">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-medium">Proyeksi Penduduk (P_t)</span>
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1 mt-0.5 font-mono">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                {formatNumber(projectedPopulation)} <span className="text-[10px] font-normal text-slate-500">jiwa</span>
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-medium">Timbulan Sampah (Q_t)</span>
              <span className="text-xs font-bold text-amber-700 mt-0.5 block font-mono">
                {formatNumber(dailyWasteM3, 1)} <span className="text-[10px] font-normal text-slate-500">m³/hari</span>
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-600 leading-relaxed bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-200/70">
            <span className="font-semibold text-indigo-900">Model Geometrik:</span>{' '}
            <code className="text-indigo-800 font-mono font-semibold">P_t = P_0(1+r)^t</code> • Standar timbulan: {wastePerCapitaLiter} L/jiwa/hari (SNI 19-3983-1995).
          </div>
        </div>
      )}
    </div>
  );
};
