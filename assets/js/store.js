/* assets/js/store.js
   - Uses Content-Type: text/plain for Worker POST (simple request, no OPTIONS)
   - Worker parses JSON from request.text()
*/

const WORKER_CREATE_URL =
  'https://subtronics-api.screename53.workers.dev/create';

// Load builds.json
async function loadData() {
  const r = await fetch('/assets/js/builds.json', { cache: 'no-store' });
  if (!r.ok) throw new Error('Failed to load builds.json');
  return await r.json();
}

const money = (n) => '$' + Number(n || 0).toFixed(2);

// Compute total price given selections (platform + RAM/GPU/storage/etc)
function computeTotal(data, build, s) {
  let cost = Number(build.bundle_price || 0);
  const pt = data.price_tables || {};

  const ramInc = Math.max(
    0,
    (Number(s.ram_gb) - Number(build.ram_base_gb)) / 32
  );
  cost += ramInc * Number(pt.ram_per_32gb_increment || 0);

  const gpu = (pt.gpu_tiers || []).find((g) => g.tier === s.gpu_tier);
  if (gpu) cost += Number(gpu.cost || 0);

  const hddRow = (pt.hdd || []).find(
    (h) => Number(h.capacity_tb) === Number(s.hdd_capacity_tb)
  );
  if (hddRow) cost += Number(hddRow.cost || 0) * Number(s.hdd_count || 0);

  const nvRow = (pt.nvme || []).find(
    (n) => Number(n.capacity_tb) === Number(s.nvme_capacity_tb)
  );
  if (nvRow)
    cost += Number(nvRow.cost || 0) * Number(s.nvme_slots_used || 0);

  // Cooling / RGB (still simple for now)
  if (s.cooling === 'AIO240') cost += 95;
  if (s.cooling === 'AIO360_LCD') cost += 290;
  if (s.rgb === 'RGB') cost += 45;

  return (
    cost *
    (1 + Number((data.global || {}).profit_margin_percent || 0) / 100)
  );
}

function platformOf(cpu) {
  return /Ryzen|AMD/i.test(cpu) ? 'AMD' : 'Intel';
}

// Rough tiering based on bundle price
function tierOfPrice(price) {
  const p = Number(price || 0);
  if (p < 225) return { key: 'budget', label: 'Starter / Budget' };
  if (p < 350) return { key: 'mid', label: 'Mid-range' };
  if (p < 600) return { key: 'high', label: 'High-end' };
  return { key: 'extreme', label: 'Extreme / Workstation' };
}

// Map tier -> friendly "level" and use-case copy
function levelMetaFor(build) {
  const t = tierOfPrice(build.bundle_price);
  const key = t.key;

  if (key === 'budget') {
    return {
      label: 'Level 1 • Starter Gaming',
      use: '1080p esports and lighter games like Fortnite, Valorant, Minecraft, Roblox.',
      res: 'Great 1080p performance'
    };
  }
  if (key === 'mid') {
    return {
      label: 'Level 2 • Performance',
      use: '1440p high settings in most modern titles; strong 1080p competitive.',
      res: '1080p ultra / 1440p high'
    };
  }
  if (key === 'high') {
    return {
      label: 'Level 3 • Enthusiast',
      use: 'High-refresh 1440p or entry-level 4K plus light creator work.',
      res: '1440p ultra / entry 4K'
    };
  }
  return {
    label: 'Level 4 • Creator / Extreme',
    use: '4K gaming, heavy content creation, streaming, multi-monitor.',
    res: '1440p & 4K, creator-focused'
  };
}

// Call Cloudflare Worker to create order/invoice
async function startOrder(bundleSku, state) {
  try {
    const resp = await fetch(WORKER_CREATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // keep simple CORS
      body: JSON.stringify({ bundleSku, selections: state })
    });
    const data = await resp.json();

    if (resp.ok && data?.invoiceUrl) {
      window.location = data.invoiceUrl;
      return;
    }
    if (resp.ok && data?.adminUrl) {
      alert('Draft created. Opening Shopify to send the invoice…');
      window.open(data.adminUrl, '_blank');
      return;
    }

    alert(`Order creation failed: ${data?.error || 'Unknown error'}`);
    console.error('Worker non-200:', resp.status, data);
  } catch (err) {
    alert('Network error while creating order.');
    console.error(err);
  }
}

// Build a single card node (level/use-case first, specs in details)
function buildCard(data, b) {
  const c = document.createElement('div');
  c.className = 'card build-card';

  const sffBadge =
    b.case_fixed && /ITX|SFF|Small/i.test(b.case_fixed)
      ? '<span class="badge-sff">SFF</span>'
      : '';

  const tier = tierOfPrice(b.bundle_price);
  const level = levelMetaFor(b);

  const estBase = Number(b.bundle_price || 0);
  const levelLabel = level.label;
  const levelUse = level.use;
  const levelRes = level.res;

  c.innerHTML = `
    <div class="build-header">
      <div class="build-name-row">
        <h3>${levelLabel}</h3>
        ${sffBadge}
      </div>
      <div class="build-meta">
        <span class="badge-tier badge-tier-${tier.key}">
          ${tier.label}
        </span>
        <span class="muted"> • ${levelRes}</span>
      </div>
      <p class="muted" style="margin-top:.35rem;">
        ${levelUse}
      </p>
      <p class="build-base-price">
        Starting around <strong>${money(estBase)}</strong>
        <span class="muted">(before GPU, storage, and options)</span>
      </p>
    </div>

    <details class="custom">
      <summary>Customize & view full specs</summary>
      <div class="opt-grid">
        <div class="form-field">
          <label>RAM</label>
          <select name="ram_gb">
            ${[b.ram_base_gb, 64, 96, 128, 192]
              .filter(Boolean)
              .map(
                (v) => `
              <option value="${v}" ${
                  Number(v) === Number(b.ram_base_gb) ? 'selected' : ''
                }>${v} GB</option>`
              )
              .join('')}
          </select>
          <span class="muted">Upgrades priced per +32GB.</span>
        </div>
        <div class="form-field">
          <label>GPU tier</label>
          <select name="gpu_tier">
            ${(data.price_tables.gpu_tiers || [])
              .map(
                (g) =>
                  `<option value="${g.tier}">${g.tier} (+${money(
                    g.cost
                  )})</option>`
              )
              .join('')}
          </select>
        </div>
        <div class="form-field">
          <label>HDD capacity (per drive)</label>
          <select name="hdd_capacity_tb">
            ${(data.price_tables.hdd || [])
              .map(
                (h) =>
                  `<option value="${h.capacity_tb}">${h.capacity_tb} TB (+${money(
                    h.cost
                  )}/drive)</option>`
              )
              .join('')}
          </select>
        </div>
        <div class="form-field">
          <label>HDD drives (max ${
            (data.global || {}).max_hdd_drives
          })</label>
          <input
            type="number"
            name="hdd_count"
            min="0"
            max="${(data.global || {}).max_hdd_drives}"
            value="0"
          />
        </div>
        <div class="form-field">
          <label>Extra NVMe capacity (per slot)</label>
          <select name="nvme_capacity_tb">
            ${(data.price_tables.nvme || [])
              .map(
                (h) =>
                  `<option value="${h.capacity_tb}">${h.capacity_tb} TB (+${money(
                    h.cost
                  )}/slot)</option>`
              )
              .join('')}
          </select>
        </div>
        <div class="form-field">
          <label>Use NVMe slots</label>
          <input
            type="number"
            name="nvme_slots_used"
            min="0"
            max="${b.m2_slots}"
            value="0"
          />
          <span class="muted">Up to ${b.m2_slots} extra drives.</span>
        </div>
        <div class="form-field">
          <label>Cooling</label>
          <select name="cooling">
            <option value="Air">Air (default)</option>
            <option value="AIO240">AIO 240mm (+$95)</option>
            <option value="AIO360_LCD">AIO 360mm w/ LCD (+$290)</option>
          </select>
        </div>
        <div class="form-field">
          <label>RGB</label>
          <select name="rgb">
            <option value="NoRGB" selected>No RGB</option>
            <option value="RGB">RGB (+$45)</option>
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
        <a class="btn" href="/contact.html">Start order</a>
      </div>

      <div class="notice js-price" style="margin-top:.6rem"></div>
    </details>
  `;

  // default selection state
  const state = {
    ram_gb: Number(b.ram_base_gb),
    gpu_tier: (data.price_tables.gpu_tiers || [])[0]?.tier || '',
    hdd_capacity_tb: (data.price_tables.hdd || [])[0]?.capacity_tb || 0,
    hdd_count: 0,
    nvme_capacity_tb: (data.price_tables.nvme || [])[0]?.capacity_tb || 0,
    nvme_slots_used: 0,
    cooling: 'Air',
    rgb: 'NoRGB'
  };

  const inputs = c.querySelectorAll('select,input[name],input[type="number"]');
  const priceEl = c.querySelector('.js-price');

  const update = () => {
    inputs.forEach((el) => {
      const name = el.getAttribute('name');
      if (!name) return;
      state[name] = el.type === 'number' ? Number(el.value) : el.value;
    });
    const total = computeTotal(data, b, state);
    priceEl.innerHTML = `
      Estimated total (before tax/shipping): <strong>${money(
        total
      )}</strong>
      &nbsp; <span class="badge-tier">Margin ${
        (data.global || {}).profit_margin_percent || 0
      }%</span>
    `;
  };

  inputs.forEach((el) => el.addEventListener('input', update));
  update();

  const orderBtn = c.querySelector('.actions .btn');
  orderBtn.addEventListener('click', (e) => {
    e.preventDefault();
    update();
    startOrder(String(b.sku), state);
  });

  c.querySelector('.js-compare').addEventListener('click', () =>
    addToCompare(b, state, data)
  );
  c.querySelector('.js-specs').addEventListener('click', () =>
    showSpecs(b, state, data)
  );

  c.dataset.platform = platformOf(b.cpu);
  c.dataset.basePrice = String(b.bundle_price ?? 0);

  return c;
}

// Compare drawer
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
  const drawer = document.getElementById('compare-drawer');
  const list = document.getElementById('compare-list');
  if (!drawer || !list) return;

  if (compare.length === 0) {
    drawer.classList.remove('active');
    list.textContent = 'Nothing to compare yet.';
    return;
  }

  drawer.classList.add('active');
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

  const tgl = document.getElementById('toggle-compare');
  if (tgl) tgl.textContent = `Compare (${compare.length})`;
}

// Show specs in modal instead of alert
function showSpecs(b, s, data) {
  const total = computeTotal(data, b, s);

  const specs = `
CPU: ${b.cpu}
Motherboard: ${b.motherboard}
Base RAM: ${b.ram_base_gb}GB
Case (fixed): ${b.case_fixed}
M.2 slots: ${b.m2_slots}
Base storage: ${(b.storage_base?.ssd_tb ?? 1) + 'TB NVMe'}

Selected:
- RAM: ${s.ram_gb}GB
- GPU: ${s.gpu_tier}
- HDDs: ${s.hdd_count} × ${s.hdd_capacity_tb}TB
- Extra NVMe: ${s.nvme_slots_used} × ${s.nvme_capacity_tb}TB
- Cooling: ${s.cooling}
- RGB: ${s.rgb}

Estimated total (pre-tax): ${money(total)}
`;

  const modal = document.getElementById('spec-modal');
  const content = document.getElementById('spec-modal-content');
  const title = document.getElementById('spec-modal-title');
  if (!modal || !content || !title) {
    alert(specs);
    return;
  }
  title.textContent = b.name;
  content.textContent = specs.trim();
  modal.classList.remove('hidden');
}

// Init
(async function () {
  try {
    const data = await loadData();

    const last = document.getElementById('last-sync');
    if (last && data.meta?.updated_at) {
      const d = new Date(data.meta.updated_at);
      last.textContent = `Bundle data last updated: ${d.toLocaleString()}`;
    }

    const mount = document.getElementById('builds');
    const filter = document.getElementById('filter-platform');
    const sortBy = document.getElementById('sort-by');
    const searchInput = document.getElementById('search-builds');
    const toggleCompare = document.getElementById('toggle-compare');
    const drawer = document.getElementById('compare-drawer');

    function render() {
      if (!mount) return;
      mount.innerHTML = '';

      let builds = (data.builds || []).slice();

      // platform filter
      if (filter && filter.value !== 'all') {
        builds = builds.filter((b) => platformOf(b.cpu) === filter.value);
      }

      // search filter
      if (searchInput && searchInput.value.trim() !== '') {
        const q = searchInput.value.toLowerCase();
        builds = builds.filter((b) =>
          (
            (b.name || '') +
            ' ' +
            (b.cpu || '') +
            ' ' +
            (b.motherboard || '') +
            ' ' +
            (b.sku || '')
          )
            .toLowerCase()
            .includes(q)
        );
      }

      // sort
      if (sortBy && sortBy.value === 'price') {
        builds.sort(
          (a, b) =>
            Number(a.bundle_price || 0) - Number(b.bundle_price || 0)
        );
      } else {
        builds.sort((a, b) =>
          String(a.name || '').localeCompare(String(b.name || ''))
        );
      }

      builds.forEach((b) => mount.appendChild(buildCard(data, b)));
    }

    if (filter) filter.addEventListener('change', render);
    if (sortBy) sortBy.addEventListener('change', render);
    if (searchInput) searchInput.addEventListener('input', render);
    if (toggleCompare && drawer) {
      toggleCompare.addEventListener('click', () =>
        drawer.classList.toggle('active')
      );
    }

    // Close modal on X or background click
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('spec-modal');
      if (!modal || modal.classList.contains('hidden')) return;

      if (
        e.target.id === 'spec-modal-close' ||
        e.target === modal
      ) {
        modal.classList.add('hidden');
      }
    });

    render();
  } catch (err) {
    console.error('Store init failed:', err);
    const mount = document.getElementById('builds');
    if (mount) {
      mount.innerHTML =
        '<div class="notice">There was an error loading the store. Please refresh the page.</div>';
    }
  }
})();
