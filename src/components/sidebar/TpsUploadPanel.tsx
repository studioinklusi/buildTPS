'use client';

import React, { useRef, useState } from 'react';
import { Upload, Download, Trash2, CheckCircle2, AlertTriangle, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';
import { ExistingTpsPoint } from '@/types';
import { parseTpsUpload } from '@/lib/utils';

interface TpsUploadPanelProps {
  existingTps: ExistingTpsPoint[];
  onTpsLoaded: (points: ExistingTpsPoint[]) => void;
  onClearTps: () => void;
  defaultOpen?: boolean;
}

export const TpsUploadPanel: React.FC<TpsUploadPanelProps> = ({
  existingTps,
  onTpsLoaded,
  onClearTps,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCsv = file.name.endsWith('.csv');
    const isGeo = file.name.endsWith('.geojson') || file.name.endsWith('.json');

    if (!isCsv && !isGeo) {
      setFeedback({ message: 'Harap unggah file .csv atau .geojson', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const { points, errors } = parseTpsUpload(content, isCsv ? 'csv' : 'geojson');

      if (points.length === 0) {
        setFeedback({
          message: errors.length > 0 ? errors[0] : 'Tidak ada titik TPS valid ditemukan.',
          type: 'error',
        });
      } else {
        onTpsLoaded(points);
        setFeedback({
          message: `Berhasil memuat ${points.length} titik TPS. ${errors.length > 0 ? `(${errors.length} baris dilewati)` : ''}`,
          type: 'success',
        });
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClearTps();
  };

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200">
      {/* Header / Accordion Toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 select-none transition"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <div className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Upload className="w-3.5 h-3.5" />
          </div>
          <span>Upload Data TPS Eksisting</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {existingTps.length} Titik
          </span>
          {existingTps.length > 0 && (
            <button
              onClick={handleClearClick}
              className="text-slate-400 hover:text-rose-600 p-0.5 transition"
              title="Kosongkan data TPS"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-slate-400 hover:text-slate-600 transition">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-3 pb-3.5 pt-1 border-t border-slate-200/70 space-y-3">
          {/* Upload Zone */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.geojson,.json"
              onChange={handleFileUpload}
              className="hidden"
              id="tps-file-input"
            />
            <label
              htmlFor="tps-file-input"
              className="w-full flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed border-slate-300 hover:border-amber-500 bg-white hover:bg-amber-50/30 cursor-pointer transition text-center group shadow-2xs"
            >
              <FileSpreadsheet className="w-5 h-5 text-slate-400 group-hover:text-amber-600 mb-1 transition" />
              <span className="text-[11px] font-semibold text-slate-700">
                Klik untuk Upload CSV / GeoJSON
              </span>
              <span className="text-[9.5px] text-slate-500">
                Format kolom: nama, lat, lon, kapasitas_m3
              </span>
            </label>
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div
              className={`flex items-start gap-1.5 p-2 rounded-lg text-[11px] ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
              )}
              <span className="leading-tight">{feedback.message}</span>
            </div>
          )}

          {/* Download Templates */}
          <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Unduh Format:</span>
            <div className="flex gap-2.5">
              <a
                href="/data/template_tps_eksisting.csv"
                download="template_tps_banjarnegara.csv"
                className="flex items-center gap-1 text-amber-700 hover:text-amber-800 font-semibold hover:underline transition"
              >
                <Download className="w-3 h-3" />
                <span>CSV</span>
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="/data/template_tps_eksisting.geojson"
                download="template_tps_banjarnegara.geojson"
                className="flex items-center gap-1 text-amber-700 hover:text-amber-800 font-semibold hover:underline transition"
              >
                <Download className="w-3 h-3" />
                <span>GeoJSON</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
