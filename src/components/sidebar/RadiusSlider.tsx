'use client';

import React, { useState } from 'react';
import { Target, ChevronDown, ChevronUp } from 'lucide-react';
import { ThresholdConfig } from '@/types';

interface RadiusSliderProps {
  thresholds: ThresholdConfig;
  onChange: (newThresholds: ThresholdConfig) => void;
  defaultOpen?: boolean;
}

const PRESETS = [
  { label: '500m', value: 500, desc: 'Padat' },
  { label: '1.0 km', value: 1000, desc: 'Standar SNI' },
  { label: '1.5 km', value: 1500, desc: 'Perdesaan' },
  { label: '2.0 km', value: 2000, desc: 'Luas' },
];

export const RadiusSlider: React.FC<RadiusSliderProps> = ({
  thresholds,
  onChange,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const currentRadius = thresholds.serviceRadius;

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...thresholds,
      serviceRadius: parseInt(e.target.value, 10),
    });
  };

  const handlePreset = (val: number) => {
    onChange({
      ...thresholds,
      serviceRadius: val,
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
          <div className="w-6 h-6 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <Target className="w-3.5 h-3.5" />
          </div>
          <span>Radius Layanan TPS</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {(currentRadius / 1000).toFixed(2)} km
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
          <div className="space-y-1 pt-1">
            <input
              type="range"
              min="250"
              max="3000"
              step="50"
              value={currentRadius}
              onChange={handleSlider}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.25 km</span>
              <span>1.0 km</span>
              <span>2.0 km</span>
              <span>3.0 km</span>
            </div>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePreset(p.value)}
                className={`text-[10px] py-1 px-1.5 rounded-lg border text-center transition cursor-pointer ${
                  currentRadius === p.value
                    ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
