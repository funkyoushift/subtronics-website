/* assets/js/store.js
   - 4 level cards (Budget / Mid / High / Extreme)
   - Each level lets you choose between bundles (variants)
   - Pricing includes bundle + case + PSU + fans + cooling + build fee
*/

const WORKER_CREATE_URL =
  "https://subtronics-api.screename53.workers.dev/create";

async function loadData() {
  const r = await fetch("/assets/js/builds.json", { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load builds.json");
  return await r.json();
}

const money = (n) => "$" + Number(n || 0).toFixed(2);

function computeTotal(data, build, s) {
  const g = data.global || {};
  let cost = Number(build.bundle_price || 0);

  // Always-present parts
  cost += Number(g.case_cost || 0);        // case
  cost += Number(g.psu_cost || 0);         // PSU
  cost += Number(g.extra_fans_cost || 0);  // extra fans
  cost += Number(g.build_fee || 0);        // your labor / build fee

  const pt = data.price_tables || {};

  // RAM upgrade over bundle
  const ramInc = Math.max(
    0,
    (Number(s.ram_gb) - Number(build.ram_base_gb)) / 32
  );
  cost += ramInc * Number(pt.ram_per_32gb_increment || 0);

  // GPU tier
  const gpu = (pt.gpu_tiers || []).find((g) => g.tier === s.gpu_tier);
  if (gpu) cost += Number(gpu.cost || 0);

  // HDDs
  const hddRow = (pt.hdd || []).find(
    (h) => Number(h.capacity_tb) === Number(s.hdd_capacity_tb)
  );
  if (hddRow) cost += Number(hddRow.cost || 0) * Number(s.hdd_count || 0);

  // Extra NVMe
  const nvRow = (pt.nvme || []).find(
    (n) => Number(n.capacity_tb) === Number(s.nvme_capacity_tb)
  );
  if (nvRow)
    cost += Number(nvRow.cost || 0) * Number(s.nvme_slots_used || 0);

  // Cooling (from global cost table)
  const cooling = s.cooling || build.cooling_default || "Air";
  if (cooling === "Air") {
    cost += Number(g.cooling_air_cost || 0);
  } else if (cooling === "AIO240") {
    cost += Number(g.cooling_aio240_cost || 0);
  } else if (cooling === "AIO360") {
    cost += Number(g.cooling_aio360_cost || 0);
  } else if (cooling === "AIO360_RGB") {
    cost += Number(g.cooling_aio360_rgb_cost || 0);
  } else if (cooling === "AIO360_LCD") {
    cost += Number(g.cooling_aio360_rgb_lcd_cost || 0);
  }

  // RGB add-on
  if (s.rgb === "RGB") cost += Number(g.rgb_extra_cost || 45);

  // Margin at the very end
  const marginPct = Number(g.profit_margin_percent || 0);
  return cost * (1 + marginPct / 100);
}

function platformOf(cpu) {
  return /Ryzen|AMD/i.test(cpu) ? "AMD" : "Intel";
}

function tierOfPrice(price) {
  const p = Number(price || 0);
  if (p < 225) return { key: "budget", label: "Starter / Budget" };
  if (p < 350) return { key: "mid", label: "Mid-range" };
  if (p < 600) return { key: "high", label: "High-end" };
  return { key: "extreme", label: "Extreme / Workstation" };
}

function levelMetaFor(build) {
  const t = tierOfPrice(build.bundle_price);
  const key = t.key;

  if (key === "budget") {
    return {
      key,
      label: "Level 1 • Starter Gaming",
      use: "1080p esports and lighter games like Fortnite, Valorant, Minecraft, Roblox.",
      res: "Great 1080p performance"
    };
  }
  if (key === "mid") {
    return {
      key,
      label: "Level 2 • Performance",
      use: "1440p high settings in most modern titles; strong 1080p competitive.",
      res: "1080p ultra / 1440p high"
    };
  }
  if (key === "high") {
    return {
      key,
      label: "Level 3 • Enthusiast",
      use: "High-refresh 1440p or entry-level 4K plus light creator work.",
      res: "1440p ultra / entry 4K"
    };
  }
  return {
    key,
    label: "Level 4 • Creator / Extreme",
    use: "4K gaming, heavy content creation, streaming, multi-monitor.",
    res: "1440p & 4K, creator-focused"
  };
}

function pickDefaultGpuTier(data, build, levelKey) {
  const pt = data.price_tables || {};
  const tiers = (pt.gpu_tiers || []).map((g) => g.tier);
  if (!tiers.length) return "";

  // Per-build override
  if (build.default_gpu_tier && tiers.includes(build.default_gpu_tier)) {
    return build.default_gpu_tier;
  }

  const prefs = {
    budget: ["RTX 5060", "RTX 5050", "RX 7600", "RX 6600"],
    mid: ["RTX 5060 Ti", "RTX 5070", "RX 7800 XT"],
    high: ["RTX 5070 Ti", "RTX 5080", "RX 7900 XT", "RX 7900 XTX"],
    extreme: ["RTX 5080", "RTX 5090", "RX 7900 XTX"]
  };

  const wanted = prefs[levelKey] || tiers;
  for (const name of wanted) {
    if (tiers.includes(name)) return name;
  }
  return tiers[0];
}

const compare = [];

function addToCompare(b, s, data) {
  if (compare.find((x) => x.sku === b.sku)) return renderCompare();
  compare.push({
    sku: b.sku,
    name: b.name,
    cpu: b.cpu,
    board: b.motherboard,
    price: computeTotal(data, b, s)
  });
  renderCompare();
}

function renderCompare() {
  const drawer = document.getElementById("compare-drawer");
  const list = document.getElementById("compare-list");
  if (!drawer || !list) return;

  if (compare.length === 0) {
    drawer.classList.remove("active");
    list.textContent = "Nothing to compare yet.";
    return;
  }

  drawer.classList.add("active");
  list.innerHTML = compare
    .map(
      (x) => `
      ${x.name}<br/>
      <span class="muted">${x.cpu} • ${x.board}</span><br/>
      <strong>${money(x.price)}</strong>
    `
    )
    .join(
      '<hr style="border:0;border-top:1px solid var(--border);margin:.5rem 0"/>'
    );

  const tgl = document.getElementById("toggle-compare");
  if (tgl) tgl.textContent = `Compare (${compare.length})`;
}

function showSpecs(b, s, data) {
  const total = computeTotal(data, b, s);

  const specs = `
CPU: ${b.cpu}
Motherboard: ${b.motherboard}
Base RAM: ${b.ram_base_gb}GB
Case (fixed): ${b.case_fixed}
M.2 slots: ${b.m2_slots}
Base storage: ${(b.storage_base?.ssd_tb ?? 1) + "TB NVMe"}

Selected:
- RAM: ${s.ram_gb}GB
- GPU: ${s.gpu_tier}
- HDDs: ${s.hdd_count} × ${s.hdd_capacity_tb}TB
- Extra NVMe: ${s.nvme_slots_used} × ${s.nvme_capacity_tb}TB
- Cooling: ${s.cooling}
- RGB: ${s.rgb}

Estimated total (pre-tax): ${money(total)}
`;

  const modal = document.getElementById("spec-modal");
  const content = document.getElementById("spec-modal-content");
  const title = document.getElementById("spec-modal-title");
  if (!modal || !content || !title) {
    alert(specs);
    return;
  }
  title.textContent = b.name;
  content.textContent = specs.trim();
  modal.classList.remove("hidden");
}

// Build a single level card with bundle selector
function renderLevelCard(data, levelKey, builds) {
  const mountCard = document.createElement("div");
  mountCard.className = "card build-card";

  const sorted = builds.slice().sort(
    (a, b) => Number(a.bundle_price || 0) - Number(b.bundle_price || 0)
  );
  let currentBuild = sorted[0];

  const level = levelMetaFor(currentBuild);
  const tier = tierOfPrice(currentBuild.bundle_price);

  // Base selections for "starting around" price
  const baseSelectionsFor = (build) => ({
    ram_gb: Number(build.ram_base_gb),
    gpu_tier: pickDefaultGpuTier(data, build, levelKey),
    hdd_capacity_tb: (data.price_tables.hdd || [])[0]?.capacity_tb || 0,
    hdd_count: 0,
    nvme_capacity_tb: (data.price_tables.nvme || [])[0]?.capacity_tb || 0,
    nvme_slots_used: 0,
    cooling: build.cooling_default || "Air",
    rgb: "NoRGB"
  });

  const baseSelections = baseSelectionsFor(currentBuild);
  const startingPrice = computeTotal(data, currentBuild, baseSelections);

  const variantOptions = sorted
    .map((b, idx) => {
      // Short label: CPU + board or just name
      const label =
        b.short_name ||
        `${b.cpu.replace(/AMD |Intel /g, "")} • ${b.motherboard}`;
      return `<option value="${idx}">${label}</option>`;
    })
    .join("");

  mountCard.innerHTML = `
    <div class="build-header">
      <div class="build-name-row">
        <h3>${level.label}</h3>
      </div>
      <div class="build-meta">
        <span class="badge-tier badge-tier-${tier.key}">
          ${tier.label}
        </span>
        <span class="muted"> • ${level.res}</span>
      </div>
      <p class="muted" style="margin-top:.35rem;">
        ${level.use}
      </p>
      <p class="build-base-price">
        Starting around <strong>${money(startingPrice)}</strong>
        <span class="muted">(before tax/shipping)</span>
      </p>
    </div>

    <details class="custom" open>
      <summary>Customize & choose your platform</summary>
      <div class="opt-grid">
        <div class="form-field">
          <label>Base bundle</label>
          <select name="variant" id="variant-select">
            ${variantOptions}
          </select>
          <span class="muted">Different CPU / motherboard combos in this level.</span>
        </div>

        <div class="form-field">
          <label>RAM</label>
          <select name="ram_gb" id="ram-select"></select>
          <span class="muted">Upgrades priced per +32GB.</span>
        </div>

        <div class="form-field">
          <label>GPU tier</label>
          <select name="gpu_tier" id="gpu-select"></select>
        </div>

        <div class="form-field">
          <label>HDD capacity (per drive)</label>
          <select name="hdd_capacity_tb" id="hdd-capacity-select"></select>
        </div>
        <div class="form-field">
          <label>HDD drives (max ${(data.global || {}).max_hdd_drives})</label>
          <input
            type="number"
            name="hdd_count"
            id="hdd-count"
            min="0"
            max="${(data.global || {}).max_hdd_drives}"
            value="0"
          />
        </div>
        <div class="form-field">
          <label>Extra NVMe capacity (per slot)</label>
          <select name="nvme_capacity_tb" id="nvme-capacity-select"></select>
        </div>
        <div class="form-field">
          <label>Use NVMe slots</label>
          <input
            type="number"
            name="nvme_slots_used"
            id="nvme-slots-used"
            min="0"
            value="0"
          />
          <span class="muted" id="nvme-limit-text"></span>
        </div>
        <div class="form-field">
          <label>Cooling</label>
          <select name="cooling" id="cooling-select">
            <option value="Air">Air (quiet & reliable)</option>
            <option value="AIO240">AIO 240mm</option>
            <option value="AIO360">AIO 360mm</option>
            <option value="AIO360_RGB">AIO 360mm RGB</option>
            <option value="AIO360_LCD">AIO 360mm RGB + LCD</option>
          </select>
        </div>
        <div class="form-field">
          <label>RGB</label>
          <select name="rgb" id="rgb-select">
            <option value="NoRGB" selected>Minimal lighting</option>
            <option value="RGB">RGB lighting</option>
          </select>
        </div>
      </div>

      <div class="actions">
        <button class="btn-secondary js-specs" type="button">
          View detailed specs
        </button>
        <button class="btn-secondary js-compare" type="button">
          Add to compare
        </button>
        <a class="btn js-start-order" href="/contact.html">Start order</a>
      </div>

      <div class="notice js-price" style="margin-top:.6rem"></div>
    </details>
  `;

  // DOM references
  const variantSelect = mountCard.querySelector("#variant-select");
  const ramSelect = mountCard.querySelector("#ram-select");
  const gpuSelect = mountCard.querySelector("#gpu-select");
  const hddCapSelect = mountCard.querySelector("#hdd-capacity-select");
  const hddCountInput = mountCard.querySelector("#hdd-count");
  const nvmeCapSelect = mountCard.querySelector("#nvme-capacity-select");
  const nvmeSlotsInput = mountCard.querySelector("#nvme-slots-used");
  const nvmeLimitText = mountCard.querySelector("#nvme-limit-text");
  const coolingSelect = mountCard.querySelector("#cooling-select");
  const rgbSelect = mountCard.querySelector("#rgb-select");
  const priceEl = mountCard.querySelector(".js-price");
  const specsBtn = mountCard.querySelector(".js-specs");
  const compareBtn = mountCard.querySelector(".js-compare");
  const startOrderLink = mountCard.querySelector(".js-start-order");

  // State for this level card
  const state = { ...baseSelections };

  function populateOptionsForBuild(build) {
    // RAM options
    const ramOptions = [build.ram_base_gb, 64, 96, 128, 192]
      .filter(Boolean)
      .map(
        (v) =>
          `<option value="${v}" ${
            Number(v) === Number(state.ram_gb) ? "selected" : ""
          }>${v} GB</option>`
      )
      .join("");
    ramSelect.innerHTML = ramOptions;

    // GPU options
    const pt = data.price_tables || {};
    gpuSelect.innerHTML = (pt.gpu_tiers || [])
      .map(
        (g) =>
          `<option value="${g.tier}" ${
            g.tier === state.gpu_tier ? "selected" : ""
          }>${g.tier} (+${money(g.cost)})</option>`
      )
      .join("");

    // HDD/NVMe options
    hddCapSelect.innerHTML = (pt.hdd || [])
      .map(
        (h) =>
          `<option value="${h.capacity_tb}" ${
            Number(h.capacity_tb) === Number(state.hdd_capacity_tb)
              ? "selected"
              : ""
          }>${h.capacity_tb} TB (+${money(h.cost)}/drive)</option>`
      )
      .join("");

    nvmeCapSelect.innerHTML = (pt.nvme || [])
      .map(
        (h) =>
          `<option value="${h.capacity_tb}" ${
            Number(h.capacity_tb) === Number(state.nvme_capacity_tb)
              ? "selected"
              : ""
          }>${h.capacity_tb} TB (+${money(h.cost)}/slot)</option>`
      )
      .join("");

    nvmeLimitText.textContent = `Up to ${build.m2_slots} extra drives.`;
    nvmeSlotsInput.max = String(build.m2_slots || 0);
  }

  function readStateFromControls() {
    state.ram_gb = Number(ramSelect.value);
    state.gpu_tier = gpuSelect.value;
    state.hdd_capacity_tb = Number(hddCapSelect.value);
    state.hdd_count = Number(hddCountInput.value);
    state.nvme_capacity_tb = Number(nvmeCapSelect.value);
    state.nvme_slots_used = Number(nvmeSlotsInput.value);
    state.cooling = coolingSelect.value;
    state.rgb = rgbSelect.value;
  }

  function updatePrice() {
    readStateFromControls();
    const total = computeTotal(data, currentBuild, state);
    const margin =
      (data.global || {}).profit_margin_percent != null
        ? (data.global || {}).profit_margin_percent
        : "";
    priceEl.innerHTML = `
      Estimated total (before tax/shipping): <strong>${money(
        total
      )}</strong>
      ${margin !== "" ? `&nbsp; <span class="badge-tier">Margin ${margin}%</span>` : ""}
    `;
  }

  // Initial populate
  populateOptionsForBuild(currentBuild);
  updatePrice();

  // Variant change
  variantSelect.addEventListener("change", () => {
    const idx = Number(variantSelect.value) || 0;
    currentBuild = sorted[idx];

    // reset state for new build baseline
    const newBase = baseSelectionsFor(currentBuild);
    Object.assign(state, newBase);

    // update controls to reflect new baseline
    coolingSelect.value = state.cooling;
    rgbSelect.value = state.rgb;
    hddCountInput.value = String(state.hdd_count);
    nvmeSlotsInput.value = String(state.nvme_slots_used);

    populateOptionsForBuild(currentBuild);
    updatePrice();
  });

  // Other control changes
  [
    ramSelect,
    gpuSelect,
    hddCapSelect,
    hddCountInput,
    nvmeCapSelect,
    nvmeSlotsInput,
    coolingSelect,
    rgbSelect
  ].forEach((el) => el.addEventListener("input", updatePrice));

  // Buttons
  specsBtn.addEventListener("click", () =>
    showSpecs(currentBuild, state, data)
  );
  compareBtn.addEventListener("click", () =>
    addToCompare(currentBuild, state, data)
  );
  startOrderLink.addEventListener("click", (e) => {
    e.preventDefault();
    updatePrice();
    startOrder(String(currentBuild.sku), state);
  });

  mountCard.dataset.level = levelKey;
  return mountCard;
}

// Init
(async function () {
  try {
    const data = await loadData();

    const last = document.getElementById("last-sync");
    if (last && data.meta?.updated_at) {
      const d = new Date(data.meta.updated_at);
      last.textContent = `Bundle data last updated: ${d.toLocaleString()}`;
    }

    const mount = document.getElementById("builds");
    const filter = document.getElementById("filter-platform");
    const sortBy = document.getElementById("sort-by");
    const searchInput = document.getElementById("search-builds");
    const toggleCompare = document.getElementById("toggle-compare");
    const drawer = document.getElementById("compare-drawer");

    // Group builds into 4 levels by bundle_price
    const grouped = { budget: [], mid: [], high: [], extreme: [] };
    (data.builds || []).forEach((b) => {
      const key = tierOfPrice(b.bundle_price).key;
      if (grouped[key]) grouped[key].push(b);
    });

    function levelGroupsFiltered() {
      const platformFilter = filter ? filter.value : "all";
      const q = (searchInput ? searchInput.value : "").toLowerCase().trim();

      const keysInOrder = ["budget", "mid", "high", "extreme"];
      const result = [];

      keysInOrder.forEach((key) => {
        let builds = grouped[key] || [];
        if (!builds.length) return;

        if (platformFilter !== "all") {
          builds = builds.filter(
            (b) => platformOf(b.cpu) === platformFilter
          );
        }

        if (q) {
          builds = builds.filter((b) =>
            (
              (b.name || "") +
              " " +
              (b.cpu || "") +
              " " +
              (b.motherboard || "") +
              " " +
              (b.sku || "")
            )
              .toLowerCase()
              .includes(q)
          );
        }

        if (!builds.length) return;
        result.push({ key, builds });
      });

      // Optional: sort levels by starting price if requested
      if (sortBy && sortBy.value === "price") {
        result.sort((a, b) => {
          const cheapestA = a.builds.reduce((min, x) =>
            Number(x.bundle_price || 0) < Number(min.bundle_price || 0)
              ? x
              : min
          );
          const cheapestB = b.builds.reduce((min, x) =>
            Number(x.bundle_price || 0) < Number(min.bundle_price || 0)
              ? x
              : min
          );
          const selA = {
            ram_gb: cheapestA.ram_base_gb,
            gpu_tier: pickDefaultGpuTier(data, cheapestA, a.key),
            hdd_capacity_tb: (data.price_tables.hdd || [])[0]?.capacity_tb || 0,
            hdd_count: 0,
            nvme_capacity_tb:
              (data.price_tables.nvme || [])[0]?.capacity_tb || 0,
            nvme_slots_used: 0,
            cooling: cheapestA.cooling_default || "Air",
            rgb: "NoRGB"
          };
          const selB = {
            ram_gb: cheapestB.ram_base_gb,
            gpu_tier: pickDefaultGpuTier(data, cheapestB, b.key),
            hdd_capacity_tb: (data.price_tables.hdd || [])[0]?.capacity_tb || 0,
            hdd_count: 0,
            nvme_capacity_tb:
              (data.price_tables.nvme || [])[0]?.capacity_tb || 0,
            nvme_slots_used: 0,
            cooling: cheapestB.cooling_default || "Air",
            rgb: "NoRGB"
          };
          return (
            computeTotal(data, cheapestA, selA) -
            computeTotal(data, cheapestB, selB)
          );
        });
      }

      return result;
    }

    function render() {
      if (!mount) return;
      mount.innerHTML = "";

      const groups = levelGroupsFiltered();
      groups.forEach(({ key, builds }) =>
        mount.appendChild(renderLevelCard(data, key, builds))
      );
    }

    if (filter) filter.addEventListener("change", render);
    if (sortBy) sortBy.addEventListener("change", render);
    if (searchInput) searchInput.addEventListener("input", render);
    if (toggleCompare && drawer) {
      toggleCompare.addEventListener("click", () =>
        drawer.classList.toggle("active")
      );
    }

    document.addEventListener("click", (e) => {
      const modal = document.getElementById("spec-modal");
      if (!modal || modal.classList.contains("hidden")) return;
      if (e.target.id === "spec-modal-close" || e.target === modal) {
        modal.classList.add("hidden");
      }
    });

    render();
  } catch (err) {
    console.error("Store init failed:", err);
    const mount = document.getElementById("builds");
    if (mount) {
      mount.innerHTML =
        '<div class="notice">There was an error loading the store. Please refresh the page.</div>';
    }
  }
})();
