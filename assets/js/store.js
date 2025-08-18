async function loadData(){ 
  const r = await fetch('/assets/js/builds.json'); // note the leading /
  return await r.json();
}

const money = n => '$' + n.toFixed(2);

function computeTotal(data, build, s){
  let cost = build.bundle_price;

  // RAM upgrade (in 32GB steps above base)
  const ramInc = Math.max(0, (s.ram_gb - build.ram_base_gb) / 32);
  cost += ramInc * data.price_tables.ram_per_32gb_increment;

  // GPU tier
  const gpu = data.price_tables.gpu_tiers.find(g=>g.tier===s.gpu_tier);
  if(gpu) cost += gpu.cost;

  // HDDs
  const hddRow = data.price_tables.hdd.find(h=>h.capacity_tb==s.hdd_capacity_tb);
  if(hddRow) cost += (hddRow.cost * s.hdd_count);

  // Extra NVMe per M.2 slot
  const nvRow = data.price_tables.nvme.find(n=>n.capacity_tb==s.nvme_capacity_tb);
  if(nvRow) cost += (nvRow.cost * s.nvme_slots_used);

  // Cooling
  if(s.cooling==='AIO240') cost += 95;
  if(s.cooling==='AIO360_LCD') cost += 290;

  // RGB
  if(s.rgb==='RGB') cost += 45;

  // Margin
  return cost * (1 + (data.global.profit_margin_percent/100));
}

function platformOf(cpu){
  return /Ryzen|AMD/i.test(cpu) ? 'AMD' : 'Intel';
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
        Case: <strong>${b.case_fixed}</strong> • M.2 Slots: <strong>${b.m2_slots}</strong> • Base Storage: <strong>${b.storage_base?.ssd_tb ?? 1}TB NVMe</strong><br/>
        Bundle Price: <strong>${money(b.bundle_price)}</strong>
      </div>
    </div>

    <details class="custom">
      <summary>Customize</summary>
      <div class="opt-grid" style="margin:.6rem 0">
        <div class="form-field">
          <label>RAM</label>
          <select name="ram_gb">
            ${[b.ram_base_gb,64,96,128,192].map(v=>`<option value="${v}" ${v===b.ram_base_gb?'selected':''}>${v} GB</option>`).join('')}
          </select>
          <span class="muted">Upgrades priced per +32GB</span>
        </div>

        <div class="form-field">
          <label>GPU Tier</label>
          <select name="gpu_tier">
            ${data.price_tables.gpu_tiers.map(g=>`<option value="${g.tier}">${g.tier} (+${money(g.cost)})</option>`).join('')}
          </select>
        </div>

        <div class="form-field">
          <label>HDD Capacity (per drive)</label>
          <select name="hdd_capacity_tb">
            ${data.price_tables.hdd.map(h=>`<option value="${h.capacity_tb}">${h.capacity_tb} TB (+${money(h.cost)}/drive)</option>`).join('')}
          </select>
        </div>

        <div class="form-field">
          <label>HDD Drives (max ${data.global.max_hdd_drives})</label>
          <input type="number" name="hdd_count" min="0" max="${data.global.max_hdd_drives}" value="0"/>
        </div>

        <div class="form-field">
          <label>Extra NVMe Capacity (per slot)</label>
          <select name="nvme_capacity_tb">
            ${data.price_tables.nvme.map(h=>`<option value="${h.capacity_tb}">${h.capacity_tb} TB (+${money(h.cost)}/slot)</option>`).join('')}
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
        <button class="btn-secondary js-specs">Spec Sheet</button>
        <button class="btn-secondary js-compare">Add to Compare</button>
        <a class="btn" href="/contact.html">Start Order</a>
      </div>

      <div class="notice js-price" style="margin-top:.6rem"></div>
    </details>
  `;

  // State + wiring
  const state = {
    ram_gb: b.ram_base_gb,
    gpu_tier: data.price_tables.gpu_tiers[0]?.tier,
    hdd_capacity_tb: data.price_tables.hdd[0]?.capacity_tb,
    hdd_count: 0,
    nvme_capacity_tb: data.price_tables.nvme[0]?.capacity_tb,
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
    priceEl.innerHTML = `Estimated total (before tax/shipping): <strong>${money(total)}</strong> &nbsp; <span class="badge">Margin ${data.global.profit_margin_percent}%</span>`;
  };
  inputs.forEach(el=>el.addEventListener('input', update));
  update();

  // Compare + Spec Sheet
  c.querySelector('.js-compare').addEventListener('click', ()=> addToCompare(b, state, data));
  c.querySelector('.js-specs').addEventListener('click', ()=> showSpecs(b, state, data));

  // Tag platform for filtering
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
  if(compare.length===0){ drawer.classList.remove('active'); list.textContent = 'Nothing to compare yet.'; return; }
  drawer.classList.add('active');
  list.innerHTML = compare.map(x=>`${x.name}<br><span class="muted">${x.cpu} • ${x.board}</span><br><strong>${money(x.price)}</strong>`).join('<hr style="border:0;border-top:1px solid var(--border);margin:.5rem 0"/>');
  document.getElementById('toggle-compare').textContent = `Compare (${compare.length})`;
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
  const data = await loadData();
  const mount = document.getElementById('builds');
  const filter = document.getElementById('filter-platform');
  const sortBy = document.getElementById('sort-by');
  const toggleCompare = document.getElementById('toggle-compare');
  const drawer = document.getElementById('compare-drawer');

  function render(){
    mount.innerHTML = '';
    let builds = data.builds.slice();
    // filter
    if(filter.value!=='all'){
      builds = builds.filter(b => platformOf(b.cpu)===filter.value);
    }
    // sort
    if(sortBy.value==='price'){ builds.sort((a,b)=> (a.bundle_price??0)-(b.bundle_price??0)); }
    else { builds.sort((a,b)=> a.name.localeCompare(b.name)); }

    builds.forEach(b => mount.appendChild(buildCard(data,b)));
  }

  filter.addEventListener('change', render);
  sortBy.addEventListener('change', render);
  toggleCompare.addEventListener('click', ()=> drawer.classList.toggle('active'));
  render();
})();
