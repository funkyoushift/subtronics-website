/* assets/js/store.js  (patched to avoid CORS preflight)
   - Uses Content-Type: text/plain for Worker POST (simple request, no OPTIONS)
   - Worker must parse JSON from request.text()
*/

const WORKER_CREATE_URL = 'https://subtronics-api.screename53.workers.dev/create'; // confirm subdomain

async function loadData(){
  const r = await fetch('/assets/js/builds.json', {cache: 'no-store'});
  if(!r.ok) throw new Error('Failed to load builds.json');
  return await r.json();
}

const money = n => '$' + Number(n || 0).toFixed(2);

function computeTotal(data, build, s){
  let cost = Number(build.bundle_price || 0);
  const pt = data.price_tables || {};
  const ramInc = Math.max(0, (Number(s.ram_gb) - Number(build.ram_base_gb)) / 32);
  cost += ramInc * Number(pt.ram_per_32gb_increment || 0);
  const gpu = (pt.gpu_tiers || []).find(g=>g.tier===s.gpu_tier);
  if(gpu) cost += Number(gpu.cost || 0);
  const hddRow = (pt.hdd || []).find(h=>Number(h.capacity_tb)===Number(s.hdd_capacity_tb));
  if(hddRow) cost += Number(hddRow.cost || 0) * Number(s.hdd_count || 0);
  const nvRow = (pt.nvme || []).find(n=>Number(n.capacity_tb)===Number(s.nvme_capacity_tb));
  if(nvRow) cost += Number(nvRow.cost || 0) * Number(s.nvme_slots_used || 0);
  if(s.cooling==='AIO240') cost += 95;
  if(s.cooling==='AIO360_LCD') cost += 290;
  if(s.rgb==='RGB') cost += 45;
  return cost * (1 + Number((data.global||{}).profit_margin_percent || 0)/100);
}

function platformOf(cpu){ return /Ryzen|AMD/i.test(cpu) ? 'AMD' : 'Intel'; }

async function startOrder(bundleSku, state){
  try{
    const resp = await fetch(WORKER_CREATE_URL, {
      method: 'POST',
      // simple request: no preflight
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ bundleSku, selections: state })
    });
    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); } catch { data = {raw:text}; }
    if(!resp.ok){
      alert('Server error creating order. See console.');
      console.error('Worker non-200:', resp.status, data);
      return;
    }
    if(!data?.invoiceUrl){
      alert('Order creation failed. See console.');
      console.error('Worker response:', data);
      return;
    }
    window.location = data.invoiceUrl;
  }catch(err){
    alert('Network error while creating order.');
    console.error(err);
  }
}

function buildCard(data, b){
  const c = document.createElement('div');
  c.className = 'card build-card';
  const sffBadge = (b.case_fixed && /ITX|SFF|Small/i.test(b.case_fixed)) ? '<span class="badge-sff">SFF</span>' : '';

  c.innerHTML = `
    <div>
      <h3>${b.name} ${sffBadge}</h3>
      <div class="build-meta">
        CPU: <strong>${b.cpu}</strong> • Board: <strong>${b.motherboard}</strong> • Base RAM: <strong>${b.ram_base_gb}GB</strong><br/>
        Case: <strong>${b.case_fixed}</strong> • M.2 Slots: <strong>${b.m2_slots}</strong> • Base Storage: <strong>${(b.storage_base?.ssd_tb ?? 1)}TB NVMe</strong><br/>
        Bundle Price: <strong>${money(b.bundle_price)}</strong>
      </div>
    </div>

    <details class="custom">
      <summary>Customize</summary>
      <div class="opt-grid" style="margin:.6rem 0">
        <div class="form-field">
          <label>RAM</label>
          <select name="ram_gb">
            ${[b.ram_base_gb,64,96,128,192].filter(Boolean).map(v=>`<option value="${v}" ${Number(v)===Number(b.ram_base_gb)?'selected':''}>${v} GB</option>`).join('')}
          </select>
          <span class="muted">Upgrades priced per +32GB</span>
        </div>
        <div class="form-field">
          <label>GPU Tier</label>
          <select name="gpu_tier">
            ${(data.price_tables.gpu_tiers || []).map(g=>`<option value="${g.tier}">${g.tier} (+${money(g.cost)})</option>`).join('')}
          </select>
        </div>
        <div class="form-field">
          <label>HDD Capacity (per drive)</label>
          <select name="hdd_capacity_tb">
            ${(data.price_tables.hdd || []).map(h=>`<option value="${h.capacity_tb}">${h.capacity_tb} TB (+${money(h.cost)}/drive)</option>`).join('')}
          </select>
        </div>
        <div class="form-field">
          <label>HDD Drives (max ${(data.global||{}).max_hdd_drives})</label>
          <input type="number" name="hdd_count" min="0" max="${(data.global||{}).max_hdd_drives}" value="0"/>
        </div>
        <div class="form-field">
          <label>Extra NVMe Capacity (per slot)</label>
          <select name="nvme_capacity_tb">
            ${(data.price_tables.nvme || []).map(h=>`<option value="${h.capacity_tb}">${h.capacity_tb} TB (+${money(h.cost)}/slot)</option>`).join('')}
          </select>
        </div>
        <div class="form-field">
          <label>Use NVMe Slots</label>
          <input type="number" name="nvme_slots_used" min="0" max="${b.m2_slots}" value="0"/>
          <span class="muted">Up to ${b.m2_slots} slots</span>
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
        <button class="btn-secondary js-specs" type="button">Spec Sheet</button>
        <button class="btn-secondary js-compare" type="button">Add to Compare</button>
        <a class="btn" href="/contact.html">Start Order</a>
      </div>

      <div class="notice js-price" style="margin-top:.6rem"></div>
    </details>
  `;

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

  const update = ()=>{
    inputs.forEach(el=>{
      const name = el.getAttribute('name');
      state[name] = el.type==='number' ? Number(el.value) : el.value;
    });
    const total = computeTotal(data,b,state);
    priceEl.innerHTML = `Estimated total (before tax/shipping): <strong>${money(total)}</strong> &nbsp; <span class="badge">Margin ${Number((data.global||{}).profit_margin_percent || 0)}%</span>`;
  };
  inputs.forEach(el=>el.addEventListener('input', update));
  update();

  const orderBtn = c.querySelector('.actions .btn');
  orderBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    update();
    startOrder(String(b.sku), state);
  });

  c.querySelector('.js-compare').addEventListener('click', ()=> addToCompare(b, state, data));
  c.querySelector('.js-specs').addEventListener('click', ()=> showSpecs(b, state, data));

  c.dataset.platform = platformOf(b.cpu);
  c.dataset.basePrice = String(b.bundle_price ?? 0);

  return c;
}

const compare = [];
function addToCompare(b, s, data){
  if(compare.find(x=>x.sku===b.sku)) return renderCompare();
  compare.push({sku:b.sku, name:b.name, cpu:b.cpu, board:b.motherboard, price: computeTotal(data,b,s)});
  renderCompare();
}
function renderCompare(){
  const drawer = document.getElementById('compare-drawer');
  const list = document.getElementById('compare-list');
  if(!drawer || !list) return;
  if(compare.length===0){ drawer.classList.remove('active'); list.textContent = 'Nothing to compare yet.'; return; }
  drawer.classList.add('active');
  list.innerHTML = compare.map(x=>`${x.name}<br><span class="muted">${x.cpu} • ${x.board}</span><br><strong>${money(x.price)}</strong>`).join('<hr style="border:0;border-top:1px solid var(--border);margin:.5rem 0"/>');
  const tgl = document.getElementById('toggle-compare');
  if(tgl) tgl.textContent = `Compare (${compare.length})`;
}
function showSpecs(b, s, data){
  const specs = `
CPU: ${b.cpu}
Motherboard: ${b.motherboard}
Base RAM: ${b.ram_base_gb}GB
Case (fixed): ${b.case_fixed}
M.2 Slots: ${b.m2_slots}
Base Storage: ${(b.storage_base?.ssd_tb ?? 1)}TB NVMe

Selected:
- RAM: ${s.ram_gb}GB
- GPU: ${s.gpu_tier}
- HDDs: ${s.hdd_count} × ${s.hdd_capacity_tb}TB
- Extra NVMe: ${s.nvme_slots_used} × ${s.nvme_capacity_tb}TB
- Cooling: ${s.cooling}
- RGB: ${s.rgb}

Estimated Total (pre-tax): ${money(computeTotal(data,b,s))}`;
  alert(specs);
}

(async function(){
  try{
    const data = await loadData();
    const last = document.getElementById('last-sync');
    if (last && data.meta?.updated_at) {
      const d = new Date(data.meta.updated_at);
      last.textContent = `Last updated: ${d.toLocaleString()}`;
    }

    const mount = document.getElementById('builds');
    const filter = document.getElementById('filter-platform');
    const sortBy = document.getElementById('sort-by');
    const toggleCompare = document.getElementById('toggle-compare');
    const drawer = document.getElementById('compare-drawer');

    function render(){
      if(!mount) return;
      mount.innerHTML = '';
      let builds = (data.builds || []).slice();
      if(filter && filter.value!=='all'){
        builds = builds.filter(b => platformOf(b.cpu)===filter.value);
      }
      if(sortBy && sortBy.value==='price'){ builds.sort((a,b)=> (Number(a.bundle_price||0))-(Number(b.bundle_price||0))); }
      else { builds.sort((a,b)=> String(a.name).localeCompare(String(b.name))); }
      builds.forEach(b => mount.appendChild(buildCard(data,b)));
    }

    if(filter) filter.addEventListener('change', render);
    if(sortBy) sortBy.addEventListener('change', render);
    if(toggleCompare && drawer){
      toggleCompare.addEventListener('click', ()=> drawer.classList.toggle('active'));
    }

    render();
  }catch(err){
    console.error('Store init failed:', err);
    const mount = document.getElementById('builds');
    if(mount){ mount.innerHTML = `<div class="notice">There was an error loading the store. Please refresh the page.</div>`; }
  }
})();