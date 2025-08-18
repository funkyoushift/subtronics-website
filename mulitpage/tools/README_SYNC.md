
# Sync Bundles — Quick Guide

This updates `assets/js/builds.json` with **current CPU + Motherboard + RAM bundles** from Micro Center (AMD & Intel).

## 1) Requirements
- Python 3.10+
- Install dependencies once:
```
python -m pip install requests beautifulsoup4 lxml
```
*(macOS/Linux may use `python3 -m pip ...`)*

## 2) Run it
- **Windows**: double‑click `tools/run_sync.bat`
- **macOS/Linux**:
```
bash tools/run_sync.sh
```

or directly:
```
cd subtronics_multipage_site/tools
python sync_bundles.py
# only AMD:
python sync_bundles.py --no-intel
# only Intel:
python sync_bundles.py --no-amd
```

## 3) What it does
- Fetches Micro Center bundle pages
- Parses titles and prices
- Infers CPU model, chipset (B650/X870E/Z790/etc.), and base RAM (16/32 GB)
- Writes **fresh bundles** into `assets/js/builds.json`
- Keeps your **GPU/HDD/NVMe price tables** and **profit margin**

## 4) Verify
Open `store.html` in a browser (or deploy), and confirm new bundles appear as cards with live pricing.

## 5) Troubleshooting
- **"python not found" (Windows):** install Python from python.org. Try `py tools\sync_bundles.py`.
- **TLS/SSL errors:** update Python `certifi` package: `python -m pip install --upgrade certifi`
- **Blocked / Captcha:** wait a few minutes and run again; adjust the `User-Agent` in `tools/sync_bundles.py` if needed.
- **Site layout changed:** update the CSS selectors inside `parse_list_page()`.
- **No new bundles written:** check console output; ensure you have internet access and Micro Center pages load in your region.

## 6) Reverting
If something looks off, restore the previous `assets/js/builds.json` from version control or a backup copy.
