const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');

console.log('--- Starting Desa Spatial Data Enrichment ---');

const pubDir = path.join(__dirname, '../public/data');
const kecPath = path.join(pubDir, 'administrasi_kecamatan.geojson');
const desaPath = path.join(pubDir, 'administrasi_desa.geojson');
const polaPath = path.join(pubDir, 'pola_ruang.geojson');
const popPath = path.join(pubDir, 'population_timeseries.json');
const slopePath = path.join(pubDir, 'slope.geojson');
const longsorPath = path.join(pubDir, 'kelas_longsor.geojson');
const banjirPath = path.join(pubDir, 'kelas_banjir.geojson');
const jalanPath = path.join(pubDir, 'jaringan_jalan.geojson');
const sungaiPath = path.join(pubDir, 'sungai.geojson');
const airPath = path.join(pubDir, 'badan_air.geojson');

console.log('Loading datasets...');
const kecData = JSON.parse(fs.readFileSync(kecPath, 'utf8'));
const desaData = JSON.parse(fs.readFileSync(desaPath, 'utf8'));
const polaData = JSON.parse(fs.readFileSync(polaPath, 'utf8'));
const popData = JSON.parse(fs.readFileSync(popPath, 'utf8'));
const slopeData = JSON.parse(fs.readFileSync(slopePath, 'utf8'));
const longsorData = JSON.parse(fs.readFileSync(longsorPath, 'utf8'));
const banjirData = JSON.parse(fs.readFileSync(banjirPath, 'utf8'));
const jalanData = JSON.parse(fs.readFileSync(jalanPath, 'utf8'));
const sungaiData = JSON.parse(fs.readFileSync(sungaiPath, 'utf8'));
const airData = JSON.parse(fs.readFileSync(airPath, 'utf8'));

// Build population lookup
const villagePopMap = {};
for (const [kecName, kecVal] of Object.entries(popData.kecamatan || {})) {
  for (const v of kecVal.villages || []) {
    const key = kecName.toUpperCase() + '_' + v.name.toUpperCase();
    villagePopMap[key] = v.population_2026;
  }
}

// Build hazard maps (by desa name)
const longsorMap = {};
longsorData.features.forEach(f => {
  const d = (f.properties.NAMA_DESA || '').toUpperCase().trim();
  const k = (f.properties.NAMA_KEC || '').toUpperCase().trim();
  longsorMap[k + '_' + d] = f.properties.KLS_BENC;
  longsorMap[d] = f.properties.KLS_BENC;
});

const banjirMap = {};
banjirData.features.forEach(f => {
  const d = (f.properties.NAMA_DESA || '').toUpperCase().trim();
  const k = (f.properties.NAMA_KEC || '').toUpperCase().trim();
  banjirMap[k + '_' + d] = f.properties.KLS_BENC;
  banjirMap[d] = f.properties.KLS_BENC;
});

// Flatten roads, rivers, and waterbodies into LineString segments
const flatRoads = [];
jalanData.features.slice(0, 150).forEach(f => {
  const flat = turf.flatten(f);
  flat.features.forEach(ff => { if (ff.geometry.type === 'LineString') flatRoads.push(ff); });
});

const flatRivers = [];
sungaiData.features.slice(0, 100).forEach(f => {
  const flat = turf.flatten(f);
  flat.features.forEach(ff => { if (ff.geometry.type === 'LineString') flatRivers.push(ff); });
});

const rtrwStats = {};

desaData.features.forEach((desa, idx) => {
  const pt = turf.centroid(desa);
  const desaName = (desa.properties.DESA || '').trim();
  const desaNameUpper = desaName.toUpperCase();

  // 1. Spatially match Kecamatan
  let kecName = null;
  for (const kec of kecData.features) {
    if (turf.booleanPointInPolygon(pt, kec)) {
      kecName = kec.properties.KECAMATAN;
      break;
    }
  }
  if (!kecName) {
    for (const kec of kecData.features) {
      if (turf.booleanIntersects(desa, kec)) {
        kecName = kec.properties.KECAMATAN;
        break;
      }
    }
  }
  kecName = kecName || 'Banjarnegara';
  desa.properties.KECAMATAN = kecName;

  // 2. Match Population 2026
  let pop = villagePopMap[kecName.toUpperCase() + '_' + desaNameUpper];
  if (!pop) {
    pop = villagePopMap[desaNameUpper];
  }
  if (!pop) {
    // try partial matching
    for (const [k, v] of Object.entries(villagePopMap)) {
      if (k.includes(desaNameUpper) || desaNameUpper.includes(k.split('_')[1] || '')) {
        pop = v;
        break;
      }
    }
  }
  desa.properties.population_2026 = pop || 3800;

  // 3. Spatially match RTRW from pola_ruang.geojson
  let rtrwObj = null;
  for (const pola of polaData.features) {
    if (turf.booleanPointInPolygon(pt, pola)) {
      rtrwObj = pola.properties;
      break;
    }
  }
  if (!rtrwObj) {
    for (const pola of polaData.features) {
      if (turf.booleanIntersects(desa, pola)) {
        rtrwObj = pola.properties;
        break;
      }
    }
  }
  
  desa.properties.RTRW = rtrwObj?.NAMOBJ || 'Kawasan Permukiman Perdesaan';
  desa.properties.RTRW_STATUS = rtrwObj?.Status || 'Budidaya';
  rtrwStats[desa.properties.RTRW] = (rtrwStats[desa.properties.RTRW] || 0) + 1;

  // 4. Match Slope from slope.geojson
  let slopeObj = null;
  for (const slp of slopeData.features) {
    if (turf.booleanPointInPolygon(pt, slp)) {
      slopeObj = slp.properties;
      break;
    }
  }
  if (!slopeObj) {
    for (const slp of slopeData.features) {
      if (turf.booleanIntersects(desa, slp)) {
        slopeObj = slp.properties;
        break;
      }
    }
  }
  
  let slopeVal = 6.0;
  let slopeCat = 'Datar (0-8%)';
  if (slopeObj) {
    const k = slopeObj.kategori || '';
    if (k.includes('> 40')) { slopeVal = 42.5; slopeCat = 'Sangat Curam (>40%)'; }
    else if (k.includes('25 - 40')) { slopeVal = 32.0; slopeCat = 'Curam (25-40%)'; }
    else if (k.includes('15 - 25')) { slopeVal = 19.5; slopeCat = 'Agak Curam (15-25%)'; }
    else if (k.includes('8 - 15')) { slopeVal = 11.5; slopeCat = 'Landai (8-15%)'; }
    else { slopeVal = 5.5; slopeCat = 'Datar (0-8%)'; }
  }
  desa.properties.slope_percent = slopeVal;
  desa.properties.slope_category = slopeCat;

  // 5. Match Hazard: Longsor & Banjir
  const longsor = longsorMap[kecName.toUpperCase() + '_' + desaNameUpper] || longsorMap[desaNameUpper] || (slopeVal > 25 ? 'Tinggi' : slopeVal > 15 ? 'Sedang' : 'Rendah');
  const banjir = banjirMap[kecName.toUpperCase() + '_' + desaNameUpper] || banjirMap[desaNameUpper] || (slopeVal <= 8 && pt.geometry.coordinates[1] < -7.4 ? 'Sedang' : 'Rendah');
  desa.properties.landslide_risk = longsor;
  desa.properties.flood_risk = banjir;

  // 6. Calculate Euclidean Distance to Roads, River, Waterbody (approx in meters)
  let minRoadDist = 99999;
  for (const road of flatRoads) {
    const dist = turf.pointToLineDistance(pt, road, { units: 'meters' });
    if (dist < minRoadDist) minRoadDist = dist;
    if (minRoadDist < 50) break;
  }
  desa.properties.nearest_road_distance_m = Math.max(25, Math.round(minRoadDist));

  let minRiverDist = 99999;
  for (const riv of flatRivers) {
    const dist = turf.pointToLineDistance(pt, riv, { units: 'meters' });
    if (dist < minRiverDist) minRiverDist = dist;
    if (minRiverDist < 50) break;
  }
  desa.properties.nearest_river_distance_m = Math.max(30, Math.round(minRiverDist));

  // Distance to water body (centroid to centroid or bbox)
  let minWaterDist = 99999;
  for (const wb of airData.features) {
    const wbCentroid = turf.centroid(wb);
    const dist = turf.distance(pt, wbCentroid, { units: 'meters' });
    if (dist < minWaterDist) minWaterDist = dist;
  }
  desa.properties.nearest_water_distance_m = Math.max(100, Math.round(minWaterDist));
});

console.log('Enrichment complete!');
console.log('RTRW Breakdown across 276 villages:');
console.log(rtrwStats);

fs.writeFileSync(desaPath, JSON.stringify(desaData), 'utf8');
console.log(`Saved enriched GeoJSON to ${desaPath} (${(fs.statSync(desaPath).size / 1024).toFixed(1)} KB)`);
