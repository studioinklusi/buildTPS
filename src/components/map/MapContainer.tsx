'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import * as turf from '@turf/turf';
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
  const roadsIndexRef = useRef<{ line: any; bbox: number[] }[]>([]);

  // Pre-index road segments in background for instantaneous point-to-road distance on click
  useEffect(() => {
    fetch('/data/jaringan_jalan.geojson')
      .then((res) => res.json())
      .then((data) => {
        const flat: { line: any; bbox: number[] }[] = [];
        for (const f of data.features || []) {
          const fl = turf.flatten(f);
          for (const ff of fl.features) {
            if ((ff.geometry as any).type === 'LineString') {
              flat.push({ line: ff, bbox: turf.bbox(ff) });
            }
          }
        }
        roadsIndexRef.current = flat;
      })
      .catch(() => {});
  }, []);

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
      if (!map.getSource('src-sempadan-sungai')) {
        map.addSource('src-sempadan-sungai', { type: 'geojson', data: '/data/sempadan_sungai.geojson' });
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


      // Layer 3: Jaringan Jalan Utama & Kolektor (Akses Truk Pengangkut)
      if (!map.getLayer('layer-jalan-line')) {
        map.addLayer({
          id: 'layer-jalan-line',
          type: 'line',
          source: 'src-jalan',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
            visibility: layers.jaringanJalan ? 'visible' : 'none',
          },
          paint: {
            // Visual hierarchy: Arteri/Trunk/Primary in bold blue (#2563EB), Sekunder/Kolektor in slate (#64748B)
            'line-color': [
              'match',
              ['get', 'road_class'],
              1,
              '#2563EB',
              '#64748B',
            ],
            'line-width': [
              'match',
              ['get', 'road_class'],
              1,
              2.6,
              1.4,
            ],
            'line-opacity': 0.85,
          },
        });
      }

      // Layer 4: Service Gap (Area Belum Terlayani - Red)
      if (!map.getLayer('layer-service-gap-fill')) {
        map.addLayer({
          id: 'layer-service-gap-fill',
          type: 'fill',
          source: 'src-service-gap',
          layout: {
            visibility: layers.serviceGap ? 'visible' : 'none',
          },
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
          layout: {
            visibility: layers.serviceGap ? 'visible' : 'none',
          },
          paint: {
            'line-color': '#EF4444',
            'line-width': 1.5,
            'line-dasharray': [3, 2],
          },
        });
      }

      // Layer 5: Suitability Overlay (Primary Decision Layer)
      if (!map.getLayer('layer-suitability-fill')) {
        map.addLayer({
          id: 'layer-suitability-fill',
          type: 'fill',
          source: 'src-suitability',
          layout: {
            visibility: layers.suitabilityOverlay ? 'visible' : 'none',
          },
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
          layout: {
            visibility: layers.suitabilityOverlay ? 'visible' : 'none',
          },
          paint: {
            'line-color': '#1E293B',
            'line-width': 0.6,
            'line-opacity': 0.7,
          },
        });
      }

      // Layer 5b: Pola Ruang RTRW (Full 13-zone ATR/BPN Standard Palette)
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
              'match',
              ['get', 'NAMOBJ'],
              'Kawasan Permukiman Perkotaan', '#EA580C',
              'Kawasan Permukiman Perdesaan', '#FBBF24',
              'Kawasan Tanaman Pangan', '#84CC16',
              'Kawasan Hortikultura', '#65A30D',
              'Kawasan Perkebunan', '#15803D',
              'Kawasan Hutan Produksi Tetap', '#16A34A',
              'Kawasan Hutan Produksi Terbatas', '#22C55E',
              'Kawasan Hutan Lindung', '#065F46',
              'Cagar Alam', '#064E3B',
              'Kawasan Peruntukan Industri', '#7C3AED',
              'Badan Air', '#0284C7',
              'Kawasan Cagar Budaya', '#9333EA',
              'Kawasan Keunikan Batuan dan Fosil', '#D97706',
              '#94A3B8',
            ],
            'fill-opacity': 0.72,
          },
        });
      }
      if (!map.getLayer('layer-pola-ruang-line')) {
        map.addLayer({
          id: 'layer-pola-ruang-line',
          type: 'line',
          source: 'src-pola-ruang',
          layout: {
            visibility: layers.polaRuang ? 'visible' : 'none',
          },
          paint: {
            'line-color': '#1E293B',
            'line-width': 0.6,
            'line-opacity': 0.45,
          },
        });
      }

      // Layer 6: Sempadan Sungai Buffer 50m (Hard Constraint Mask)
      if (!map.getLayer('layer-sempadan-sungai-fill')) {
        map.addLayer({
          id: 'layer-sempadan-sungai-fill',
          type: 'fill',
          source: 'src-sempadan-sungai',
          layout: {
            visibility: layers.sungai ? 'visible' : 'none',
          },
          paint: {
            'fill-color': '#0284C7',
            'fill-opacity': 0.35,
          },
        });
      }
      if (!map.getLayer('layer-sempadan-sungai-line')) {
        map.addLayer({
          id: 'layer-sempadan-sungai-line',
          type: 'line',
          source: 'src-sempadan-sungai',
          layout: {
            visibility: layers.sungai ? 'visible' : 'none',
          },
          paint: {
            'line-color': '#0284C7',
            'line-width': 1,
            'line-opacity': 0.7,
            'line-dasharray': [3, 2],
          },
        });
      }

      // Layer 7: Badan Air & Waduk Mrica (Kawasan Lindung Perairan - Hard Constraint)
      if (!map.getLayer('layer-badan-air-fill')) {
        map.addLayer({
          id: 'layer-badan-air-fill',
          type: 'fill',
          source: 'src-badan-air',
          layout: {
            visibility: layers.badanAir ? 'visible' : 'none',
          },
          paint: {
            'fill-color': '#0284C7',
            'fill-opacity': 0.82,
          },
        });
      }
      if (!map.getLayer('layer-badan-air-line')) {
        map.addLayer({
          id: 'layer-badan-air-line',
          type: 'line',
          source: 'src-badan-air',
          layout: {
            visibility: layers.badanAir ? 'visible' : 'none',
          },
          paint: {
            'line-color': '#0369A1',
            'line-width': 1.6,
            'line-opacity': 1.0,
          },
        });
      }

      // Layer 8: Sungai (Aliran Air Utama)
      if (!map.getLayer('layer-sungai-line')) {
        map.addLayer({
          id: 'layer-sungai-line',
          type: 'line',
          source: 'src-sungai',
          layout: {
            visibility: layers.sungai ? 'visible' : 'none',
          },
          paint: {
            'line-color': '#0369A1',
            'line-width': 2.0,
            'line-opacity': 0.95,
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
    setVis('layer-badan-air-line', layers.badanAir);
    setVis('layer-sempadan-sungai-fill', layers.sungai);
    setVis('layer-sempadan-sungai-line', layers.sungai);
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
        layers: [
          'layer-tps-points',
          'layer-badan-air-fill',
          'layer-sempadan-sungai-fill',
          'layer-sungai-line',
          ...(layers.jaringanJalan ? ['layer-jalan-line'] : []),
          ...(layers.polaRuang && !layers.suitabilityOverlay ? ['layer-pola-ruang-fill'] : []),
          'layer-suitability-fill',
          'layer-pola-ruang-fill',
        ],
      });

      if (!features || features.length === 0) {
        if (popupRef.current) popupRef.current.remove();
        return;
      }

      const topFeat = features[0];
      const p = topFeat.properties as any;

      // 1. Popup: Titik TPS Eksisting / Uploaded
      if (topFeat.layer.id === 'layer-tps-points') {
        // Check if TPS point falls within a waterbody or river buffer
        const waterHits = map.queryRenderedFeatures(e.point, {
          layers: ['layer-badan-air-fill', 'layer-sempadan-sungai-fill'],
        });
        const isIllegalWaterLocation = waterHits && waterHits.length > 0;

        new maplibregl.Popup({ closeButton: true, maxWidth: '290px' })
          .setLngLat(e.lngLat)
          .setHTML(
            `
            <div class="p-2.5 space-y-2 text-xs text-slate-800 font-sans">
              <div class="font-bold text-sm text-slate-900 border-b pb-1 flex items-center justify-between">
                <span>🗑️ ${p.name || 'TPS Eksisting'}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded ${isIllegalWaterLocation ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'} font-semibold">
                  ${isIllegalWaterLocation ? 'Ilegal/Bahaya' : 'Aktif'}
                </span>
              </div>
              <div class="space-y-1 text-[11px] text-slate-700">
                <div><b>Kapasitas:</b> ${p.capacityM3 || 6} m³</div>
                <div><b>Tipe:</b> ${p.type || 'TPS 3R'}</div>
                <div><b>Wilayah:</b> ${p.desa || ''}, ${p.kecamatan || 'Banjarnegara'}</div>
              </div>
              ${
                isIllegalWaterLocation
                  ? `
                <div class="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[10.5px] leading-tight space-y-1">
                  <div class="font-bold text-rose-900 flex items-center gap-1">
                    ⚠️ PELANGGARAN ZONA LINDUNG
                  </div>
                  <div>Titik TPS ini terdeteksi berada di dalam <b>Badan Air / Sempadan Sungai</b>! Menurut SNI 19-3241-1994, titik ini wajib direlokasi ke daratan aman.</div>
                </div>
              `
                  : ''
              }
            </div>
            `
          )
          .addTo(map);
        return;
      }

      // 2. Popup: Badan Air / Waduk Mrica (Hard Constraint)
      if (topFeat.layer.id === 'layer-badan-air-fill') {
        const waterName = p.name || 'Waduk Mrica (Bendungan PB Soedirman)';
        new maplibregl.Popup({ closeButton: true, maxWidth: '320px' })
          .setLngLat(e.lngLat)
          .setHTML(
            `
            <div class="p-3 space-y-2.5 text-xs text-slate-800 max-w-xs font-sans">
              <div class="border-b pb-2">
                <div class="text-[10px] uppercase font-black text-rose-600 tracking-wider flex items-center gap-1">
                  ⛔ HARD CONSTRAINT (ZONA TERELIMINASI)
                </div>
                <div class="text-sm font-bold text-slate-900 leading-tight mt-0.5">
                  ${waterName}
                </div>
                <div class="text-[11px] text-slate-600">
                  Kawasan Konservasi Perairan & Sumber Daya Air
                </div>
              </div>

              <div class="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                <div class="font-bold flex items-center justify-between text-xs">
                  <span>Kategori Kelayakan:</span>
                  <span class="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black">TIDAK LAYAK (SKOR 0)</span>
                </div>
                <div class="text-[11px] text-rose-800 leading-relaxed pt-1">
                  <b>Dilarang Mutlak:</b> Lokasi ini berada langsung di dalam perairan waduk aktif. Penempatan sarana persampahan di badan air melanggar undang-undang dan dilarang keras.
                </div>
              </div>

              <div class="space-y-1.5 text-[10.5px] text-slate-600 border-t pt-2">
                <div><b>Dasar Regulasi:</b> SNI 19-3241-1994 (Kriteria Pemilihan Lokasi TPA/TPS) Pasal 4 & Permen LHK No. P.59/2016.</div>
                <div><b>Dampak Risiko:</b> Pencemaran air baku PDAM, sedimentasi turbin PLTA Mrica, dan pencemaran bahan beracun ke ekosistem air.</div>
              </div>
            </div>
            `
          )
          .addTo(map);
        return;
      }

      // 3. Popup: Sempadan Sungai Buffer 50m / Sungai
      if (topFeat.layer.id === 'layer-sempadan-sungai-fill' || topFeat.layer.id === 'layer-sungai-line') {
        const riverName = p.name || 'Sungai Serayu';
        new maplibregl.Popup({ closeButton: true, maxWidth: '320px' })
          .setLngLat(e.lngLat)
          .setHTML(
            `
            <div class="p-3 space-y-2.5 text-xs text-slate-800 max-w-xs font-sans">
              <div class="border-b pb-2">
                <div class="text-[10px] uppercase font-black text-rose-600 tracking-wider flex items-center gap-1">
                  ⛔ HARD CONSTRAINT (SEMPADAN SUNGAI)
                </div>
                <div class="text-sm font-bold text-slate-900 leading-tight mt-0.5">
                  Sempadan ${riverName}
                </div>
                <div class="text-[11px] text-slate-600">
                  Buffer Perlindungan Sempadan Aliran Sungai (50 Meter)
                </div>
              </div>

              <div class="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                <div class="font-bold flex items-center justify-between text-xs">
                  <span>Kategori Kelayakan:</span>
                  <span class="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black">TIDAK LAYAK (SKOR 0)</span>
                </div>
                <div class="text-[11px] text-rose-800 leading-relaxed pt-1">
                  <b>Dilarang Mutlak:</b> Berada di dalam radius sempadan sungai (&lt; 50 meter). Menurut PP No. 38/2011 dan Permen PUPR No. 28/2015, sempadan sungai dilindungi dari aktivitas penampungan sampah.
                </div>
              </div>

              <div class="space-y-1.5 text-[10.5px] text-slate-600 border-t pt-2">
                <div><b>Dasar Regulasi:</b> PP No. 38 Tahun 2011 & SNI 19-3241-1994.</div>
                <div><b>Dampak Risiko:</b> Pencucian lindi (leachate) langsung ke badan air, bahaya longsor tebing sungai, dan risiko terseret banjir bandang.</div>
              </div>
            </div>
            `
          )
          .addTo(map);
        return;
      }

      // 3b. Popup: Koridor Jalan Aksesibilitas Truk Pengangkut (SNI 19-3241-1994)
      if (topFeat.layer.id === 'layer-jalan-line') {
        const roadName = p.name ? p.name : (p.road_class === 1 ? 'Ruas Jalan Arteri / Poros Utama' : 'Ruas Jalan Kolektor / Sekunder');
        const roadClassLabel = p.road_class_label || (p.road_class === 1 ? 'Jalan Arteri' : 'Jalan Kolektor');
        const highwayType = (p.highway || '').toUpperCase();
        const roadLen = p.length ? Math.round(p.length) : null;
        const isArteri = p.road_class === 1;

        new maplibregl.Popup({ closeButton: true, maxWidth: '330px' })
          .setLngLat(e.lngLat)
          .setHTML(
            `
            <div class="p-3 space-y-2.5 text-xs text-slate-800 max-w-xs font-sans">
              <div class="border-b pb-2">
                <div class="text-[10px] uppercase font-black text-blue-600 tracking-wider flex items-center gap-1.5">
                  <span>🚛 KORIDOR AKSESIBILITAS TRUK PENGANGKUT</span>
                </div>
                <div class="text-sm font-bold text-slate-900 leading-tight mt-1">
                  ${roadName}
                </div>
                <div class="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span class="px-1.5 py-0.5 rounded ${isArteri ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'} font-semibold text-[10px]">
                    ${roadClassLabel} (${highwayType})
                  </span>
                  ${roadLen ? `<span class="text-slate-400">• Panjang: ${roadLen} m</span>` : ''}
                </div>
              </div>

              <div class="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-950 space-y-1.5">
                <div class="font-bold flex items-center justify-between text-xs text-blue-900">
                  <span>Kelayakan Manuver Armada:</span>
                  <span class="px-2 py-0.5 rounded ${isArteri ? 'bg-blue-700 text-white' : 'bg-emerald-600 text-white'} text-[10px] font-black">
                    ${isArteri ? 'SANGAT LAYAK (ARTERY)' : 'LAYAK (ARMROLL 6-8 m³)'}
                  </span>
                </div>
                <div class="text-[11px] text-blue-900/85 leading-relaxed">
                  <b>Standar Teknis:</b> Memenuhi syarat lebar badan jalan ≥ 4–6 meter & daya dukung perkerasan untuk manuver truk armroll kontainer dan truk compactor dinas.
                </div>
              </div>

              <div class="space-y-1 text-[10.5px] text-slate-600 border-t pt-2">
                <div><b>Fungsi dalam Sistem SDSS:</b> Menjadi koridor target perhitungan jarak kedekatan (Aksesibilitas Jalan) bagi 276 desa di Banjarnegara.</div>
                <div class="text-[10px] text-slate-400 italic">Dasar Regulasi: SNI 19-3241-1994 & Permen PU 03/2013 (Tata Cara Pengelolaan Sampah Perkotaan).</div>
              </div>
            </div>
            `
          )
          .addTo(map);
        return;
      }

      // 3c. Popup: Pola Ruang RTRW
      if (topFeat.layer.id === 'layer-pola-ruang-fill') {
        const zonaName = p.NAMOBJ || 'Kawasan Budidaya';
        const isLindung = p.Status === 'Lindung' || zonaName.toLowerCase().includes('lindung') || zonaName.toLowerCase().includes('cagar') || zonaName.toLowerCase().includes('air');
        new maplibregl.Popup({ closeButton: true, maxWidth: '300px' })
          .setLngLat(e.lngLat)
          .setHTML(
            `
            <div class="p-3 space-y-2 text-xs text-slate-800 font-sans">
              <div class="border-b pb-1.5 flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase tracking-wider text-purple-700">Pola Ruang RTRW</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded font-bold ${isLindung ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}">
                  ${isLindung ? 'Kawasan Lindung' : 'Kawasan Budidaya'}
                </span>
              </div>
              <div class="font-bold text-sm text-slate-900">${zonaName}</div>
              <div class="text-[11px] text-slate-600 leading-relaxed">
                ${isLindung 
                  ? '<b>Status Regulasi: Dilarang Mutlak.</b> Berdasarkan Perda RTRW Kab. Banjarnegara, kawasan lindung tidak diizinkan untuk sarana persampahan (Skor Bobot: 0).' 
                  : '<b>Status Regulasi: Diizinkan.</b> Termasuk kawasan budidaya yang memenuhi kriteria kelayakan teknis tata ruang untuk penempatan TPS / TPS 3R.'}
              </div>
            </div>
            `
          )
          .addTo(map);
        return;
      }

      // 4. Suitability Feature Popup (Daratan Desa)
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

      // Compute instantaneous point-to-road distance from exact click coordinates (tapak)
      let pointRoadDist = p.nearestRoadDistanceM;
      if (roadsIndexRef.current.length > 0) {
        const clickPt = turf.point([e.lngLat.lng, e.lngLat.lat]);
        const [cLng, cLat] = [e.lngLat.lng, e.lngLat.lat];
        let minDist = 99999;
        const searchRadii = [0.003, 0.01, 0.03, 0.08]; // ~300m, ~1km, ~3km, ~8km
        for (const r of searchRadii) {
          const box = [cLng - r, cLat - r, cLng + r, cLat + r];
          for (const rd of roadsIndexRef.current) {
            if (rd.bbox[2] < box[0] || rd.bbox[0] > box[2] || rd.bbox[3] < box[1] || rd.bbox[1] > box[3]) continue;
            const d = turf.pointToLineDistance(clickPt, rd.line, { units: 'meters' });
            if (d < minDist) minDist = d;
          }
          if (minDist < (r * 111000 * 0.8)) break;
        }
        if (minDist < 99999) {
          pointRoadDist = Math.max(5, Math.round(minDist));
        }
      }

      const cleanSlopeCat = (p.slopeCategory || '')
        .replace(/\s*\(.*?\)/g, '')
        .trim() || 'Datar';

      const html = `
        <div class="p-3.5 space-y-2.5 text-xs text-slate-800 w-[305px] font-sans">
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
          <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/90 border border-slate-200/80">
            <div>
              <span class="text-[10px] text-slate-500 block font-medium">Kategori Kesesuaian</span>
              <span class="font-bold text-xs" style="color: ${catColor}">${p.category}</span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-500 block font-medium">Skor WLC</span>
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

          <!-- Attributes Grid (2x2 Balanced Cards) -->
          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <div class="bg-slate-50/90 p-2 rounded-lg border border-slate-200/70 flex flex-col justify-between">
              <span class="text-slate-500 text-[10px] block font-medium">Proyeksi Penduduk</span>
              <div class="font-black text-slate-900 text-xs mt-1">${formatNumber(p.populationProjected)} jiwa</div>
              <span class="text-[9.5px] text-slate-400 block mt-0.5">Base: ${formatNumber(p.populationBase)}</span>
            </div>

            <div class="bg-slate-50/90 p-2 rounded-lg border border-slate-200/70 flex flex-col justify-between">
              <span class="text-slate-500 text-[10px] block font-medium">Timbulan Sampah</span>
              <div class="font-black text-amber-700 text-xs mt-1">${formatVolume(p.wasteGenerationDailyM3)}/hari</div>
              <span class="text-[9.5px] text-slate-400 block mt-0.5">SNI 19-3983-1995</span>
            </div>

            <div class="bg-slate-50/90 p-2 rounded-lg border border-slate-200/70 flex flex-col justify-between">
              <div class="flex items-center justify-between text-slate-500 text-[10px]">
                <span class="font-medium">Jalur Truk</span>
                <span class="text-[8.5px] text-blue-700 font-bold bg-blue-50 px-1 py-0.2 rounded border border-blue-100">Tapak</span>
              </div>
              <div class="flex items-center justify-between mt-1">
                <span class="font-black text-slate-900 text-xs">${pointRoadDist} m</span>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  pointRoadDist <= 200
                    ? 'bg-emerald-100 text-emerald-800'
                    : pointRoadDist <= 500
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }">
                  ${pointRoadDist <= 200 ? 'Sangat Layak' : pointRoadDist <= 500 ? 'Layak' : 'Terbatas'}
                </span>
              </div>
            </div>

            <div class="bg-slate-50/90 p-2 rounded-lg border border-slate-200/70 flex flex-col justify-between">
              <span class="text-slate-500 text-[10px] block font-medium">Kemiringan Lereng</span>
              <div class="flex items-center justify-between mt-1">
                <span class="font-black text-slate-900 text-xs">${p.slopePercent}%</span>
                <span class="text-[9px] font-semibold text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded">
                  ${cleanSlopeCat}
                </span>
              </div>
            </div>
          </div>

          <!-- Zoning & Hazard Indicators -->
          <div class="border-t border-slate-200/80 pt-2 space-y-1.5 text-[10.5px]">
            <div class="flex items-center justify-between text-slate-700 bg-slate-50/90 px-2.5 py-1.5 rounded-lg border border-slate-200/70">
              <span class="text-slate-500 font-medium">Zonasi RTRW:</span>
              <span class="font-bold text-slate-800 text-right truncate max-w-[170px]" title="${p.spatialPlanningStatus}">${p.spatialPlanningStatus}</span>
            </div>
            
            <div class="grid grid-cols-2 gap-1.5">
              <div class="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50/90 border border-slate-200/70">
                <span class="text-slate-500">Longsor:</span>
                <span class="font-bold ${p.landslideRiskLevel === 'Tinggi' ? 'text-rose-600' : p.landslideRiskLevel === 'Sedang' ? 'text-amber-600' : 'text-emerald-600'}">
                  ${p.landslideRiskLevel}
                </span>
              </div>
              <div class="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50/90 border border-slate-200/70">
                <span class="text-slate-500">Banjir:</span>
                <span class="font-bold ${p.floodRiskLevel === 'Tinggi' ? 'text-rose-600' : p.floodRiskLevel === 'Sedang' ? 'text-amber-600' : 'text-emerald-600'}">
                  ${p.floodRiskLevel}
                </span>
              </div>
            </div>
          </div>
        </div>
      `;

      if (popupRef.current) popupRef.current.remove();
      popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: '340px' })
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
    map.on('mouseenter', 'layer-jalan-line', setPointer);
    map.on('mouseleave', 'layer-jalan-line', unsetPointer);

    return () => {
      map.off('click', handleMapClick);
      map.off('mouseenter', 'layer-suitability-fill', setPointer);
      map.off('mouseleave', 'layer-suitability-fill', unsetPointer);
      map.off('mouseenter', 'layer-tps-points', setPointer);
      map.off('mouseleave', 'layer-tps-points', unsetPointer);
      map.off('mouseenter', 'layer-jalan-line', setPointer);
      map.off('mouseleave', 'layer-jalan-line', unsetPointer);
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
