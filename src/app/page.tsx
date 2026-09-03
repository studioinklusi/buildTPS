'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { MapContainer } from '@/components/map/MapContainer';
import { KpiBar } from '@/components/kpi/KpiBar';
import { HelpAndFormulasModal } from '@/components/modal/HelpAndFormulasModal';
import { useAnalysis } from '@/hooks/useAnalysis';
import { DEFAULT_LAYER_VISIBILITY } from '@/lib/constants';
import { Loader2, PanelLeft } from 'lucide-react';

export default function Home() {
  const [layers, setLayers] = useState<LayerVisibilityState>(DEFAULT_LAYER_VISIBILITY);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const {
    isLoading,
    weights,
    setWeights,
    updateWeight,
    thresholds,
    setThresholds,
    forecasting,
    setForecasting,
    filter,
    setFilter,
    existingTps,
    setExistingTps,
    kecamatanList,
    desaList,
    analysisResult,
  } = useAnalysis();

  const handleLayerToggle = (key: keyof LayerVisibilityState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearTps = () => {
    setExistingTps([]);
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).map) {
          (window as any).map.resize();
        }
      }, 310);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 text-slate-800 overflow-hidden font-sans antialiased">
      {/* 1. Top Navigation & Brand Header */}
      <Header
        onOpenHelpModal={() => setIsHelpOpen(true)}
        planningHorizonYears={forecasting.planningHorizonYears}
        totalExistingTps={existingTps.length}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* 2. Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Interactive Control Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={handleToggleSidebar}
          filter={filter}
          onFilterChange={setFilter}
          kecamatanList={kecamatanList}
          desaList={desaList}
          forecasting={forecasting}
          onForecastingChange={setForecasting}
          projectedPopulation={analysisResult.metrics.totalPopulationProjected}
          dailyWasteM3={analysisResult.metrics.totalWasteDailyM3}
          weights={weights}
          onWeightChange={updateWeight}
          setWeights={setWeights}
          thresholds={thresholds}
          onThresholdsChange={setThresholds}
          layers={layers}
          onLayerToggle={handleLayerToggle}
          existingTps={existingTps}
          onTpsLoaded={setExistingTps}
          onClearTps={handleClearTps}
        />

        {/* Right Map & KPI Area */}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
          {/* Map Viewport */}
          <div className="flex-1 relative">
            <MapContainer
              layers={layers}
              suitabilityFeatures={analysisResult.suitabilityFeatures}
              coverageFeatures={analysisResult.coverageResult}
              gapFeatures={analysisResult.gapResult.gapFeatures}
              existingTps={existingTps}
              filter={filter}
            />

            {/* Floating button to reopen sidebar when collapsed */}
            {!isSidebarOpen && (
              <button
                onClick={handleToggleSidebar}
                className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                title="Tampilkan Panel Samping"
              >
                <PanelLeft className="w-4 h-4 text-emerald-600" />
                <span>Buka Panel Kontrol</span>
              </button>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <span className="text-xs font-semibold text-slate-700">
                  Memuat data spasial & kependudukan Kabupaten Banjarnegara...
                </span>
              </div>
            )}
          </div>

          {/* Bottom Dynamic KPI Decision Bar */}
          <KpiBar metrics={analysisResult.metrics} />
        </div>
      </div>

      {/* 3. White-Box SDSS Transparency Modal */}
      <HelpAndFormulasModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
