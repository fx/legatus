# Gatus Minimal Frontend

Minimal, fast frontend replacement for [Gatus](https://github.com/TwiN/gatus). Displays services as colored status squares with hover/tap details.

![Status Grid Example](https://via.placeholder.com/600x200?text=Status+Grid+Preview)

## Features

- **Minimal footprint**: HTMX + Mustache + plain CSS (~20KB)
- **No build step for HTML/CSS**: Just static files
- **All-in-one Docker image**: Gatus + Caddy + frontend in one container
- **Dark mode**: Automatic via `prefers-color-scheme`
- **Responsive grid**: Auto-fills available space
- **Native popovers**: Uses browser Popover API for details

## Quick Start

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/your-org/gatus-frontend.git
cd gatus-frontend

# Run with Docker
docker compose up --build

# Visit http://localhost
```

## Configuration

Create `config/config.yaml` for Gatus:

```yaml
endpoints:
  - name: Example
    url: https://example.com
    interval: 60s
    conditions:
      - "[STATUS] == 200"
```

See [Gatus documentation](https://github.com/TwiN/gatus#configuration) for full options.

## Development

```bash
# Install dependencies
bun install

# Create .env with your Gatus backend
echo "GATUS_URL=https://your-gatus-instance.com" > .env

# Start dev server
bun run dev

# Run tests
bun run test      # Unit tests
bun run test:e2e  # E2E tests
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| UI Framework | HTMX + Mustache |
| Styling | Plain CSS |
| Popovers | Native Popover API |
| Reverse Proxy | Caddy |
| Backend | Gatus (vendored) |
| Dev Tools | TypeScript, Vitest, Playwright, Biome |

## Docker Image

The Docker image is a multi-stage build that:
1. Compiles Gatus from vendored source (Go)
2. Builds TypeScript utilities (Bun)
3. Packages everything with Caddy Alpine

```bash
# Build
docker build -t gatus-ui .

# Run
docker run -p 80:80 -v ./config:/config:ro gatus-ui
```

## License

MIT
