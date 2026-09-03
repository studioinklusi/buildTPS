const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');

console.log('=== Fixing Administration Boundaries & Kecamatan Leakage ===');

const pubDir = path.join(__dirname, '../public/data');
const desaPath = path.join(pubDir, 'administrasi_desa.geojson');
const kecPath = path.join(pubDir, 'administrasi_kecamatan.geojson');
const popPath = path.join(pubDir, 'population_timeseries.json');

const desaData = JSON.parse(fs.readFileSync(desaPath, 'utf8'));
const popData = JSON.parse(fs.readFileSync(popPath, 'utf8'));

// Canonical Index-to-Kecamatan cluster mapping for the 276 village polygons
const clusterMap = {
  // 1. Susukan (0 - 14) -> 15 desas
  0: 'Susukan', 1: 'Susukan', 2: 'Susukan', 3: 'Susukan', 4: 'Susukan',
  5: 'Susukan', 6: 'Susukan', 7: 'Susukan', 8: 'Susukan', 9: 'Susukan',
  10: 'Susukan', 11: 'Susukan', 12: 'Susukan', 13: 'Susukan', 14: 'Susukan',

  // 2. Purworeja Klampok (15 - 22) -> 8 desas
  15: 'Purworeja Klampok', 16: 'Purworeja Klampok', 17: 'Purworeja Klampok', 18: 'Purworeja Klampok',
  19: 'Purworeja Klampok', 20: 'Purworeja Klampok', 21: 'Purworeja Klampok', 22: 'Purworeja Klampok',

  // 3. Mandiraja (23 - 38) -> 16 desas
  23: 'Mandiraja', 24: 'Mandiraja', 25: 'Mandiraja', 26: 'Mandiraja', 27: 'Mandiraja',
  28: 'Mandiraja', 29: 'Mandiraja', 30: 'Mandiraja', 31: 'Mandiraja', 32: 'Mandiraja',
  33: 'Mandiraja', 34: 'Mandiraja', 35: 'Mandiraja', 36: 'Mandiraja', 37: 'Mandiraja', 38: 'Mandiraja',

  // 4. Purwanegara (39 - 51) -> 13 desas
  39: 'Purwanegara', 40: 'Purwanegara', 41: 'Purwanegara', 42: 'Purwanegara', 43: 'Purwanegara',
  44: 'Purwanegara', 45: 'Purwanegara', 46: 'Purwanegara', 47: 'Purwanegara', 48: 'Purwanegara',
  49: 'Purwanegara', 50: 'Purwanegara', 51: 'Purwanegara',

  // 5. Bawang (18 desas) & Pagedongan split
  52: 'Bawang', 53: 'Bawang',
  54: 'Pagedongan', // Duren
  55: 'Pagedongan', // Lebakwangi
  56: 'Bawang', 57: 'Bawang', 58: 'Bawang', 59: 'Bawang', 60: 'Bawang', 61: 'Bawang',
  62: 'Pagedongan', // Gentasari
  63: 'Bawang', 64: 'Bawang', 65: 'Bawang', 66: 'Bawang', 67: 'Bawang', 68: 'Bawang', 69: 'Bawang',
  70: 'Bawang', // Blambangan
  71: 'Bawang', // Gemuruh

  // 6. Pagedongan (72 - 77) -> 6 desas (+ 3 from indices 54, 55, 62 = 9 desas)
  72: 'Pagedongan', // GunungJati
  73: 'Pagedongan', // Kebutuh Jurang
  74: 'Pagedongan', // Kebutuh Duwur
  75: 'Pagedongan', // Pasangkalan
  76: 'Pagedongan', // Pagedongan
  77: 'Pagedongan', // Twelagiri

  // 7. Banjarnegara (78 - 90) -> 13 desas
  78: 'Banjarnegara', 79: 'Banjarnegara', 80: 'Banjarnegara', 81: 'Banjarnegara', 82: 'Banjarnegara',
  83: 'Banjarnegara', 84: 'Banjarnegara', 85: 'Banjarnegara', 86: 'Banjarnegara', 87: 'Banjarnegara',
  88: 'Banjarnegara', 89: 'Banjarnegara', 90: 'Banjarnegara',

  // 8. Sigaluh (91 - 105) -> 15 desas
  91: 'Sigaluh', 92: 'Sigaluh', 93: 'Sigaluh', 94: 'Sigaluh', 95: 'Sigaluh',
  96: 'Sigaluh', 97: 'Sigaluh', 98: 'Sigaluh', 99: 'Sigaluh', 100: 'Sigaluh',
  101: 'Sigaluh', 102: 'Sigaluh', 103: 'Sigaluh', 104: 'Sigaluh', 105: 'Sigaluh',

  // 9. Madukara (106 - 125) -> 20 desas
  106: 'Madukara', 107: 'Madukara', 108: 'Madukara', 109: 'Madukara', 110: 'Madukara',
  111: 'Madukara', 112: 'Madukara', 113: 'Madukara', 114: 'Madukara', 115: 'Madukara',
  116: 'Madukara', 117: 'Madukara', 118: 'Madukara', 119: 'Madukara', 120: 'Madukara',
  121: 'Madukara', 122: 'Madukara', 123: 'Madukara', 124: 'Madukara', 125: 'Madukara',

  // 10. Banjarmangu (126 - 141) -> exactly 16 desas
  126: 'Banjarmangu', 127: 'Banjarmangu', 128: 'Banjarmangu', 129: 'Banjarmangu', 130: 'Banjarmangu',
  131: 'Banjarmangu', 132: 'Banjarmangu', 133: 'Banjarmangu', 134: 'Banjarmangu', 135: 'Banjarmangu',
  136: 'Banjarmangu', 137: 'Banjarmangu', 138: 'Banjarmangu', 139: 'Banjarmangu', 140: 'Banjarmangu',
  141: 'Banjarmangu',

  // 11. Wanadadi (142 - 152) -> 11 desas
  142: 'Wanadadi', 143: 'Wanadadi', 144: 'Wanadadi', 145: 'Wanadadi', 146: 'Wanadadi',
  147: 'Wanadadi', 148: 'Wanadadi', 149: 'Wanadadi', 150: 'Wanadadi', 151: 'Wanadadi', 152: 'Wanadadi',

  // 12. Rakit (153 - 163) -> 11 desas
  153: 'Rakit', 154: 'Rakit', 155: 'Rakit', 156: 'Rakit', 157: 'Rakit',
  158: 'Rakit', 159: 'Rakit', 160: 'Rakit', 161: 'Rakit', 162: 'Rakit', 163: 'Rakit',

  // 13. Punggelan (164 - 180) -> 17 desas
  164: 'Punggelan', 165: 'Punggelan', 166: 'Punggelan', 167: 'Punggelan', 168: 'Punggelan',
  169: 'Punggelan', 170: 'Punggelan', 171: 'Punggelan', 172: 'Punggelan', 173: 'Punggelan',
  174: 'Punggelan', 175: 'Punggelan', 176: 'Punggelan', 177: 'Punggelan', 178: 'Punggelan',
  179: 'Punggelan', 180: 'Punggelan',

  // 14. Karangkobar (181 - 193) -> 13 desas
  181: 'Karangkobar', 182: 'Karangkobar', 183: 'Karangkobar', 184: 'Karangkobar', 185: 'Karangkobar',
  186: 'Karangkobar', 187: 'Karangkobar', 188: 'Karangkobar', 189: 'Karangkobar', 190: 'Karangkobar',
  191: 'Karangkobar', 192: 'Karangkobar', 193: 'Karangkobar',

  // 15. Pagentan (194 - 209) -> 16 desas
  194: 'Pagentan', 195: 'Pagentan', 196: 'Pagentan', 197: 'Pagentan', 198: 'Pagentan',
  199: 'Pagentan', 200: 'Pagentan', 201: 'Pagentan', 202: 'Pagentan', 203: 'Pagentan',
  204: 'Pagentan', 205: 'Pagentan', 206: 'Pagentan', 207: 'Pagentan', 208: 'Pagentan', 209: 'Pagentan',

  // 16. Pejawaran (210 - 226) -> 17 desas
  210: 'Pejawaran', // Kalilunjar
  211: 'Pejawaran', 212: 'Pejawaran', 213: 'Pejawaran', 214: 'Pejawaran', 215: 'Pejawaran',
  216: 'Pejawaran', // Beji
  217: 'Pejawaran', 218: 'Pejawaran', 219: 'Pejawaran', 220: 'Pejawaran',
  221: 'Pejawaran', 222: 'Pejawaran', 223: 'Pejawaran', 224: 'Pejawaran', 225: 'Pejawaran', 226: 'Pejawaran',

  // 17. Batur (227 - 234) -> 8 desas
  227: 'Batur', 228: 'Batur', 229: 'Batur', 230: 'Batur', 231: 'Batur',
  232: 'Batur', 233: 'Batur', 234: 'Batur',

  // 18. Wanayasa (235 - 251) -> 17 desas
  235: 'Wanayasa', 236: 'Wanayasa', 237: 'Wanayasa', 238: 'Wanayasa', 239: 'Wanayasa',
  240: 'Wanayasa', 241: 'Wanayasa', 242: 'Wanayasa', 243: 'Wanayasa', 244: 'Wanayasa',
  245: 'Wanayasa', 246: 'Wanayasa', 247: 'Wanayasa', 248: 'Wanayasa', 249: 'Wanayasa',
  250: 'Wanayasa', 251: 'Wanayasa',

  // 19. Pandanarum (8 desas)
  252: 'Pandanarum', // Sinduaji
  253: 'Pandanarum', // Pandanarum
  254: 'Pandanarum', // Beji
  264: 'Pandanarum', // Pringamba
  265: 'Pandanarum', // Pasegeran
  266: 'Pandanarum', // Pingit Lor
  267: 'Pandanarum', // Lawen
  268: 'Pandanarum', // Sirongge

  // 20. Kalibening (16 desas)
  255: 'Kalibening', // Asinan
  256: 'Kalibening', // Sembawa
  257: 'Kalibening', // Kalibombong
  258: 'Kalibening', // Kalisat Kidul
  259: 'Kalibening', // Sirukem
  260: 'Kalibening', // Kertasari
  261: 'Kalibening', // Sidokangen
  262: 'Kalibening', // Majatengah
  263: 'Kalibening', // Kalibening
  269: 'Kalibening', // Sikumpul
  270: 'Kalibening', // Gununglangit
  271: 'Kalibening', // Bedana
  272: 'Kalibening', // Sirukun
  273: 'Kalibening', // Karanganyar
  274: 'Kalibening', // Plorengan
  275: 'Kalibening', // Kasinoman
};

// 1. Assign exact Kecamatan to all 276 villages
const kecCounts = {};
desaData.features.forEach((f, idx) => {
  const trueKec = clusterMap[idx];
  if (!trueKec) {
    throw new Error(`Missing cluster map for feature index ${idx}`);
  }
  f.properties.KECAMATAN = trueKec;
  kecCounts[trueKec] = (kecCounts[trueKec] || 0) + 1;
});

console.log('Village counts per Kecamatan:');
console.log(kecCounts);

// Save corrected administrasi_desa.geojson
fs.writeFileSync(desaPath, JSON.stringify(desaData), 'utf8');
console.log(`Saved updated ${desaPath}`);

// 2. Dissolve villages into clean, 100% gapless administrasi_kecamatan.geojson
console.log('Generating dissolved administrasi_kecamatan.geojson...');
const kecFeatures = [];
const uniqueKecs = Object.keys(kecCounts).sort();

uniqueKecs.forEach(kecName => {
  const matchingDesas = desaData.features.filter(f => f.properties.KECAMATAN === kecName);
  console.log(`Dissolving ${kecName} (${matchingDesas.length} villages)...`);
  
  let merged = matchingDesas[0];
  for (let i = 1; i < matchingDesas.length; i++) {
    merged = turf.union(turf.featureCollection([merged, matchingDesas[i]]));
  }
  
  // Strip interior sliver holes/donut rings created by union
  if (merged.geometry.type === 'Polygon') {
    merged.geometry.coordinates = [merged.geometry.coordinates[0]];
  } else if (merged.geometry.type === 'MultiPolygon') {
    merged.geometry.coordinates = merged.geometry.coordinates.map(p => [p[0]]);
  }

  // Set properties
  merged.properties = {
    KECAMATAN: kecName,
    DESA_COUNT: matchingDesas.length,
  };
  kecFeatures.push(merged);
});

const newKecGeoJSON = {
  type: 'FeatureCollection',
  name: 'Administrasi Kecamatan 20',
  features: kecFeatures,
};

fs.writeFileSync(kecPath, JSON.stringify(newKecGeoJSON), 'utf8');
console.log(`Saved clean ${kecPath} with ${kecFeatures.length} kecamatan polygons!`);
console.log('=== Done! ===');
