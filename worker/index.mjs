// worker/index.mjs

const json = (obj, status = 200, origin = "*") =>
  new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": origin,
      "access-control-allow-headers": "content-type",
      "access-control-allow-methods": "POST,OPTIONS",
    },
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("origin") || env.CORS_ORIGIN || "*";

    // Quiet the favicon 404 in your console
    if (url.pathname === "/favicon.ico") {
      return new Response(null, {
        status: 204,
        headers: { "access-control-allow-origin": origin, "content-type": "image/x-icon" },
      });
    }

    if (url.pathname === "/health") {
      return json({ ok: true, worker: env.WORKER_NAME || "subtronics-api" }, 200, origin);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": origin,
          "access-control-allow-headers": "content-type",
          "access-control-allow-methods": "POST,OPTIONS",
        },
      });
    }

    if (url.pathname !== "/create" || request.method !== "POST") {
      return json({ error: "Use POST /create" }, 404, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, origin);
    }

    const bundleSku = String(body.bundleSku || "").trim();
    if (!bundleSku) return json({ error: "bundleSku required" }, 400, origin);
    const selections = body.selections || {};
    const qty = Number(body.qty || 1);

    // ---- Load builds.json
    const buildsRes = await fetch(env.BUILDS_JSON_URL, { cf: { cacheTtl: 60 } });
    if (!buildsRes.ok) return json({ error: "builds.json not reachable" }, 502, origin);
    const data = await buildsRes.json();

    const build = (data.builds || []).find((b) => String(b.sku) === bundleSku);
    if (!build) return json({ error: "Unknown bundle SKU" }, 400, origin);

    // ---- Price calc (mirror of frontend)
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
    const ramInc = Math.max(0, (s.ram_gb - build.ram_base_gb) / 32);
    cost += ramInc * (data.price_tables?.ram_per_32gb_increment || 0);
    const gpu = (data.price_tables?.gpu_tiers || []).find((g) => g.tier === s.gpu_tier);
    if (gpu) cost += Number(gpu.cost || 0);
    const hddRow = (data.price_tables?.hdd || []).find((h) => Number(h.capacity_tb) === s.hdd_capacity_tb);
    if (hddRow) cost += Number(hddRow.cost || 0) * s.hdd_count;
    const nvRow = (data.price_tables?.nvme || []).find((n) => Number(n.capacity_tb) === s.nvme_capacity_tb);
    if (nvRow) cost += Number(nvRow.cost || 0) * s.nvme_slots_used;
    if (s.cooling === "AIO240") cost += 95;
    if (s.cooling === "AIO360_LCD") cost += 290;
    if (s.rgb === "RGB") cost += 45;

    const margin = Number(data.global?.profit_margin_percent || 0);
    const total = money(cost * (1 + margin / 100));

    // ---- Create Draft Order
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

    const payload = {
      draft_order: {
        line_items: [lineItem],
        use_customer_default_address: true,
      },
    };

    const adminBase = `https://${env.SHOPIFY_STORE}/admin/api/2024-10`;
    const createResp = await fetch(`${adminBase}/draft_orders.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": env.SHOPIFY_ADMIN_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const createJson = await createResp.json();
    if (!createResp.ok) {
      console.log("Shopify create error", createResp.status, createJson);
      return json({ error: "Shopify error", status: createResp.status, details: createJson }, 502, origin);
    }

    let id = createJson?.draft_order?.id;
    let invoiceUrl = createJson?.draft_order?.invoice_url;

    // Retry once if invoice_url hasn't populated yet
    if (!invoiceUrl && id) {
      await new Promise((r) => setTimeout(r, 350));
      const getResp = await fetch(`${adminBase}/draft_orders/${id}.json`, {
        headers: { "X-Shopify-Access-Token": env.SHOPIFY_ADMIN_TOKEN },
      });
      const getJson = await getResp.json();
      if (getResp.ok) {
        invoiceUrl = getJson?.draft_order?.invoice_url || null;
      } else {
        console.log("Shopify get error", getResp.status, getJson);
      }
    }

    if (invoiceUrl) {
      return json({ ok: true, invoiceUrl }, 200, origin);
    }

    // Final fallback: at least return the admin link so you can send the invoice manually
    if (id) {
      const adminUrl = `https://${env.SHOPIFY_STORE}/admin/draft_orders/${id}`;
      console.log("No invoice_url yet; returning adminUrl", adminUrl);
      return json({ ok: true, adminUrl, note: "Invoice link not ready yet; open adminUrl to send invoice." }, 200, origin);
    }

    console.log("Create response missing id/invoice_url", createJson);
    return json({ error: "Draft created but no invoice URL returned" }, 502, origin);
  },
};
