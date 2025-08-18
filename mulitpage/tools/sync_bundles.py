
import re, json, time, argparse
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Dict
import requests
from bs4 import BeautifulSoup

AMD_LIST_URLS = [
    "https://www.microcenter.com/site/content/bundle-and-save.aspx",
    "https://www.microcenter.com/search/search_results.aspx?N=4294813597",
]
INTEL_LIST_URLS = [
    "https://www.microcenter.com/site/content/intel-bundle-and-save.aspx",
    "https://www.microcenter.com/search/search_results.aspx?N=4294819309+4294813598",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
}

@dataclass
class Bundle:
    sku: str
    name: str
    bundle_price: float
    cpu: str
    motherboard: str
    ram_base_gb: int
    case_fixed: str = "ATX Mid Tower"
    cooling_default: str = "Air"
    m2_slots: int = 2
    storage_base: dict = None

    def to_build(self):
        return {
            "sku": self.sku,
            "name": self.name,
            "bundle_price": self.bundle_price,
            "cpu": self.cpu,
            "motherboard": self.motherboard,
            "ram_base_gb": self.ram_base_gb,
            "case_fixed": self.case_fixed,
            "cooling_default": self.cooling_default,
            "m2_slots": self.m2_slots,
            "storage_base": self.storage_base or {"ssd_tb": 1}
        }

def fetch(url: str) -> str:
    r = requests.get(url, headers=HEADERS, timeout=20)
    r.raise_for_status()
    return r.text

def parse_price(text: str) -> float:
    # Look for "Our price $429.99" or "$ 599.99"
    m = re.search(r"\$[\s]*([0-9,]+(?:\.[0-9]{2})?)", text.replace(",", ""))
    return float(m.group(1)) if m else 0.0

def infer_ram(title: str) -> int:
    m = re.search(r"\b(16|32|64|96|128)\s*GB\b", title.replace("Â", " "))
    return int(m.group(1)) if m else 32

def infer_cpu(title: str) -> str:
    # Pull "Ryzen 7 9700X" / "Core i9-14900K"
    m = re.search(r"(Ryzen\s+\d+\s+\d+\w?X?3?D?|Core\s+(?:Ultra\s+\d+\s+\d+K|i[3579]-\d{4,5}K?))", title, re.I)
    return m.group(1).strip() if m else title.split(",")[0].strip()

def infer_board(title: str) -> str:
    # e.g., "B650", "X870E", "Z790"
    m = re.search(r"\b(B[0-9]{3}|X[0-9]{3,4}E?|Z[0-9]{3}|H[0-9]{3})\b", title, re.I)
    return m.group(0).upper() if m else "AM5/1700 board (varies)"

def slugify(name: str) -> str:
    s = re.sub(r"[^A-Za-z0-9]+", "-", name).strip("-").upper()
    return s[:24]

def parse_list_page(html: str) -> List[Bundle]:
    soup = BeautifulSoup(html, "lxml")
    bundles: List[Bundle] = []

    # 1) Try product tiles/cards
    for card in soup.select(".product_wrapper, .productgrid, .product, .productGrid"):
        title_el = card.select_one("a, .image a, .details h2 a")
        price_el = card.get_text(" ", strip=True)
        if not title_el:
            continue
        title = title_el.get_text(" ", strip=True)
        price = parse_price(price_el)
        cpu = infer_cpu(title)
        board = infer_board(title)
        ram = infer_ram(title)
        sku = slugify(title)
        bundles.append(Bundle(
            sku=sku,
            name=title,
            bundle_price=price if price > 0 else 0.0,
            cpu=cpu,
            motherboard=board,
            ram_base_gb=ram
        ))

    # 2) Fallback: look for headings + price text
    if not bundles:
        for h in soup.find_all(["h2","h3"]):
            title = h.get_text(" ", strip=True)
            # collect following text for price
            price_text = " ".join(h.find_all_next(text=True, limit=30))
            price = parse_price(price_text)
            cpu = infer_cpu(title)
            board = infer_board(title)
            ram = infer_ram(title)
            sku = slugify(title)
            bundles.append(Bundle(
                sku=sku, name=title, bundle_price=price, cpu=cpu, motherboard=board, ram_base_gb=ram
            ))

    return bundles

def merge_unique(bases: List[Bundle]) -> List[Bundle]:
    seen = {}
    for b in bases:
        key = (b.cpu, b.motherboard, b.ram_base_gb)
        if key not in seen or (seen[key].bundle_price == 0 and b.bundle_price > 0):
            seen[key] = b
    return list(seen.values())

def load_existing_builds(path: Path) -> Dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        # minimal default
        return {
            "global": {"profit_margin_percent": 15, "max_hdd_drives": 8, "default_m2_slots": 2},
            "price_tables": {
                "gpu_tiers": [], "hdd": [], "nvme": [], "ram_per_32gb_increment": 75
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
    data = load_existing_builds(builds_path)

    all_bundles: List[Bundle] = []

    if not args.no_amd:
        for url in AMD_LIST_URLS:
            try:
                html = fetch(url)
                bundles = parse_list_page(html)
                all_bundles.extend(bundles)
                time.sleep(1.0)
            except Exception as e:
                print("AMD fetch fail:", url, e)

    if not args.no_intel:
        for url in INTEL_LIST_URLS:
            try:
                html = fetch(url)
                bundles = parse_list_page(html)
                all_bundles.extend(bundles)
                time.sleep(1.0)
            except Exception as e:
                print("Intel fetch fail:", url, e)

    merged = merge_unique(all_bundles)
    # Keep existing tables and globals; replace builds
    data.setdefault("global", {"profit_margin_percent": 15, "max_hdd_drives": 8, "default_m2_slots": 2})
    data.setdefault("price_tables", {
        "gpu_tiers":[
            {"tier":"RTX 5060","cost":300},
            {"tier":"RTX 5060 Ti","cost":330},
            {"tier":"RTX 5070","cost":550},
            {"tier":"RTX 5070 Ti","cost":800},
            {"tier":"RTX 5080","cost":1100},
            {"tier":"RX 6600","cost":219},
            {"tier":"RX 7800 XT","cost":450},
            {"tier":"RX 7900 XT","cost":600},
            {"tier":"RX 7900 XTX","cost":800}
        ],
        "hdd":[
            {"capacity_tb":2, "cost":49},
            {"capacity_tb":4, "cost":79},
            {"capacity_tb":8, "cost":139},
            {"capacity_tb":16, "cost":269}
        ],
        "nvme":[
            {"capacity_tb":2, "cost":95},
            {"capacity_tb":4, "cost":199},
            {"capacity_tb":8, "cost":499}
        ],
        "ram_per_32gb_increment": 75
    })

    # Convert
    data["builds"] = [b.to_build() for b in merged if b.bundle_price > 0]

    builds_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"Updated: {builds_path} with {len(data['builds'])} bundles.")

if __name__ == "__main__":
    main()
