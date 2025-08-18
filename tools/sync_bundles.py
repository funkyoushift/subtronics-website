# tools/sync_bundles.py
import re, json, time, argparse
from pathlib import Path
from dataclasses import dataclass
from typing import List, Dict
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone

AMD_LIST_URLS = [
    "https://www.microcenter.com/site/content/bundle-and-save.aspx",
    "https://www.microcenter.com/search/search_results.aspx?N=4294813597",  # AMD bundles/search
]
INTEL_LIST_URLS = [
    "https://www.microcenter.com/site/content/intel-bundle-and-save.aspx",
    "https://www.microcenter.com/search/search_results.aspx?N=4294819309+4294813598",  # Intel bundles/search
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari"
}

@dataclass
class Bundle:
    name: str
    bundle_price: float
    cpu: str
    motherboard: str
    ram_base_gb: int
    case_fixed: str = "ATX Mid Tower"
    cooling_default: str = "Air"
    m2_slots: int = 2
    sku: str = ""
    def to_build(self):
        return {
            "sku": self.sku or slugify(self.name),
            "name": self.name,
            "bundle_price": self.bundle_price,
            "cpu": self.cpu,
            "motherboard": self.motherboard,
            "ram_base_gb": self.ram_base_gb,
            "case_fixed": self.case_fixed,
            "cooling_default": self.cooling_default,
            "m2_slots": self.m2_slots,
            "storage_base": {"ssd_tb": 1}
        }

def slugify(name: str) -> str:
    s = re.sub(r"[^A-Za-z0-9]+", "-", name).strip("-").upper()
    return s[:32]

def fetch(url: str) -> str:
    r = requests.get(url, headers=HEADERS, timeout=25)
    r.raise_for_status()
    return r.text

def parse_price(text: str) -> float:
    text = text.replace(",", "")
    m = re.search(r"\$[\s]*([0-9]+(?:\.[0-9]{2})?)", text)
    return float(m.group(1)) if m else 0.0

def infer_ram(title: str) -> int:
    t = title.replace("Â", " ")
    m = re.search(r"\b(16|32|64|96|128)\s*GB\b", t, re.I)
    return int(m.group(1)) if m else 32

def infer_cpu(title: str) -> str:
    m = re.search(r"(Ryzen\s+\d+\s+\d+\w*X?3?D?|Core\s+(?:Ultra\s+\d+\s+\d+K|i[3579]-\d{4,5}K?))", title, re.I)
    return m.group(1).strip() if m else title

def infer_board(title: str) -> str:
    m = re.search(r"\b(B[0-9]{3}|X[0-9]{3,4}E?|Z[0-9]{3}|H[0-9]{3})\b", title, re.I)
    return m.group(0).upper() if m else "AM5/1700 board"

def parse_list_page(html: str) -> List[Bundle]:
    soup = BeautifulSoup(html, "lxml")
    found: List[Bundle] = []

    # Product tiles & grids
    for card in soup.select(".product_wrapper, .productgrid, .product, .productGrid, .productWrapper"):
        title_el = card.select_one("a, .details h2 a, h2 a")
        if not title_el:
            continue
        title = title_el.get_text(" ", strip=True)
        price_text = card.get_text(" ", strip=True)
        price = parse_price(price_text)
        cpu = infer_cpu(title)
        board = infer_board(title)
        ram = infer_ram(title)
        found.append(Bundle(
            name=title, bundle_price=price, cpu=cpu, motherboard=board, ram_base_gb=ram
        ))

    # Fallback (headings)
    if not found:
        for h in soup.find_all(["h2","h3"]):
            title = h.get_text(" ", strip=True)
            price_text = " ".join(h.find_all_next(text=True, limit=40))
            price = parse_price(price_text)
            cpu = infer_cpu(title)
            board = infer_board(title)
            ram = infer_ram(title)
            found.append(Bundle(name=title, bundle_price=price, cpu=cpu, motherboard=board, ram_base_gb=ram))

    # Deduplicate by cpu+board+ram; keep the one with a price
    seen = {}
    unique = []
    for b in found:
        key = (b.cpu, b.motherboard, b.ram_base_gb)
        if key not in seen or (seen[key].bundle_price == 0 and b.bundle_price > 0):
            seen[key] = b
    unique = list(seen.values())
    return unique

def load_existing(path: Path) -> Dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {
            "meta": {},
            "global": {"profit_margin_percent": 15, "max_hdd_drives": 8, "default_m2_slots": 2},
            "price_tables": {
                "gpu_tiers": [],
                "hdd": [],
                "nvme": [],
                "ram_per_32gb_increment": 75
            },
            "builds": []
        }

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-amd", action="store_true")
    ap.add_argument("--no-intel", action="store_true")
    ap.add_argument("--project", default=str(Path(__file__).resolve().parents[1]))
    args = ap.parse_args()

    project = Path(args.project)
    builds_path = project / "assets" / "js" / "builds.json"

    data = load_existing(builds_path)
    all_bundles: List[Bundle] = []

    if not args.no_amd:
        for url in AMD_LIST_URLS:
            try:
                html = fetch(url); time.sleep(1.0)
                all_bundles += parse_list_page(html)
            except Exception as e:
                print("AMD fetch fail:", url, e)

    if not args.no_intel:
        for url in INTEL_LIST_URLS:
            try:
                html = fetch(url); time.sleep(1.0)
                all_bundles += parse_list_page(html)
            except Exception as e:
                print("Intel fetch fail:", url, e)

    # Keep your price tables & globals
    data.setdefault("global", {"profit_margin_percent": 15, "max_hdd_drives": 8, "default_m2_slots": 2})
    data.setdefault("price_tables", data.get("price_tables", {}))

    converted = [b.to_build() for b in all_bundles if (b.bundle_price or 0) > 0]
    # If nothing parsed, keep previous builds
    if converted:
        data["builds"] = converted

    data["meta"] = {
        "source": "Micro Center bundle pages",
        "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "bundle_count": len(data["builds"])
    }

    builds_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"Updated {builds_path} with {len(data['builds'])} bundles at {data['meta']['updated_at']}")

if __name__ == "__main__":
    main()
