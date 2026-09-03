'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
type MapLibreMap = maplibregl.Map;
type Popup = maplibregl.Popup;
import 'maplibre-gl/dist/maplibre-gl.css';

if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
}
import {
  BANJARNEGARA_CENTER,
  BANJARNEGARA_DEFAULT_ZOOM,
  BASEMAP_STYLES,
} from '@/lib/constants';
import {
  LayerVisibilityState,
  ExistingTpsPoint,
  SuitabilityFeatureCollection,
  FilterConfig,
} from '@/types';
import { BasemapSwitcher, BasemapType } from './BasemapSwitcher';
import { Legend } from './Legend';
import { formatNumber, formatVolume } from '@/lib/utils';
import { SUITABILITY_COLORS } from '@/lib/colors';

interface MapContainerProps {
  layers: LayerVisibilityState;
  suitabilityFeatures: SuitabilityFeatureCollection;
  coverageFeatures: any;
  gapFeatures: any;
  existingTps: ExistingTpsPoint[];
  filter: FilterConfig;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  layers,
  suitabilityFeatures,
  coverageFeatures,
  gapFeatures,
  existingTps,
  filter,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const [currentBasemap, setCurrentBasemap] = useState<BasemapType>('streets');
  const [mapLoaded, setMapLoaded] = useState(false);

  // Helper to build initial style with all 3 raster basemap providers
  const buildInitialStyle = useCallback((): maplibregl.StyleSpecification => {
    return {
      version: 8,
      sources: {
        'raster-streets': {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors',
        },
        'raster-satellite': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: '&copy; Esri, Maxar, Earthstar Geographics',
        },
        'raster-topo': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: '&copy; Esri, Garmin, FAO, USGS, EPA, NPS',
        },
      },
      layers: [
        {
          id: 'raster-streets-layer',
          type: 'raster',
          source: 'raster-streets',
          layout: { visibility: 'visible' },
          minzoom: 0,
          maxzoom: 19,
        },
        {
          id: 'raster-satellite-layer',
          type: 'raster',
          source: 'raster-satellite',
          layout: { visibility: 'none' },
          minzoom: 0,
          maxzoom: 19,
        },
        {
          id: 'raster-topo-layer',
          type: 'raster',
          source: 'raster-topo',
          layout: { visibility: 'none' },
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };
  }, []);

  // Function to initialize all map sources and layers in exact order
  const initMapSourcesAndLayers = useCallback((map: MapLibreMap) => {
    try {
      // 1. Static Sources
      if (!map.getSource('src-slope')) {
        map.addSource('src-slope', { type: 'geojson', data: '/data/slope.geojson' });
      }
      if (!map.getSource('src-pola-ruang')) {
        map.addSource('src-pola-ruang', { type: 'geojson', data: '/data/pola_ruang.geojson' });
      }
      if (!map.getSource('src-badan-air')) {
        map.addSource('src-badan-air', { type: 'geojson', data: '/data/badan_air.geojson' });
      }
      if (!map.getSource('src-sungai')) {
        map.addSource('src-sungai', { type: 'geojson', data: '/data/sungai.geojson' });
      }
      if (!map.getSource('src-jalan')) {
        map.addSource('src-jalan', { type: 'geojson', data: '/data/jaringan_jalan.geojson' });
      }
      if (!map.getSource('src-desa')) {
        map.addSource('src-desa', { type: 'geojson', data: '/data/administrasi_desa.geojson' });
      }
      if (!map.getSource('src-kecamatan')) {
        map.addSource('src-kecamatan', { type: 'geojson', data: '/data/administrasi_kecamatan.geojson' });
      }
      if (!map.getSource('src-longsor')) {
        map.addSource('src-longsor', { type: 'geojson', data: '/data/kelas_longsor.geojson' });
      }
      if (!map.getSource('src-banjir')) {
        map.addSource('src-banjir', { type: 'geojson', data: '/data/kelas_banjir.geojson' });
      }

      // 2. Dynamic Sources (Initialize with current or empty GeoJSON)
      if (!map.getSource('src-service-gap')) {
        map.addSource('src-service-gap', {
          type: 'geojson',
          data: gapFeatures || { type: 'FeatureCollection', features: [] },
        });
      }
      if (!map.getSource('src-suitability')) {
        map.addSource('src-suitability', {
          type: 'geojson',
          data: suitabilityFeatures || { type: 'FeatureCollection', features: [] },
        });
      }
      if (!map.getSource('src-service-coverage')) {
        map.addSource('src-service-coverage', {
          type: 'geojson',
          data: coverageFeatures?.bufferFeatures || { type: 'FeatureCollection', features: [] },
        });
      }
      if (!map.getSource('src-tps-points')) {
        map.addSource('src-tps-points', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: existingTps.map((t) => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [t.lng, t.lat] },
              properties: t,
            })),
          },
        });
      }

      // 3. Add Layers in Bottom-to-Top Visual Order
      // Layer 1: Slope
      if (!map.getLayer('layer-slope-fill')) {
        map.addLayer({
          id: 'layer-slope-fill',
          type: 'fill',
          source: 'src-slope',
          layout: {
            visibility: layers.slope ? 'visible' : 'none',
          },
          paint: {
            'fill-color': ['coalesce', ['get', 'warna'], '#1a9850'],
            'fill-opacity': 0.55,
          },
        });
      }

      // Layer 1b: Kelas Longsor BPBD
      if (!map.getLayer('layer-longsor-fill')) {
        map.addLayer({
          id: 'layer-longsor-fill',
          type: 'fill',
          source: 'src-longsor',
          layout: {
            visibility: layers.kelasLongsor ? 'visible' : 'none',
          },
          paint: {
            'fill-color': [
              'match',
              ['get', 'KLS_BENC'],
              'Tinggi', '#E11D48',
              'Sedang', '#F59E0B',
              'Rendah', '#10B981',
              '#E11D48',
            ],
            'fill-opacity': 0.55,
          },
        });
      }

      // Layer 1c: Kelas Banjir BPBD
      if (!map.getLayer('layer-banjir-fill')) {
        map.addLayer({
          id: 'layer-banjir-fill',
          type: 'fill',
          source: 'src-banjir',
          layout: {
            visibility: layers.kelasBanjir ? 'visible' : 'none',
          },
          paint: {
            'fill-color': [
              'match',
              ['get', 'KLS_BENC'],
              'Tinggi', '#1D4ED8',
              'Sedang', '#3B82F6',
              'Rendah', '#93C5FD',
              '#3B82F6',
            ],
            'fill-opacity': 0.55,
          },
        });
      }

      // Layer 2: Pola Ruang RTRW
      if (!map.getLayer('layer-pola-ruang-fill')) {
        map.addLayer({
          id: 'layer-pola-ruang-fill',
          type: 'fill',
          source: 'src-pola-ruang',
          layout: {
            visibility: layers.polaRuang ? 'visible' : 'none',
          },
          paint: {
            'fill-color': [
              'case',
              ['==', ['get', 'Status'], 'Lindung'],
              '#0284C7',
              '#F59E0B',
            ],
            'fill-opacity': 0.45,
          },
        });
      }

      // Layer 3: Badan Air (Danau / Waduk Mrica)
      if (!map.getLayer('layer-badan-air-fill')) {
        map.addLayer({
          id: 'layer-badan-air-fill',
          type: 'fill',
          source: 'src-badan-air',
          paint: {
            'fill-color': '#38BDF8',
            'fill-opacity': 0.6,
          },
        });
      }

      // Layer 4: Sungai
      if (!map.getLayer('layer-sungai-line')) {
        map.addLayer({
          id: 'layer-sungai-line',
          type: 'line',
          source: 'src-sungai',
          paint: {
            'line-color': '#0EA5E9',
            'line-width': 1.6,
            'line-opacity': 0.8,
          },
        });
      }

      // Layer 5: Jaringan Jalan Utama
      if (!map.getLayer('layer-jalan-line')) {
        map.addLayer({
          id: 'layer-jalan-line',
          type: 'line',
          source: 'src-jalan',
          paint: {
            'line-color': '#475569',
            'line-width': 1.2,
            'line-opacity': 0.7,
          },
        });
      }

      // Layer 6: Service Gap (Area Belum Terlayani - Red)
      if (!map.getLayer('layer-service-gap-fill')) {
        map.addLayer({
          id: 'layer-service-gap-fill',
          type: 'fill',
          source: 'src-service-gap',
          paint: {
            'fill-color': '#DC2626',
            'fill-opacity': 0.28,
          },
        });
      }
      if (!map.getLayer('layer-service-gap-line')) {
        map.addLayer({
          id: 'layer-service-gap-line',
          type: 'line',
          source: 'src-service-gap',
          paint: {
            'line-color': '#EF4444',
            'line-width': 1.5,
            'line-dasharray': [3, 2],
          },
        });
      }

      // Layer 7: Suitability Overlay (Primary Decision Layer)
      if (!map.getLayer('layer-suitability-fill')) {
        map.addLayer({
          id: 'layer-suitability-fill',
          type: 'fill',
          source: 'src-suitability',
          paint: {
            'fill-color': [
              'match',
              ['get', 'category'],
              'Sangat Sesuai',
              SUITABILITY_COLORS['Sangat Sesuai'].fill,
              'Sesuai',
              SUITABILITY_COLORS['Sesuai'].fill,
              'Cukup Sesuai',
              SUITABILITY_COLORS['Cukup Sesuai'].fill,
              'Kurang Sesuai',
              SUITABILITY_COLORS['Kurang Sesuai'].fill,
              'Tidak Sesuai (Constraint)',
              SUITABILITY_COLORS['Tidak Sesuai (Constraint)'].fill,
              '#94A3B8',
            ],
            'fill-opacity': 0.65,
          },
        });
      }
      if (!map.getLayer('layer-suitability-line')) {
        map.addLayer({
          id: 'layer-suitability-line',
          type: 'line',
          source: 'src-suitability',
          paint: {
            'line-color': '#1E293B',
            'line-width': 0.6,
            'line-opacity': 0.7,
          },
        });
      }

      // Layer 8: Service Coverage Buffer (Blue circle buffers)
      if (!map.getLayer('layer-service-coverage-fill')) {
        map.addLayer({
          id: 'layer-service-coverage-fill',
          type: 'fill',
          source: 'src-service-coverage',
          paint: {
            'fill-color': '#3B82F6',
            'fill-opacity': 0.35,
          },
        });
      }
      if (!map.getLayer('layer-service-coverage-line')) {
        map.addLayer({
          id: 'layer-service-coverage-line',
          type: 'line',
          source: 'src-service-coverage',
          paint: {
            'line-color': '#2563EB',
            'line-width': 2,
          },
        });
      }

      // Layer 9: Administrasi Desa
      if (!map.getLayer('layer-desa-line')) {
        map.addLayer({
          id: 'layer-desa-line',
          type: 'line',
          source: 'src-desa',
          paint: {
            'line-color': '#94A3B8',
            'line-width': 0.8,
            'line-dasharray': [2, 2],
            'line-opacity': 0.6,
          },
        });
      }

      // Layer 10: Administrasi Kecamatan
      if (!map.getLayer('layer-kecamatan-line')) {
        map.addLayer({
          id: 'layer-kecamatan-line',
          type: 'line',
          source: 'src-kecamatan',
          paint: {
            'line-color': '#4338CA',
            'line-width': 2.2,
            'line-opacity': 0.9,
          },
        });
      }

      // Layer 11: TPS Eksisting Points
      if (!map.getLayer('layer-tps-points')) {
        map.addLayer({
          id: 'layer-tps-points',
          type: 'circle',
          source: 'src-tps-points',
          paint: {
            'circle-color': '#EF4444',
            'circle-radius': 7,
            'circle-stroke-width': 2.5,
            'circle-stroke-color': '#FFFFFF',
          },
        });
      }
    } catch (err) {
      console.warn('Error during initMapSourcesAndLayers:', err);
    }
  }, [gapFeatures, suitabilityFeatures, coverageFeatures, existingTps]);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: buildInitialStyle(),
      center: BANJARNEGARA_CENTER,
      zoom: BANJARNEGARA_DEFAULT_ZOOM,
      minZoom: 8.5,
      maxZoom: 18,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');
    map.addControl(new maplibregl.FullscreenControl(), 'top-right');

    map.on('load', () => {
      initMapSourcesAndLayers(map);
      setMapLoaded(true);
      (window as any).map = map;
    });

    mapRef.current = map;

    return () => {
      setMapLoaded(false);
      map.remove();
      mapRef.current = null;
    };
  }, [buildInitialStyle, initMapSourcesAndLayers]);

  // Handle Basemap Switch (Instant toggle between raster basemap layers without destroying overlays)
  const handleBasemapChange = useCallback((type: BasemapType) => {
    setCurrentBasemap(type);
    const map = mapRef.current;
    if (!map) return;

    if (map.getLayer('raster-streets-layer')) {
      map.setLayoutProperty('raster-streets-layer', 'visibility', type === 'streets' ? 'visible' : 'none');
    }
    if (map.getLayer('raster-satellite-layer')) {
      map.setLayoutProperty('raster-satellite-layer', 'visibility', type === 'satellite' ? 'visible' : 'none');
    }
    if (map.getLayer('raster-topo-layer')) {
      map.setLayoutProperty('raster-topo-layer', 'visibility', type === 'topo' ? 'visible' : 'none');
    }
  }, []);

  // 1. Data Sync Effect: Update GeoJSON sources whenever analysis result changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    try {
      const srcSuit = map.getSource('src-suitability') as maplibregl.GeoJSONSource;
      if (srcSuit && suitabilityFeatures) {
        srcSuit.setData(suitabilityFeatures);
      }

      const srcGap = map.getSource('src-service-gap') as maplibregl.GeoJSONSource;
      if (srcGap && gapFeatures) {
        srcGap.setData(gapFeatures);
      }

      const srcCov = map.getSource('src-service-coverage') as maplibregl.GeoJSONSource;
      if (srcCov && coverageFeatures?.bufferFeatures) {
        srcCov.setData(coverageFeatures.bufferFeatures);
      }

      const srcTps = map.getSource('src-tps-points') as maplibregl.GeoJSONSource;
      if (srcTps && existingTps) {
        srcTps.setData({
          type: 'FeatureCollection',
          features: existingTps.map((t) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [t.lng, t.lat] },
            properties: t,
          })),
        });
      }
    } catch (e) {
      console.warn('Error updating map sources data:', e);
    }
  }, [mapLoaded, suitabilityFeatures, coverageFeatures, gapFeatures, existingTps]);

  // 2. Visibility Sync Effect: Update layer visibility whenever sidebar toggles change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const setVis = (layerId: string, visible: boolean) => {
      try {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
        }
      } catch (_) {}
    };

    setVis('layer-slope-fill', layers.slope);
    setVis('layer-longsor-fill', layers.kelasLongsor);
    setVis('layer-banjir-fill', layers.kelasBanjir);
    setVis('layer-pola-ruang-fill', layers.polaRuang);
    setVis('layer-badan-air-fill', layers.badanAir);
    setVis('layer-sungai-line', layers.sungai);
    setVis('layer-jalan-line', layers.jaringanJalan);
    setVis('layer-service-gap-fill', layers.serviceGap);
    setVis('layer-service-gap-line', layers.serviceGap);
    setVis('layer-suitability-fill', layers.suitabilityOverlay);
    setVis('layer-suitability-line', layers.suitabilityOverlay);
    setVis('layer-service-coverage-fill', layers.serviceCoverage);
    setVis('layer-service-coverage-line', layers.serviceCoverage);
    setVis('layer-desa-line', layers.administrasiDesa);
    setVis('layer-kecamatan-line', layers.administrasiKecamatan);
    setVis('layer-tps-points', layers.tpsEksisting);
  }, [mapLoaded, layers]);

  // 3. Handle Map Click for Rich Popup
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['layer-suitability-fill', 'layer-tps-points'],
      });

      if (!features || features.length === 0) {
        if (popupRef.current) popupRef.current.remove();
        return;
      }

      const topFeat = features[0];
      const p = topFeat.properties as any;

      if (topFeat.layer.id === 'layer-tps-points') {
        new maplibregl.Popup({ closeButton: true, maxWidth: '280px' })
          .setLngLat(e.lngLat)
          .setHTML(
            `
            <div class="p-2 space-y-1.5 text-xs text-slate-800">
              <div class="font-bold text-sm text-slate-900 border-b pb-1">
                🗑️ ${p.name || 'TPS Eksisting'}
              </div>
              <div><b>Kapasitas:</b> ${p.capacityM3 || 6} m³</div>
              <div><b>Tipe:</b> ${p.type || 'TPS 3R'}</div>
              <div><b>Wilayah:</b> ${p.desa || ''}, ${p.kecamatan || 'Banjarnegara'}</div>
            </div>
            `
          )
          .addTo(map);
        return;
      }

      // Suitability Feature Popup
      const catColor = SUITABILITY_COLORS[p.category as keyof typeof SUITABILITY_COLORS]?.fill || '#64748B';
      let constraintList: string[] = [];
      if (Array.isArray(p.constraintReasons)) {
        constraintList = p.constraintReasons;
      } else if (typeof p.constraintReasons === 'string' && p.constraintReasons.trim()) {
        try {
          const parsed = JSON.parse(p.constraintReasons);
          constraintList = Array.isArray(parsed) ? parsed : [String(parsed)];
        } catch {
          constraintList = [p.constraintReasons];
        }
      }

      const html = `
        <div class="p-3 space-y-2.5 text-xs text-slate-800 max-w-xs font-sans">
          <!-- Header -->
          <div class="border-b pb-2">
            <div class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Evaluasi Lokasi TPS
            </div>
            <div class="text-sm font-bold text-slate-900 leading-tight">
              Desa ${p.name || p.desa}
            </div>
            <div class="text-[11px] text-slate-600">
              Kecamatan ${p.kecamatan}
            </div>
          </div>

          <!-- Score Badge -->
          <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border">
            <div>
              <span class="text-[10px] text-slate-500 block">Kategori Kesesuaian</span>
              <span class="font-bold text-xs" style="color: ${catColor}">${p.category}</span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-500 block">Skor WLC</span>
              <span class="text-base font-black font-mono" style="color: ${catColor}">${p.score}/100</span>
            </div>
          </div>

          ${
            p.isConstrained
              ? `
            <div class="p-2 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-800 space-y-1">
              <span class="font-bold block">⚠️ Alasan Tereliminasi (Hard Constraint):</span>
              <ul class="list-disc pl-3.5 space-y-0.5">
                ${constraintList.map((r: string) => `<li>${r}</li>`).join('')}
              </ul>
            </div>
          `
              : ''
          }

          <!-- Attributes Grid -->
          <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div class="bg-slate-50 p-1.5 rounded">
              <span class="text-slate-500 text-[10px] block">Populasi Base (${formatNumber(p.populationBase)} jiwa)</span>
              <span class="font-bold text-slate-800">${formatNumber(p.populationProjected)} jiwa (Pt)</span>
            </div>
            <div class="bg-slate-50 p-1.5 rounded">
              <span class="text-slate-500 text-[10px] block">Estimasi Sampah</span>
              <span class="font-bold text-amber-700">${formatVolume(p.wasteGenerationDailyM3)}/hari</span>
            </div>
            <div class="bg-slate-50 p-1.5 rounded">
              <span class="text-slate-500 text-[10px] block">Akses Jalan</span>
              <span class="font-semibold text-slate-800">${p.nearestRoadDistanceM} m</span>
            </div>
            <div class="bg-slate-50 p-1.5 rounded">
              <span class="text-slate-500 text-[10px] block">Kemiringan Lereng</span>
              <span class="font-semibold text-slate-800">${p.slopePercent}% (${p.slopeCategory})</span>
            </div>
          </div>

          <div class="text-[10px] text-slate-500 border-t pt-1.5 flex justify-between">
            <span>RTRW: <b>${p.spatialPlanningStatus}</b></span>
            <span>Longsor: <b>${p.landslideRiskLevel}</b></span>
          </div>
        </div>
      `;

      if (popupRef.current) popupRef.current.remove();
      popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: '320px' })
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map);
    };

    map.on('click', handleMapClick);

    const setPointer = () => (map.getCanvas().style.cursor = 'pointer');
    const unsetPointer = () => (map.getCanvas().style.cursor = '');

    map.on('mouseenter', 'layer-suitability-fill', setPointer);
    map.on('mouseleave', 'layer-suitability-fill', unsetPointer);
    map.on('mouseenter', 'layer-tps-points', setPointer);
    map.on('mouseleave', 'layer-tps-points', unsetPointer);

    return () => {
      map.off('click', handleMapClick);
      map.off('mouseenter', 'layer-suitability-fill', setPointer);
      map.off('mouseleave', 'layer-suitability-fill', unsetPointer);
      map.off('mouseenter', 'layer-tps-points', setPointer);
      map.off('mouseleave', 'layer-tps-points', unsetPointer);
    };
  }, [mapLoaded]);

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Basemap Switcher (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-10">
        <BasemapSwitcher
          currentBasemap={currentBasemap}
          onChange={handleBasemapChange}
        />
      </div>

      {/* Floating Dynamic Legend (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-10">
        <Legend layers={layers} />
      </div>
    </div>
  );
};
