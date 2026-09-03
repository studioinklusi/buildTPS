import json
import os
import geopandas as gpd

print("1. Testing Pola Ruang simplification...")
pr_path = "u:/Project/rekomtps/data/POLA RUANG V2/POLA RUANG.geojson"
gdf_pr = gpd.read_file(pr_path)
print(f"Pola Ruang original size: {os.path.getsize(pr_path)/(1024*1024):.1f} MB, features: {len(gdf_pr)}")

# Test simplify tolerance 0.0001 (~10 meters)
gdf_pr_simple = gdf_pr.copy()
gdf_pr_simple['geometry'] = gdf_pr_simple['geometry'].simplify(0.0001, preserve_topology=True)

test_pr_out = "u:/Project/rekomtps/data/POLA RUANG V2/pola_ruang_opt.geojson"
gdf_pr_simple.to_file(test_pr_out, driver="GeoJSON")
print(f"Pola Ruang simplified size (tol=0.0001): {os.path.getsize(test_pr_out)/(1024*1024):.2f} MB")

print("\n2. Testing Road Network filtering & simplification...")
road_path = "u:/Project/rekomtps/data/DOWNLOAD/jaringan_jalan_banjarnegara.geojson"
gdf_roads = gpd.read_file(road_path)
print(f"Original roads: {len(gdf_roads)} lines, {os.path.getsize(road_path)/(1024*1024):.1f} MB")

# Check highway classes
print("Highway categories:", gdf_roads['highway'].value_counts().head(10))

# Filter major and connecting roads
KEEP_CLASSES = [
    'motorway', 'trunk', 'primary', 'secondary', 'tertiary',
    'motorway_link', 'trunk_link', 'primary_link', 'secondary_link', 'tertiary_link',
    'unclassified', 'residential' # Keep residential too for accessibility analysis
]
gdf_roads_filtered = gdf_roads[gdf_roads['highway'].isin(KEEP_CLASSES)].copy()
# Simplify lines slightly (tol=0.00005 ~5 meters)
gdf_roads_filtered['geometry'] = gdf_roads_filtered['geometry'].simplify(0.00005)

test_road_out = "u:/Project/rekomtps/data/DOWNLOAD/jalan_opt.geojson"
gdf_roads_filtered.to_file(test_road_out, driver="GeoJSON")
print(f"Filtered roads: {len(gdf_roads_filtered)} lines, {os.path.getsize(test_road_out)/(1024*1024):.2f} MB")
