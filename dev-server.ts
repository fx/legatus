// Skip TLS verification for dev (self-signed certs)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const GATUS_URL = process.env.GATUS_URL || "http://localhost:8080";
const PORT = 5173;

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
};

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Proxy API requests to Gatus
    if (path.startsWith("/api/")) {
      const target = new URL(`${path}${url.search}`, GATUS_URL);
      const headers = new Headers(req.headers);
      headers.set("Host", target.host);
      headers.delete("Accept-Encoding"); // Avoid compression issues
      try {
        const res = await fetch(target.href, {
          method: req.method,
          headers,
          body: req.body,
        });
        // Copy response headers but remove problematic ones
        const respHeaders = new Headers(res.headers);
        respHeaders.delete("Content-Encoding");
        respHeaders.delete("Content-Length");
        return new Response(res.body, {
          status: res.status,
          headers: respHeaders,
        });
      } catch (e) {
        console.error(`Proxy error: ${e}`);
        return new Response("Proxy error", { status: 502 });
      }
    }

    // Serve static files
    const filePath = path === "/" ? "index.html" : path.slice(1);
    const file = Bun.file(filePath);
    if (await file.exists()) {
      const ext = filePath.substring(filePath.lastIndexOf("."));
      return new Response(file, {
        headers: { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Dev server running at http://localhost:${PORT}`);
console.log(`Proxying /api/* to ${GATUS_URL}`);
