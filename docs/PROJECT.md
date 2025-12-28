# Gatus Minimal Frontend

Minimal, fast frontend replacement for Gatus — services displayed as status squares with hover/tap details. Ships as a single Docker image with Gatus included.

## Tech Stack

- **HTMX**: Declarative AJAX with 30s auto-refresh polling
- **Mustache**: Client-side templating via htmx-ext-client-side-templates
- **Popover API**: Native browser popovers for status details
- **Plain CSS**: Grid layout, status colors, dark mode
- **TypeScript**: Utility functions (formatDuration, preprocessEndpoint)
- **Caddy**: Static file serving + reverse proxy
- **Gatus**: Vendored submodule, built into Docker image

## Tasks

(No active tasks)

## Completed

- [x] Feature: Multi-theme support with light/dark/system modes (PR #11)
  - [x] CSS custom properties and theme definitions (github, gatus, tui)
  - [x] Theme switcher UI with FOUC prevention
  - [x] ThemeController for preference management with localStorage persistence
  - [x] Unit and E2E tests for theme functionality
- [x] Feature: All-in-one Docker image (PR #10)
  - [x] Multi-stage Dockerfile with vendored Gatus
  - [x] Entrypoint script running Gatus + Caddy
  - [x] Simplified docker-compose.yaml
- [x] Feature: HTMX pivot (PR #10)
  - [x] Replace Preact with HTMX + Mustache
  - [x] Plain CSS with dark mode
  - [x] Native Popover API
  - [x] TypeScript utilities with Vitest tests
  - [x] Playwright E2E tests
  - [x] Biome linting
- [x] Feature: Docker image (PR #9)
- [x] Feature: Unit test coverage (PRs #5, #7, #8)
- [x] Feature: Status grid v1 (PRs #3-6)
- [x] Feature: Gatus integration (PR #2)
- [x] Feature: Project scaffolding (PR #1)

## References

- [Gatus Repository](https://github.com/TwiN/gatus)
- [Gatus API](https://github.com/TwiN/gatus#api)
- [HTMX](https://htmx.org/)
- [Mustache.js](https://github.com/janl/mustache.js)
