import os
import json
import pandas as pd

DATA_DIR = "u:/Project/rekomtps/data/datapopulasi"
PERIODS = ["2023_2", "2024_1", "2024_2", "2025_1", "2025_2", "2026_1"]

period_dfs = {}
for p in PERIODS:
    fpath = os.path.join(DATA_DIR, f"{p}.xlsx")
    if os.path.exists(fpath):
        df = pd.read_excel(fpath)
        period_dfs[p] = df
        print(f"Loaded {p}: {len(df)} rows")
    else:
        print(f"Warning: {fpath} not found")

# Base dataframe: 2026_1 (latest)
latest_df = period_dfs["2026_1"]

# Extract 20 kecamatan
kec_rows = latest_df[latest_df['KODE'].astype(str).str.match(r'^\d{2}\.\d{2}\.\d{2}$')]

kecamatan_data = {}

for _, krow in kec_rows.iterrows():
    kode = str(krow['KODE']).strip()
    name = str(krow['WILAYAH']).strip().title()
    
    # Track population across periods
    history = {}
    for p, df_p in period_dfs.items():
        match = df_p[df_p['KODE'].astype(str).str.strip() == kode]
        if not match.empty:
            history[p] = int(match.iloc[0]['JML'])
        else:
            history[p] = None
            
    p_start = history.get("2023_2")
    p_end = history.get("2026_1")
    
    # 2.5 years interval (5 semesters)
    if p_start and p_end and p_start > 0:
        annual_growth_rate = (p_end / p_start) ** (1.0 / 2.5) - 1.0
    else:
        annual_growth_rate = 0.0072 # fallback 0.72%
        
    # Get desas under this kecamatan
    desa_rows = latest_df[latest_df['KODE'].astype(str).str.startswith(kode + ".")]
    desas = []
    for _, drow in desa_rows.iterrows():
        d_kode = str(drow['KODE']).strip()
        d_name = str(drow['WILAYAH']).strip().title()
        d_p0 = int(drow['JML'])
        desas.append({
            "code": d_kode,
            "name": d_name,
            "population_2026": d_p0,
            "male": int(drow['L']),
            "female": int(drow['P'])
        })
        
    kecamatan_data[name] = {
        "code": kode,
        "name": name,
        "population_2026": int(p_end) if p_end else 0,
        "history": history,
        "annual_growth_rate": round(float(annual_growth_rate), 5),
        "annual_growth_percent": round(float(annual_growth_rate * 100), 3),
        "total_villages": len(desas),
        "villages": desas
    }

# Kabupaten totals
kab_history = {}
for p, df_p in period_dfs.items():
    match = df_p[df_p['KODE'].astype(str).str.strip() == "33.04"]
    if not match.empty:
        kab_history[p] = int(match.iloc[0]['JML'])

kab_start = kab_history.get("2023_2", 1061149)
kab_end = kab_history.get("2026_1", 1080524)
kab_rate = (kab_end / kab_start) ** (1.0 / 2.5) - 1.0

output_data = {
    "metadata": {
        "title": "Data Populasi Time Series Kabupaten Banjarnegara",
        "source": "DKB Semesteran Kemendagri (2023 S2 - 2026 S1)",
        "periods": PERIODS,
        "total_kecamatan": len(kecamatan_data),
        "baseline_period": "2026_1",
        "kabupaten_total_2026": kab_end,
        "kabupaten_annual_growth_rate": round(float(kab_rate), 5),
        "kabupaten_annual_growth_percent": round(float(kab_rate * 100), 3),
        "kabupaten_history": kab_history
    },
    "kecamatan": kecamatan_data
}

out_json = "u:/Project/rekomtps/data/population_timeseries.json"
with open(out_json, "w", encoding="utf-8") as f:
    json.dump(output_data, f, indent=2)

print(f"Preprocessed population timeseries saved to {out_json}")
print(f"Kabupaten Banjarnegara Growth Rate: {kab_rate*100:.3f}% / year")
print(f"Sample kecamatan rates:")
for k, v in list(kecamatan_data.items())[:5]:
    print(f" - {k}: {v['annual_growth_percent']}% / year ({v['population_2026']:,} jiwa)")
