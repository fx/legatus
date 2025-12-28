# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Minimal frontend replacement for [Gatus](https://github.com/TwiN/gatus) — a service health monitoring tool. Displays services as status squares with hover/tap details. Ships as a single Docker image containing Gatus + Caddy + frontend.

## Tech Stack

- **HTMX**: Declarative AJAX and DOM updates (30s auto-refresh)
- **Mustache**: Client-side templating via htmx-ext-client-side-templates
- **Popover API**: Native browser API for status detail popovers
- **Plain CSS**: Dark mode via prefers-color-scheme (no CSS build)
- **TypeScript**: Utility functions compiled to JS (`src/app.ts` → `dist/app.js`)
- **Caddy**: Static file serving + reverse proxy to Gatus
- **Gatus**: Vendored as submodule, built into Docker image

## Commands

```bash
bun run dev      # Start dev server with API proxy (requires GATUS_URL in .env)
bun run build    # Compile TypeScript to dist/app.js
bun run test     # Run Vitest unit tests
bun run test:e2e # Run Playwright E2E tests
bun run lint     # Run Biome linter
```

## Architecture

**All-in-one Docker image**: Single container runs both Gatus and Caddy.

```
┌────────────────────────────────────┐
│         Docker Container           │
│  Caddy (:80) ──▶ Gatus (:8080)    │
│  /api/* proxy    /srv/* static    │
└────────────────────────────────────┘
```

**Frontend files**:
- `index.html` - HTMX app with Mustache template
- `styles.css` - Plain CSS (grid, colors, dark mode)
- `dist/app.js` - Compiled TypeScript utilities

**Gatus API**: Frontend fetches `/api/v1/endpoints/statuses` with 30s polling.

## Key Files

- `index.html`, `styles.css` - Frontend static files
- `src/app.ts` - TypeScript utilities (formatDuration, preprocessEndpoint)
- `Dockerfile` - Multi-stage build (Gatus + frontend + Caddy)
- `docker-entrypoint.sh` - Starts both Gatus and Caddy
- `Caddyfile` - Static serving + API proxy config
- `vendor/gatus` - Gatus submodule (pinned version)
- `config/config.yaml` - Gatus configuration

## Environment Variables

**Never commit sensitive information** including API keys, hostnames, tokens, or credentials.

- `GATUS_URL` - For dev server proxy (e.g., `https://status.example.com`)
- `PORT` - Host port for Docker (default: 80)
