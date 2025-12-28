# Gatus Minimal Frontend

Minimal, fast frontend replacement for Gatus — services displayed as status squares with hover/tap details.

## Tech Stack

- **HTMX**: Declarative AJAX with 30s auto-refresh polling
- **Mustache**: Client-side templating via htmx-ext-client-side-templates
- **Popover API**: Native browser popovers for status details
- **Plain CSS**: Grid layout, status colors, dark mode (no build step)
- **Caddy**: Static file serving + reverse proxy to Gatus API

## Tasks

(No active tasks - HTMX pivot complete)

## Completed

- [x] Feature: HTMX pivot (PR #10)
  - [x] Rewrite frontend from Preact to HTMX + Mustache
  - [x] Plain CSS with grid layout and dark mode
  - [x] Native Popover API for status details
  - [x] Simplify Dockerfile to static file copy
  - [x] Update Caddyfile CSP for unpkg.com CDN
  - [x] Remove all build tooling (Vite, TypeScript, UnoCSS)
- [x] Feature: Docker image (PR #9)
  - [x] Create Dockerfile (Caddy + frontend)
  - [x] Write Caddyfile (static files + /api/* proxy to Gatus)
  - [x] Add docker-compose for local testing
- [x] Feature: Unit test coverage (PRs #5, #7, #8)
  - [x] Set up Vitest
  - [x] Add tests for format utility functions
  - [x] Add tests for API utility functions
  - [x] Add tests for status components
- [x] Feature: Status grid v1 (PRs #3-6)
  - [x] Create API types from Gatus endpoints
  - [x] Implement status fetching hook
  - [x] Build status square component
  - [x] Create grid layout for all services
  - [x] Add auto-refresh polling
- [x] Feature: Gatus integration (PR #2)
  - [x] Add Gatus as git submodule
  - [x] Configure Vite dev proxy for /api/*
  - [x] Add configurable API base URL for production
  - [x] Test API connectivity against running Gatus instance
- [x] Feature: Project scaffolding (PR #1)
  - [x] Initialize Vite + Preact project
  - [x] Configure preact/compat aliases
  - [x] Set up TanStack Query
  - [x] Configure UnoCSS
  - [x] Add TypeScript config

## References

- [Gatus Repository](https://github.com/TwiN/gatus)
- [Gatus API](https://github.com/TwiN/gatus#api)
- [fancy-gatus (alternate frontend)](https://github.com/BluemediaDev/fancy-gatus)
- [HTMX](https://htmx.org/)
- [Mustache.js](https://github.com/janl/mustache.js)
