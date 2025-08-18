// worker/index.mjs
// Creates a Shopify Draft Order from a configurator selection and returns an invoice URL.

const json = (obj, status = 200, cors = "*") =>
  new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": cors,
      "access-control-allow-headers": "content-type",
      "access-control-allow-methods": "POST,OPTIONS",
    },
  });

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // health
    if (url.pathname === "/health") return json({ ok: true, worker: env.WORKER_NAME || "subtronics-api" });

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "content-type",
          "access-control-allow-methods": "POST,OPTIONS",
        },
      });
    }

    if (url.pathname !== "/create" || request.method !== "POST") {
      return json({ error: "Use POST /create" }, 404);
    }

    // --- 1) Read payload from your site ---
    let body;
    try {
      body = await request.json(); // { bundleSku, selections:{...}, qty? }
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    const bundleSku = String(body.bundleSku || "").trim();
    if (!bundleSku) return json({ error: "bundleSku required" }, 400);
    const selections = body.selections || {};
    const qty = Number(body.qty || 1);

    // --- 2) Load your pricing data from the website ---
    const res = await fetch(env.BUILDS_JSON_URL, { cf: { cacheTtl: 60 } });
    if (!res.ok) return json({ error: "builds.json not reachable" }, 502);
    const data = await res.json();

    const build = (data.builds || []).find(b => String(b.sku) === bundleSku);
    if (!build) return json({ error: "Unknown bundle SKU" }, 400);

    // --- 3) Server-side price calculation (mirrors store.js) ---
    const money = (n) => Math.round(n * 100) / 100;
    const s = {
      ram_gb: Number(selections.ram_gb ?? build.ram_base_gb),
      gpu_tier: String(selections.gpu_tier ?? (data.price_tables.gpu_tiers?.[0]?.tier || "")),
      hdd_capacity_tb: Number(selections.hdd_capacity_tb ?? (data.price_tables.hdd?.[0]?.capacity_tb || 0)),
      hdd_count: Math.min(Number(selections.hdd_count ?? 0), data.global?.max_hdd_drives ?? 8),
      nvme_capacity_tb: Number(selections.nvme_capacity_tb ?? (data.price_tables.nvme?.[0]?.capacity_tb || 0)),
      nvme_slots_used: Math.min(Number(selections.nvme_slots_used ?? 0), build.m2_slots ?? (data.global?.default_m2_slots ?? 2)),
      cooling: String(selections.cooling ?? "Air"),
      rgb: String(selections.rgb ?? "NoRGB"),
    };

    let cost = Number(build.bundle_price || 0);

    // RAM (+32GB steps above base)
    const ramInc = Math.max(0, (s.ram_gb - build.ram_base_gb) / 32);
    cost += ramInc * (data.price_tables?.ram_per_32gb_increment || 0);

    // GPU tier
    const gpu = (data.price_tables?.gpu_tiers || []).find(g => g.tier === s.gpu_tier);
    if (gpu) cost += Number(gpu.cost || 0);

    // HDDs
    const hddRow = (data.price_tables?.hdd || []).find(h => Number(h.capacity_tb) === s.hdd_capacity_tb);
    if (hddRow) cost += Number(hddRow.cost || 0) * s.hdd_count;

    // Extra NVMe per slot
    const nvRow = (data.price_tables?.nvme || []).find(n => Number(n.capacity_tb) === s.nvme_capacity_tb);
    if (nvRow) cost += Number(nvRow.cost || 0) * s.nvme_slots_used;

    // Cooling
    if (s.cooling === "AIO240") cost += 95;
    if (s.cooling === "AIO360_LCD") cost += 290;

    // RGB
    if (s.rgb === "RGB") cost += 45;

    const margin = Number(data.global?.profit_margin_percent || 0);
    const total = money(cost * (1 + margin / 100));

    // --- 4) Build Draft Order payload ---
    const lineItem = {
      title: `Custom PC Build — ${build.name}`,
      quantity: qty,
      price: total.toFixed(2),
      custom: true,
      properties: [
        { name: "Bundle", value: `${build.sku} (${build.cpu} / ${build.motherboard})` },
        { name: "Base RAM", value: `${build.ram_base_gb}GB` },
        { name: "Case", value: `${build.case_fixed}` },
        { name: "M.2 Slots", value: `${build.m2_slots}` },
        { name: "Selected RAM", value: `${s.ram_gb}GB` },
        { name: "GPU Tier", value: `${s.gpu_tier}` },
        { name: "HDDs", value: `${s.hdd_count} × ${s.hdd_capacity_tb}TB` },
        { name: "Extra NVMe", value: `${s.nvme_slots_used} × ${s.nvme_capacity_tb}TB` },
        { name: "Cooling", value: `${s.cooling}` },
        { name: "RGB", value: `${s.rgb}` },
        { name: "Last Sync", value: `${data.meta?.updated_at || "n/a"}` },
      ],
    };

    const payload = { draft_order: { line_items: [lineItem], use_customer_default_address: true } };

    // --- 5) Call Shopify Admin API ---
    const api = `https://${env.SHOPIFY_STORE}/admin/api/2024-10/draft_orders.json`;
    const shopifyResp = await fetch(api, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": env.SHOPIFY_ADMIN_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const out = await shopifyResp.json();

    if (!shopifyResp.ok) {
      return json({ error: "Shopify error", status: shopifyResp.status, details: out }, 502);
    }

    const invoiceUrl = out?.draft_order?.invoice_url;
    if (!invoiceUrl) return json({ error: "No invoice URL from Shopify" }, 502);

    return json({ ok: true, invoiceUrl });
  },
};
