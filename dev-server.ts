// Skip TLS verification for dev (self-signed certs)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { watch, readdirSync } from "fs";
import { generateMockData } from "./mock-data";

const GATUS_URL = process.env.GATUS_URL || "http://localhost:8080";
const PORT = 5173;
const DEFAULT_THEME = "gatus";
const MOCK_MODE = process.env.MOCK === "true" || process.argv.includes("--mock");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
};

// Get available themes
const themes = readdirSync("themes", { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

// Track WebSocket clients for hot reload
const clients = new Set<any>();

// Hot reload script injected into HTML
const HOT_RELOAD_SCRIPT = `
<script>
(function() {
  const ws = new WebSocket('ws://' + location.host + '/__reload');
  ws.onmessage = () => location.reload();
  ws.onclose = () => setTimeout(() => location.reload(), 1000);
})();
</script>
</head>`;

const server = Bun.serve({
  port: PORT,
  async fetch(req, server) {
    const url = new URL(req.url);
    const path = url.pathname;
    const theme = url.searchParams.get("theme") || DEFAULT_THEME;

    // WebSocket upgrade for hot reload
    if (path === "/__reload") {
      if (server.upgrade(req)) return;
      return new Response("WebSocket upgrade failed", { status: 500 });
    }

    // API requests: mock mode or proxy to Gatus
    if (path.startsWith("/api/")) {
      // Mock mode: return generated data for the status endpoint
      if (MOCK_MODE && path === "/api/v1/endpoints/statuses") {
        const mockData = generateMockData();
        return new Response(JSON.stringify(mockData), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // Proxy to real Gatus
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

    // Resolve file path with theme support
    let filePath: string;
    if (path === "/") {
      filePath = `themes/${theme}/index.html`;
    } else if (path === "/styles.css") {
      filePath = `themes/${theme}/styles.css`;
    } else {
      // Other files from root (dist/, lib/, etc.)
      filePath = path.slice(1);
    }

    const file = Bun.file(filePath);
    if (await file.exists()) {
      const ext = filePath.substring(filePath.lastIndexOf("."));

      // Inject hot reload script and fix CSS path for themes
      if (ext === ".html") {
        let html = await file.text();
        html = html.replace("</head>", HOT_RELOAD_SCRIPT);
        // Rewrite CSS href to include theme parameter so subsequent request uses correct theme
        html = html.replace(
          'href="/styles.css"',
          `href="/styles.css?theme=${theme}"`
        );
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      }

      return new Response(file, {
        headers: { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
  websocket: {
    open(ws) {
      clients.add(ws);
    },
    close(ws) {
      clients.delete(ws);
    },
    message() {},
  },
});

// Watch for file changes in all theme directories
const watchPaths = ["dist", ...themes.map((t) => `themes/${t}`)];
for (const dir of watchPaths) {
  try {
    watch(dir, { recursive: false }, (event, filename) => {
      if (filename?.match(/\.(html|css|js)$/)) {
        console.log(`File changed: ${dir}/${filename}`);
        for (const client of clients) {
          client.send("reload");
        }
      }
    });
  } catch {}
}

console.log(`Dev server running at http://localhost:${PORT}`);
if (MOCK_MODE) {
  console.log("Mock mode enabled - serving generated test data");
} else {
  console.log(`Proxying /api/* to ${GATUS_URL}`);
}
console.log(`Available themes: ${themes.join(", ")}`);
console.log(`Usage: http://localhost:${PORT}?theme=<name>`);
console.log("Hot reload enabled");
