'use client';

import React from 'react';
import {
  MapPin,
  Users,
  AlertCircle,
  Trash2,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { AnalysisSummaryMetrics } from '@/types';
import { formatNumber, formatPercent, formatVolume, formatArea } from '@/lib/utils';

interface KpiBarProps {
  metrics: AnalysisSummaryMetrics;
}

export const KpiBar: React.FC<KpiBarProps> = ({ metrics }) => {
  return (
    <div className="h-20 bg-white border-t border-slate-200 text-slate-800 px-5 flex items-center gap-3.5 overflow-x-auto custom-scrollbar shrink-0 shadow-md z-20">
      {/* 1. TPS Eksisting */}
      <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/90 min-w-[170px] shrink-0 shadow-2xs">
        <div className="w-9 h-9 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10.5px] text-slate-500 block leading-tight font-medium">
            TPS Eksisting
          </span>
          <span className="text-base font-bold text-slate-900 font-mono">
            {metrics.totalExistingTps} <span className="text-xs font-normal text-slate-500">Titik</span>
          </span>
        </div>
      </div>

      {/* 2. Penduduk Terlayani */}
      <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/90 min-w-[190px] shrink-0 shadow-2xs">
        <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
          <Users className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10.5px] text-slate-500 block leading-tight font-medium">
            Cakupan Terlayani
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-blue-700 font-mono">
              {formatPercent(metrics.servedPopulationPercent)}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              ({formatNumber(metrics.servedPopulation)} jiwa)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Service Gap */}
      <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/90 min-w-[210px] shrink-0 shadow-2xs">
        <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10.5px] text-slate-500 block leading-tight font-medium">
            Service Gap (Belum Terlayani)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-amber-700 font-mono">
              {formatPercent(metrics.gapPopulationPercent)}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              ({formatNumber(metrics.gapPopulation)} jiwa)
            </span>
          </div>
        </div>
      </div>

      {/* 4. Estimasi Timbulan Sampah */}
      <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/90 min-w-[195px] shrink-0 shadow-2xs">
        <div className="w-9 h-9 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
          <Trash2 className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10.5px] text-slate-500 block leading-tight font-medium">
            Timbulan Sampah ({metrics.planningHorizonYear})
          </span>
          <span className="text-base font-bold text-orange-700 font-mono">
            {formatVolume(metrics.totalWasteDailyM3)}
            <span className="text-xs font-normal text-slate-500">/hari</span>
          </span>
        </div>
      </div>

      {/* 5. Area Sangat Sesuai */}
      <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/90 min-w-[180px] shrink-0 shadow-2xs">
        <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10.5px] text-slate-500 block leading-tight font-medium">
            Area Sangat Sesuai
          </span>
          <span className="text-base font-bold text-emerald-700 font-mono">
            {formatArea(metrics.highlySuitableAreaHa)}
          </span>
        </div>
      </div>
    </div>
  );
};
