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

- [ ] Feature: Project scaffolding
  - [ ] Initialize Vite + Preact project
  - [ ] Configure preact/compat aliases
  - [ ] Set up TanStack Query
  - [ ] Configure UnoCSS
  - [ ] Add TypeScript config
- [ ] Feature: Gatus integration
  - [ ] Add Gatus as git submodule
  - [ ] Configure Vite dev proxy for /api/* (CORS workaround)
  - [ ] Add configurable API base URL for production
  - [ ] Test API connectivity against running Gatus instance
- [ ] Feature: Status grid (v1)
  - [ ] Create API types from Gatus endpoints
  - [ ] Implement status fetching hook
  - [ ] Build status square component
    - [ ] Color-coded status indicator
    - [ ] Hover/tap to show details popover
  - [ ] Create grid layout for all services
  - [ ] Add auto-refresh polling
- [ ] Feature: Docker image
  - [ ] Create Dockerfile (Gatus + Caddy + frontend)
  - [ ] Write Caddyfile (static files + /api/* proxy to Gatus)
  - [ ] Add docker-compose for local testing

## Completed

## References

- [Gatus Repository](https://github.com/TwiN/gatus)
- [Gatus API](https://github.com/TwiN/gatus#api)
- [fancy-gatus (alternate frontend)](https://github.com/BluemediaDev/fancy-gatus)
