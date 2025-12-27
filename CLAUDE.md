# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Minimal frontend replacement for [Gatus](https://github.com/TwiN/gatus) — a service health monitoring tool. Displays services as status squares with hover/tap details.

## Commands

```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # Type-check and build for production
npm run preview  # Preview production build
```

## Environment Variables

**Never commit sensitive information** including API keys, hostnames (even public ones), tokens, or credentials. Use `.env` files locally (already in `.gitignore`) and `.env.example` for documenting required variables without values.

## Architecture

**Preact + React compatibility**: Uses `preact/compat` aliases so React libraries (TanStack Query) work with Preact's smaller bundle. The aliases are configured in both `vite.config.ts` and `tsconfig.json`.

**Gatus API integration**:
- Development: Vite proxies `/api/*` to `GATUS_URL` env var (default: `localhost:8080`)
- Production: Caddy reverse proxy handles `/api/*` routing to Gatus
- Frontend always uses relative `/api/*` paths; proxy layer handles routing

**Styling**: UnoCSS with Wind3 preset (Tailwind-compatible). In `vite.config.ts`, UnoCSS plugin must come BEFORE preact preset.

## Key Files

- `src/lib/query-client.ts` - TanStack Query client with default options
- `src/lib/api.ts` - API base URL utility for Gatus endpoints
- `uno.config.ts` - UnoCSS configuration

## Preact Conventions

- Use `class` not `className` in JSX (Preact uses native HTML attribute)
- JSX configured with `jsxImportSource: "preact"` in tsconfig

## Path Aliases

`@/` maps to `src/` (e.g., `import { queryClient } from '@/lib/query-client'`)
