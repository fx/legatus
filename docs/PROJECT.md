# Gatus Minimal Frontend

Minimal, fast frontend replacement for Gatus — services displayed as status squares with hover/tap details.

## Tech Stack

- **Framework**: Preact + preact/compat (~5KB)
- **Data Fetching**: TanStack Query via compat (~12KB)
- **Routing**: Wouter (~2KB)
- **Build**: Vite + @preact/preset-vite
- **Styling**: UnoCSS with Wind preset
- **Server**: Caddy (static files + reverse proxy)
- **TypeScript**: Yes

## Tasks

- [ ] Feature: Status grid (v1)
  - [x] Create API types from Gatus endpoints (PR #3)
  - [x] Implement status fetching hook (PR #4)
  - [x] Build status square component (PR #5)
    - [x] Color-coded status indicator
    - [x] Hover/tap to show details popover
  - [x] Create grid layout for all services (PR #5)
  - [x] Add auto-refresh polling (PR #6)
- [ ] Feature: Unit test coverage
  - [x] Set up Vitest (PR #5)
  - [x] Add tests for format utility functions (PR #5)
  - [x] Add tests for API utility functions (PR #7)
  - [x] Add tests for status components (PR #8)
- [x] Feature: Docker image (PR #9)
  - [x] Create Dockerfile (Gatus + Caddy + frontend)
  - [x] Write Caddyfile (static files + /api/* proxy to Gatus)
  - [x] Add docker-compose for local testing

## Completed

- [x] Feature: Gatus integration (PR #2)
  - [x] Add Gatus as git submodule
  - [x] Configure Vite dev proxy for /api/* (CORS workaround)
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
