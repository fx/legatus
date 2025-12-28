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
      const target = `${GATUS_URL}${path}${url.search}`;
      const res = await fetch(target, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });
      return new Response(res.body, {
        status: res.status,
        headers: res.headers,
      });
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
