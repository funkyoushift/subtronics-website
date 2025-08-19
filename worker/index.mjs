// Cloudflare Worker: Subtronics API (CORS-hardened + text/plain or JSON body)

function corsHeaders(origin) {
  // You can restrict to your site by setting CORS_ORIGIN in Worker Variables
  const allow = origin || "*";
  return {
    "access-control-allow-origin": allow,
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST,OPTIONS",
  };
}

function jres(obj, { status = 200, origin = "*" } = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json",
      ...corsHeaders(origin),
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const reqOrigin = request.headers.get("origin") || "*";
    const ALLOW_ORIGIN = env.CORS_ORIGIN || reqOrigin || "*";

    // Health check
    if (url.pathname === "/health") {
      return jres({ ok: true, worker: env.WORKER_NAME || "subtronics-api" }, { origin: ALLOW_ORIGIN });
    }

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(ALLOW_ORIGIN) });
    }

    // Only POST /create
    if (!(url.pathname === "/create" && request.method === "POST")) {
      return jres({ error: "Use POST /create" }, { status: 404, origin: ALLOW_ORIGIN });
    }

    try {
      // ---- Parse body: accept application/json or text/plain ----
      let body = {};
      const ct = (request.headers.get("content-type") || "").toLowerCase();
      if (ct.includes("application/json")) {
        body = await request.json();
      } else {
        const raw = await request.text();
        try { body = raw ? JSON.parse(raw) : {}; }
        catch { return jres({ error: "Invalid JSON" }, { status: 400, origin: ALLOW_ORIGIN }); }
      }

      const bundleSku = String(body.bundleSku || "").trim();
      if (!bundleSku) return jres({ error: "bundleSku required" }, { status: 400, origin: ALLOW_ORIGIN });

      const selections = body.selections || {};
      const qty = Number(body.qty || 1);

      // ---- Load builds.json ----
      if (!env.BUILDS_JSON_URL) {
        return jres({ error: "BUILDS_JSON_URL not configured" }, { status: 500, origin: ALLOW_ORIGIN });
      }
      const dataRes = await fetch(env.BUILDS_JSON_URL, { cf: { cacheTtl: 60 } });
      if (!dataRes.ok) {
        return jres({ error: "builds.json not reachable", status: dataRes.status }, { status: 502, origin: ALLOW_ORIGIN });
      }
      const data = await dataRes.json();

      const build = (data.builds || []).find(b => String(b.sku) === bundleSku);
      if (!build) return jres({ error: "Unknown bundle SKU" }, { status: 400, origin: ALLOW_ORIGIN });

      // ---- Pricing (same math as frontend) ----
      const money = n => Math.round(Number(n || 0) * 100) / 100;
      const pt = data.price_tables || {};
      const s = {
        ram_gb: Number(selections.ram_gb ?? build.ram_base_gb),
        gpu_tier: String(selections.gpu_tier ?? (pt.gpu_tiers?.[0]?.tier || "")),
        hdd_capacity_tb: Number(selections.hdd_capacity_tb ?? (pt.hdd?.[0]?.capacity_tb || 0)),
        hdd_count: Math.min(Number(selections.hdd_count ?? 0), data.global?.max_hdd_drives ?? 8),
        nvme_capacity_tb: Number(selections.nvme_capacity_tb ?? (pt.nvme?.[0]?.capacity_tb || 0)),
        nvme_slots_used: Math.min(Number(selections.nvme_slots_used ?? 0), build.m2_slots ?? (data.global?.default_m2_slots ?? 2)),
        cooling: String(selections.cooling ?? "Air"),
        rgb: String(selections.rgb ?? "NoRGB"),
      };

      let cost = Number(build.bundle_price || 0);
      const ramInc = Math.max(0, (s.ram_gb - build.ram_base_gb) / 32);
      cost += ramInc * Number(pt.ram_per_32gb_increment || 0);
      const gpu = (pt.gpu_tiers || []).find(g => g.tier === s.gpu_tier);
      if (gpu) cost += Number(gpu.cost || 0);
      const hddRow = (pt.hdd || []).find(h => Number(h.capacity_tb) === s.hdd_capacity_tb);
      if (hddRow) cost += Number(hddRow.cost || 0) * s.hdd_count;
      const nvRow = (pt.nvme || []).find(n => Number(n.capacity_tb) === s.nvme_capacity_tb);
      if (nvRow) cost += Number(nvRow.cost || 0) * s.nvme_slots_used;
      if (s.cooling === "AIO240") cost += 95;
      if (s.cooling === "AIO360_LCD") cost += 290;
      if (s.rgb === "RGB") cost += 45;

      const margin = Number(data.global?.profit_margin_percent || 0);
      const total = money(cost * (1 + margin / 100));

      // ---- Shopify Draft Order ----
      if (!env.SHOPIFY_STORE || !env.SHOPIFY_ADMIN_TOKEN) {
        return jres({ error: "Shopify credentials not configured" }, { status: 500, origin: ALLOW_ORIGIN });
      }
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

      const shopifyUrl = `https://${env.SHOPIFY_STORE}/admin/api/2024-10/draft_orders.json`;
      const shopifyResp = await fetch(shopifyUrl, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": env.SHOPIFY_ADMIN_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const out = await shopifyResp.json();

      if (!shopifyResp.ok) {
        return jres({ error: "Shopify error", status: shopifyResp.status, details: out }, { status: 502, origin: ALLOW_ORIGIN });
      }
      const invoiceUrl = out?.draft_order?.invoice_url;
      if (!invoiceUrl) return jres({ error: "No invoice URL from Shopify" }, { status: 502, origin: ALLOW_ORIGIN });

      return jres({ ok: true, invoiceUrl }, { origin: ALLOW_ORIGIN });

    } catch (err) {
      // Make sure errors ALSO send CORS headers
      return jres({ error: "Server error", message: String(err?.message || err) }, { status: 500, origin: reqOrigin || "*" });
    }
  },
};
