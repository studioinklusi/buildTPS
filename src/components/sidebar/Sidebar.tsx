'use client';

import React from 'react';
import { FilterPanel } from './FilterPanel';
import { PlanningHorizonSlider } from './PlanningHorizonSlider';
import { WeightSliders } from './WeightSliders';
import { RadiusSlider } from './RadiusSlider';
import { LayerToggle } from './LayerToggle';
import { TpsUploadPanel } from './TpsUploadPanel';
import {
  WeightConfig,
  ThresholdConfig,
  ForecastingConfig,
  FilterConfig,
  LayerVisibilityState,
  ExistingTpsPoint,
} from '@/types';
import { DEFAULT_WEIGHTS } from '@/lib/constants';

interface SidebarProps {
  filter: FilterConfig;
  onFilterChange: (f: FilterConfig) => void;
  kecamatanList: string[];
  desaList: string[];

  forecasting: ForecastingConfig;
  onForecastingChange: (f: ForecastingConfig) => void;
  projectedPopulation: number;
  dailyWasteM3: number;

  weights: WeightConfig;
  onWeightChange: (key: keyof WeightConfig, val: number) => void;
  setWeights: (w: WeightConfig) => void;

  thresholds: ThresholdConfig;
  onThresholdsChange: (t: ThresholdConfig) => void;

  layers: LayerVisibilityState;
  onLayerToggle: (key: keyof LayerVisibilityState) => void;

  existingTps: ExistingTpsPoint[];
  onTpsLoaded: (points: ExistingTpsPoint[]) => void;
  onClearTps: () => void;

  isOpen?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  filter,
  onFilterChange,
  kecamatanList,
  desaList,
  forecasting,
  onForecastingChange,
  projectedPopulation,
  dailyWasteM3,
  weights,
  onWeightChange,
  setWeights,
  thresholds,
  onThresholdsChange,
  layers,
  onLayerToggle,
  existingTps,
  onTpsLoaded,
  onClearTps,
  isOpen = true,
  onToggle,
}) => {
  return (
    <aside
      className={`transition-all duration-300 ease-in-out flex flex-col h-[calc(100vh-4rem)] z-10 shrink-0 select-none bg-white border-r border-slate-200 text-slate-700 shadow-sm relative ${
        isOpen ? 'w-80 md:w-96 opacity-100 translate-x-0' : 'w-0 border-r-0 overflow-hidden opacity-0 -translate-x-full pointer-events-none'
      }`}
    >
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
        {/* 1. Filter Wilayah (Open by default) */}
        <FilterPanel
          filter={filter}
          onFilterChange={onFilterChange}
          kecamatanList={kecamatanList}
          desaList={desaList}
          defaultOpen={true}
        />

        {/* 2. Planning Horizon Forecasting Slider (Open by default) */}
        <PlanningHorizonSlider
          forecasting={forecasting}
          onChange={onForecastingChange}
          projectedPopulation={projectedPopulation}
          dailyWasteM3={dailyWasteM3}
          defaultOpen={true}
        />

        {/* 3. Layer Management (Open by default) */}
        <LayerToggle
          layers={layers}
          onToggle={onLayerToggle}
          onToggleAllIntelligence={() => {}}
          defaultOpen={true}
        />

        {/* 4. Service Radius Buffer Slider (Collapsed by default to save vertical space) */}
        <RadiusSlider
          thresholds={thresholds}
          onChange={onThresholdsChange}
          defaultOpen={false}
        />

        {/* 5. WLC Criteria Weight Sliders (Collapsed by default to save vertical space) */}
        <WeightSliders
          weights={weights}
          onWeightChange={onWeightChange}
          onReset={() => setWeights(DEFAULT_WEIGHTS)}
          defaultOpen={false}
        />

        {/* 6. TPS Dataset Upload (Collapsed by default to save vertical space) */}
        <TpsUploadPanel
          existingTps={existingTps}
          onTpsLoaded={onTpsLoaded}
          onClearTps={onClearTps}
          defaultOpen={false}
        />
      </div>

      {/* Footer Branding inside Sidebar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between items-center shrink-0">
        <span>PT. Inklusi Teknologi Strategis</span>
        <span className="font-mono text-slate-600 font-medium">v2.0 • SDSS WebGIS</span>
      </div>
    </aside>
  );
};
