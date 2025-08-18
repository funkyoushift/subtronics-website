export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // simple health endpoint
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true, worker: "subtronics" }), {
        headers: { "content-type": "application/json" },
      });
    }

    // placeholder root response
    return new Response("Subtronics Worker is running.\nUse /health to test.", {
      headers: { "content-type": "text/plain" },
    });
  },
};
