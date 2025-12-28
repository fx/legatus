# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Minimal frontend replacement for [Gatus](https://github.com/TwiN/gatus) — a service health monitoring tool. Displays services as status squares with hover/tap details.

## Tech Stack

- **HTMX**: Declarative AJAX and DOM updates
- **Mustache**: Client-side templating via htmx-ext-client-side-templates
- **Popover API**: Native browser API for status detail popovers
- **Plain CSS**: No build step, dark mode via prefers-color-scheme
- **Caddy**: Static file serving + reverse proxy to Gatus API

## Architecture

**Static files only**: No build step required. The entire frontend is:
- `index.html` - HTMX app with Mustache template and inline JS for data preprocessing
- `styles.css` - Plain CSS with grid layout, status colors, dark mode

**Gatus API integration**:
- Caddy reverse proxies `/api/*` to Gatus backend (configured via `GATUS_URL` env var)
- Frontend fetches from `/api/v1/endpoints/statuses` with 30s auto-refresh
- Response preprocessed client-side before Mustache rendering

**CDN dependencies** (loaded from unpkg.com):
- htmx.org@2.0.4
- mustache@4.2.0
- htmx-ext-client-side-templates@2.0.1

## Development

Open `index.html` in a browser with a running Gatus instance, or use Docker:

```bash
docker compose up
```

## Key Files

- `index.html` - Main app with HTMX, Mustache template, and preprocessing logic
- `styles.css` - All styles including grid, colors, popovers, dark mode
- `Caddyfile` - Caddy configuration for static serving and API proxy
- `Dockerfile` - Simple static file copy to Caddy

## Environment Variables

**Never commit sensitive information** including API keys, hostnames (even public ones), tokens, or credentials.

- `GATUS_URL` - Gatus backend URL (default: `gatus:8080` in Docker)
