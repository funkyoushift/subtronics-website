#!/usr/bin/env bash
# One-click updater for Micro Center bundles (macOS/Linux)
set -euo pipefail
cd "$(dirname "$0")/.."
echo "Running Sync Bundles (AMD + Intel)..."
python3 tools/sync_bundles.py || {
  echo
  echo "Sync failed. Ensure Python 3 and pip deps are installed:"
  echo "  python3 -m pip install requests beautifulsoup4 lxml"
  exit 1
}
echo
echo "Done! Updated assets/js/builds.json"
