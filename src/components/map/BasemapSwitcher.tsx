'use client';

import React from 'react';
import { Map, Globe, Mountain } from 'lucide-react';

export type BasemapType = 'streets' | 'satellite' | 'topo';

interface BasemapSwitcherProps {
  currentBasemap: BasemapType;
  onChange: (type: BasemapType) => void;
}

export const BasemapSwitcher: React.FC<BasemapSwitcherProps> = ({
  currentBasemap,
  onChange,
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-1 shadow-lg flex gap-1 text-xs">
      <button
        onClick={() => onChange('streets')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
          currentBasemap === 'streets'
            ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title="Peta Vektor Jalan"
      >
        <Map className="w-3.5 h-3.5" />
        <span>Jalan</span>
      </button>

      <button
        onClick={() => onChange('satellite')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
          currentBasemap === 'satellite'
            ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title="Citra Satelit ESRI"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>Satelit</span>
      </button>

      <button
        onClick={() => onChange('topo')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
          currentBasemap === 'topo'
            ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title="Peta Kontur Topografi"
      >
        <Mountain className="w-3.5 h-3.5" />
        <span>Topografi</span>
      </button>
    </div>
  );
};
