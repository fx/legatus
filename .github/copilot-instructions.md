# GitHub Copilot Instructions

## PR Review Checklist (CRITICAL)
<!-- KEEP THIS SECTION UNDER 4000 CHARS - Copilot only reads first ~4000 -->

### Architecture

- **Static files only**: This is an HTMX + Mustache app with no build step. Do not suggest React/Preact/Vue patterns.
- **Relative API paths**: Frontend uses relative `/api/*` paths. Caddy handles routing to Gatus. This is intentional.

### Docker Configuration

- **PORT default of 80**: The docker-compose PORT default is intentionally 80 (standard HTTP). Users override via env var for local testing.

### Code Style

- **Minimal comments**: Do not suggest adding explanatory comments for self-documenting code.
- **Semver ranges are intentional**: Using `^x.y.z` in package.json is intentional. Do not suggest pinning to exact versions.
- **ASCII microsecond notation**: Use `us` (ASCII) not `µs` (Greek mu) for microseconds. Intentional for ASCII compatibility.

### Development Server

- **dev-server.ts is dev-only**: TLS verification skip and other dev conveniences are intentional. Do not flag security concerns for dev-only files.
