import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Papa from 'papaparse';
import { ExistingTpsPoint } from '@/types';
import { BANJARNEGARA_BBOX } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, decimals: number = 0): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 1): string {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  return `${formatNumber(value, decimals)}%`;
}

export function formatArea(ha: number): string {
  if (!ha || isNaN(ha)) return '0 ha';
  if (ha >= 100) return `${formatNumber(ha / 100, 1)} km²`;
  return `${formatNumber(ha, 1)} ha`;
}

export function formatVolume(m3: number): string {
  if (!m3 || isNaN(m3)) return '0 m³';
  return `${formatNumber(m3, 1)} m³`;
}

// Bounding box validation
export function isWithinBanjarnegara(lat: number, lng: number): boolean {
  const [minLng, minLat, maxLng, maxLat] = BANJARNEGARA_BBOX;
  return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
}

// Tolerant CSV / GeoJSON Parser for TPS uploads
export function parseTpsUpload(fileContent: string, fileType: 'csv' | 'geojson'): { points: ExistingTpsPoint[]; errors: string[] } {
  const points: ExistingTpsPoint[] = [];
  const errors: string[] = [];

  if (fileType === 'csv') {
    try {
      const parsed = Papa.parse<Record<string, any>>(fileContent, {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length > 0) {
        errors.push(`Gagal membaca baris CSV: ${parsed.errors[0].message}`);
      }

      parsed.data.forEach((row, idx) => {
        // Tolerant coordinate headers
        const latKey = Object.keys(row).find(k => /^(lat|latitude|lintang|y)$/i.test(k.trim()));
        const lngKey = Object.keys(row).find(k => /^(lon|lng|longitude|bujur|x)$/i.test(k.trim()));
        const nameKey = Object.keys(row).find(k => /^(nama|name|nama_tps|lokasi)$/i.test(k.trim()));
        const kecKey = Object.keys(row).find(k => /^(kecamatan|kec)$/i.test(k.trim()));
        const desaKey = Object.keys(row).find(k => /^(desa|kelurahan)$/i.test(k.trim()));
        const capKey = Object.keys(row).find(k => /^(kapasitas|capacity|kapasitas_m3)$/i.test(k.trim()));

        if (!latKey || !lngKey) {
          if (idx === 0) errors.push("Header CSV wajib memuat kolom koordinat (lat/latitude dan lon/lng).");
          return;
        }

        const lat = parseFloat(row[latKey]);
        const lng = parseFloat(row[lngKey]);

        if (isNaN(lat) || isNaN(lng)) {
          errors.push(`Baris ${idx + 2}: Koordinat (${row[latKey]}, ${row[lngKey]}) tidak valid.`);
          return;
        }

        const rawName = nameKey ? row[nameKey] : null;
        const rawKec = kecKey ? row[kecKey] : null;
        const rawDesa = desaKey ? row[desaKey] : null;
        const rawCap = capKey ? row[capKey] : null;

        if (!isWithinBanjarnegara(lat, lng)) {
          errors.push(`Baris ${idx + 2} (${rawName || 'TPS'}): Koordinat di luar batas Banjarnegara.`);
          return;
        }

        points.push({
          id: `tps-csv-${idx + 1}`,
          name: rawName ? String(rawName).trim() : `TPS Baru ${idx + 1}`,
          kecamatan: rawKec ? String(rawKec).trim() : undefined,
          desa: rawDesa ? String(rawDesa).trim() : undefined,
          lat,
          lng,
          capacityM3: rawCap ? parseFloat(rawCap) || 6 : 6,
          type: row['tipe'] || row['type'] || 'TPS Eksisting',
          status: 'Aktif',
        });
      });
    } catch (e: any) {
      errors.push(`Eror saat membaca CSV: ${e.message}`);
    }
  } else {
    // GeoJSON
    try {
      const geo = JSON.parse(fileContent);
      const features = geo.features || (geo.type === 'Feature' ? [geo] : []);

      features.forEach((feat: any, idx: number) => {
        if (!feat.geometry || feat.geometry.type !== 'Point') {
          errors.push(`Fitur ${idx + 1}: Geometri bukan tipe Point.`);
          return;
        }

        const [lng, lat] = feat.geometry.coordinates;
        if (isNaN(lat) || isNaN(lng)) {
          errors.push(`Fitur ${idx + 1}: Koordinat tidak valid.`);
          return;
        }

        if (!isWithinBanjarnegara(lat, lng)) {
          errors.push(`Fitur ${idx + 1}: Koordinat di luar wilayah Banjarnegara.`);
          return;
        }

        const props = feat.properties || {};
        points.push({
          id: `tps-geo-${idx + 1}`,
          name: props.name || props.nama || props.NAMA || `TPS ${idx + 1}`,
          kecamatan: props.kecamatan || props.KECAMATAN,
          desa: props.desa || props.DESA,
          lat,
          lng,
          capacityM3: parseFloat(props.kapasitas || props.capacity) || 6,
          type: props.tipe || props.type || 'TPS Eksisting',
          status: props.status || 'Aktif',
        });
      });
    } catch (e: any) {
      errors.push(`Eror saat membaca GeoJSON: ${e.message}`);
    }
  }

  return { points, errors };
}
