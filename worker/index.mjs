// worker/index.mjs

// Small helper to always include CORS headers.
function j(obj, { status = 200, origin = "*" } = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": origin,
      "access-control-allow-headers": "content-type",
      "access-control-allow-methods": "POST,OPTIONS",
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    // Decide what Origin to allow
    const reqOrigin = request.headers.get("origin") || "";
    const allowOrigin =
      env.CORS_ORIGIN && env.CORS_ORIGIN !== "*"
        ? env.CORS_ORIGIN
        : reqOrigin || "*";

    try {
      const url = new URL(request.url);

      if (url.pathname === "/health") {
        return j({ ok: true, worker: "subtronics-api" }, { origin: allowOrigin });
      }

      // CORS preflight (shouldn’t happen with text/plain, but handle anyway)
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "access-control-allow-origin": allowOrigin,
            "access-control-allow-headers": "content-type",
            "access-control-allow-methods": "POST,OPTIONS",
          },
        });
      }

      if (url.pathname !== "/create" || request.method !== "POST") {
        return j({ error: "Use POST /create" }, { status: 404, origin: allowOrigin });
      }

      // --- Read body (supports both application/json and text/plain) ---
      const ct = (request.headers.get("content-type") || "").toLowerCase();
      let raw;
      try {
        raw = await request.text();
      } catch (e) {
        console.error("Body read failed:", e);
        return j({ error: "Body read failed" }, { status: 400, origin: allowOrigin });
      }

      let body;
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch (e) {
        console.error("Invalid JSON:", raw);
        return j({ error: "Invalid JSON" }, { status: 400, origin: allowOrigin });
      }

      const bundleSku = String(body.bundleSku || "").trim();
      const selections = body.selections || {};
      const qty = Number(body.qty || 1);
      if (!bundleSku) return j({ error: "bundleSku required" }, { status: 400, origin: allowOrigin });

      // --- Load builds.json (from your site) ---
      const buildsUrl = env.BUILDS_JSON_URL;
      if (!buildsUrl) return j({ error: "BUILDS_JSON_URL not set" }, { status: 500, origin: allowOrigin });

      const res = await fetch(buildsUrl, { cf: { cacheTtl: 60 } });
      if (!res.ok) {
        console.error("Failed to fetch builds.json:", res.status, buildsUrl);
        return j({ error: "builds.json not reachable", status: res.status }, { status: 502, origin: allowOrigin });
      }

      let data;
      try {
        data = await res.json();
      } catch (e) {
        console.error("builds.json parse error:", e);
        return j({ error: "builds.json parse error" }, { status: 502, origin: allowOrigin });
      }

      const build = (data.builds || []).find(b => String(b.sku) === bundleSku);
      if (!build) {
        console.error("Unknown bundle SKU:", bundleSku);
        return j({ error: "Unknown bundle SKU" }, { status: 400, origin: allowOrigin });
      }

      // --- Compute total (mirror of site) ---
      const round2 = (n) => Math.round(n * 100) / 100;
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
      const total = round2(cost * (1 + margin / 100));

      // --- Build Shopify Draft Order payload ---
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

      // --- Call Shopify ---
      const shop = env.SHOPIFY_STORE;
      const token = env.SHOPIFY_ADMIN_TOKEN;
      if (!shop || !token) {
        console.error("Missing SHOPIFY_STORE or SHOPIFY_ADMIN_TOKEN");
        return j({ error: "Shopify creds not set" }, { status: 500, origin: allowOrigin });
      }

      const api = `https://${shop}/admin/api/2024-10/draft_orders.json`;
      const shopifyResp = await fetch(api, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let out;
      try { out = await shopifyResp.json(); } catch { out = null; }

      if (!shopifyResp.ok) {
        console.error("Shopify error:", shopifyResp.status, out);
        return j({ error: "Shopify error", status: shopifyResp.status, details: out }, { status: 502, origin: allowOrigin });
      }

      const invoiceUrl = out?.draft_order?.invoice_url;
      const adminUrl   = out?.draft_order?.admin_graphql_api_id
        ? `https://${shop}/admin/draft_orders/${out.draft_order.id}`
        : null;

      if (!invoiceUrl) {
        console.warn("Draft created but no invoice_url. Returning adminUrl for manual send.");
        return j({ ok: true, adminUrl, note: "No invoice_url returned." }, { origin: allowOrigin });
      }

      return j({ ok: true, invoiceUrl }, { origin: allowOrigin });
    } catch (err) {
      console.error("Unhandled Worker error:", err);
      // Even on crash, send CORS
      return j({ error: "Internal error", detail: String(err) }, { status: 500, origin: request.headers.get("origin") || "*" });
    }
  },
};
