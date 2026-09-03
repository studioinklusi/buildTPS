import os
import json
import shutil
import geopandas as gpd

PUB_DIR = "u:/Project/rekomtps/public/data"
os.makedirs(PUB_DIR, exist_ok=True)

print("Starting GeoData preparation for public/data/...")

# 1. Population timeseries
src_pop = "u:/Project/rekomtps/data/population_timeseries.json"
dst_pop = os.path.join(PUB_DIR, "population_timeseries.json")
if os.path.exists(src_pop):
    shutil.copyfile(src_pop, dst_pop)
    print(f"1. Copied population_timeseries.json ({os.path.getsize(dst_pop)/1024:.1f} KB)")

# 2. Administrasi Kecamatan (20 kecamatan)
src_kec = "u:/Project/rekomtps/data/BOUNDARY/Administrasi Kecamatan.geojson"
dst_kec = os.path.join(PUB_DIR, "administrasi_kecamatan.geojson")
if os.path.exists(src_kec):
    shutil.copyfile(src_kec, dst_kec)
    print(f"2. Copied administrasi_kecamatan.geojson ({os.path.getsize(dst_kec)/1024:.1f} KB)")

# 3. Administrasi Desa
src_desa = "u:/Project/rekomtps/data/BOUNDARY/Administrasi Desa.geojson"
dst_desa = os.path.join(PUB_DIR, "administrasi_desa.geojson")
if os.path.exists(src_desa):
    gdf_d = gpd.read_file(src_desa)
    # Simplify very slightly to save bytes while keeping clean
    gdf_d['geometry'] = gdf_d['geometry'].simplify(0.0001, preserve_topology=True)
    gdf_d.to_file(dst_desa, driver="GeoJSON")
    print(f"3. Prepared administrasi_desa.geojson ({os.path.getsize(dst_desa)/1024:.1f} KB)")

# 4. Slope 5 Kelas
src_slope = "u:/Project/rekomtps/data/DOWNLOAD/slope_banjarnegara.geojson"
dst_slope = os.path.join(PUB_DIR, "slope.geojson")
if os.path.exists(src_slope):
    shutil.copyfile(src_slope, dst_slope)
    print(f"4. Copied slope.geojson ({os.path.getsize(dst_slope)/1024:.1f} KB)")

# 5. Sungai
src_sungai = "u:/Project/rekomtps/data/DOWNLOAD/sungai_banjarnegara.geojson"
dst_sungai = os.path.join(PUB_DIR, "sungai.geojson")
if os.path.exists(src_sungai):
    shutil.copyfile(src_sungai, dst_sungai)
    print(f"5. Copied sungai.geojson ({os.path.getsize(dst_sungai)/1024:.1f} KB)")

# 6. Badan Air
src_air = "u:/Project/rekomtps/data/DOWNLOAD/badan_air_banjarnegara.geojson"
dst_air = os.path.join(PUB_DIR, "badan_air.geojson")
if os.path.exists(src_air):
    shutil.copyfile(src_air, dst_air)
    print(f"6. Copied badan_air.geojson ({os.path.getsize(dst_air)/1024:.1f} KB)")

# 7. Pola Ruang (Optimize from 42.6 MB -> ~8.9 MB)
src_pr = "u:/Project/rekomtps/data/POLA RUANG V2/POLA RUANG.geojson"
dst_pr = os.path.join(PUB_DIR, "pola_ruang.geojson")
if os.path.exists(src_pr):
    print("7. Optimizing Pola Ruang (simplifying)...")
    gdf_pr = gpd.read_file(src_pr)
    gdf_pr['geometry'] = gdf_pr['geometry'].simplify(0.00015, preserve_topology=True)
    gdf_pr.to_file(dst_pr, driver="GeoJSON")
    print(f"   Pola Ruang prepared ({os.path.getsize(dst_pr)/(1024*1024):.2f} MB)")

# 8. Jaringan Jalan (Filter primary/secondary/tertiary/trunk from 24.8 MB -> ~2.5 MB)
src_jalan = "u:/Project/rekomtps/data/DOWNLOAD/jaringan_jalan_banjarnegara.geojson"
dst_jalan = os.path.join(PUB_DIR, "jaringan_jalan.geojson")
if os.path.exists(src_jalan):
    print("8. Optimizing Road Network (filtering major roads)...")
    gdf_j = gpd.read_file(src_jalan)
    # keep trunk, primary, secondary, tertiary, and links
    MAJOR_ROADS = [
        'motorway', 'trunk', 'primary', 'secondary', 'tertiary',
        'motorway_link', 'trunk_link', 'primary_link', 'secondary_link', 'tertiary_link'
    ]
    gdf_j_major = gdf_j[gdf_j['highway'].isin(MAJOR_ROADS)].copy()
    gdf_j_major['geometry'] = gdf_j_major['geometry'].simplify(0.00005)
    gdf_j_major.to_file(dst_jalan, driver="GeoJSON")
    print(f"   Roads prepared ({os.path.getsize(dst_jalan)/(1024*1024):.2f} MB, {len(gdf_j_major)} lines)")

# 9. Kelas Banjir
src_banjir = "u:/Project/rekomtps/data/DAMPAK/kelas Banjir.geojson"
dst_banjir = os.path.join(PUB_DIR, "kelas_banjir.geojson")
if os.path.exists(src_banjir):
    gdf_b = gpd.read_file(src_banjir)
    gdf_b['geometry'] = gdf_b['geometry'].simplify(0.0001, preserve_topology=True)
    gdf_b.to_file(dst_banjir, driver="GeoJSON")
    print(f"9. Prepared kelas_banjir.geojson ({os.path.getsize(dst_banjir)/1024:.1f} KB)")

# 10. Kelas Longsor (Optimize from 11.8 MB -> ~3.5 MB)
src_longsor = "u:/Project/rekomtps/data/DAMPAK/kelas Longsor.geojson"
dst_longsor = os.path.join(PUB_DIR, "kelas_longsor.geojson")
if os.path.exists(src_longsor):
    print("10. Optimizing Kelas Longsor...")
    gdf_l = gpd.read_file(src_longsor)
    gdf_l['geometry'] = gdf_l['geometry'].simplify(0.00015, preserve_topology=True)
    gdf_l.to_file(dst_longsor, driver="GeoJSON")
    print(f"   Kelas Longsor prepared ({os.path.getsize(dst_longsor)/(1024*1024):.2f} MB)")

# 11. Templates for user download
tpl_csv = "u:/Project/rekomtps/data/TEMPLATE/template_tps_eksisting.csv"
if os.path.exists(tpl_csv):
    shutil.copyfile(tpl_csv, os.path.join(PUB_DIR, "template_tps_eksisting.csv"))
    print("11. Copied template_tps_eksisting.csv")

tpl_geo = "u:/Project/rekomtps/data/TEMPLATE/template_tps_eksisting.geojson"
if os.path.exists(tpl_geo):
    shutil.copyfile(tpl_geo, os.path.join(PUB_DIR, "template_tps_eksisting.geojson"))
    print("12. Copied template_tps_eksisting.geojson")

print("\nAll public data assets prepared successfully!")
