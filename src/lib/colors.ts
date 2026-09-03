import { SuitabilityCategory } from '@/types';

export const SUITABILITY_COLORS: Record<SuitabilityCategory, { fill: string; stroke: string; label: string }> = {
  'Sangat Sesuai': {
    fill: '#10B981', // Emerald 500
    stroke: '#047857',
    label: 'Sangat Sesuai (Skor 80 - 100)'
  },
  'Sesuai': {
    fill: '#34D399', // Emerald 400
    stroke: '#059669',
    label: 'Sesuai (Skor 60 - 79)'
  },
  'Cukup Sesuai': {
    fill: '#FBBF24', // Amber 400
    stroke: '#D97706',
    label: 'Cukup Sesuai (Skor 40 - 59)'
  },
  'Kurang Sesuai': {
    fill: '#F97316', // Orange 500
    stroke: '#C2410C',
    label: 'Kurang Sesuai (Skor 20 - 39)'
  },
  'Tidak Sesuai (Constraint)': {
    fill: '#64748B', // Slate 500 (Hard Constraint Elimination)
    stroke: '#334155',
    label: 'Tidak Layak (Hard Constraint / Tereliminasi)'
  }
};

export const DISASTER_COLORS = {
  rendah: '#10B981',
  sedang: '#F59E0B',
  tinggi: '#EF4444',
  default: '#94A3B8'
};

export const PLANNING_COLORS = {
  lindung: '#0284C7',   // Sky blue for conservation/protected
  budidaya: '#F59E0B',  // Amber for production/settlement
  default: '#64748B'
};

export const INFRASTRUCTURE_COLORS = {
  tpsExisting: '#EF4444',     // Red point for existing TPS
  tpsCoverage: '#3B82F6',     // Blue transparent buffer
  serviceGap: '#DC2626',      // Red outline/fill for unserved settlement
  roads: '#64748B',           // Slate line
  rivers: '#0EA5E9',          // Cyan line
  waterbodies: '#38BDF8',     // Light cyan polygon
};
