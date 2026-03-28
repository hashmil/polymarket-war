# Polymarket Iran War Tracker

## Overview
Static site showing live Polymarket prediction market odds on the Iran conflict. Built with Vite + React + Tailwind CSS v4. Data fetched via Bun script, AI analysis generated via `claude -p` CLI.

## Tech Stack
- **Runtime**: Bun (not Node.js)
- **Build**: Vite + React 19 + Tailwind CSS v4
- **Charts**: Recharts (lazy-loaded in dashboard)
- **Data**: Polymarket Gamma API (`https://gamma-api.polymarket.com`)
- **AI Analysis**: Claude Code CLI (`claude -p`)
- **Deploy**: Cloudflare Pages (static, build command: `bun run build`, output: `dist/`)

## Commands
```sh
bun run dev        # Dev server (port 3000 for dev.4hm.uk reverse proxy)
bun run build      # Production build → dist/
bun run fetch      # Fetch latest Polymarket odds → data/latest.json
bun run analyze    # Generate AI analysis via claude CLI → data/analysis.json
bun run update     # fetch + analyze + git commit + push
```

## Architecture
- `scripts/fetch.ts` — Fetches Polymarket Gamma API, saves to `data/latest.json` + `data/snapshots/`
- `scripts/analyze.ts` — Runs `claude -p` with market data to generate analysis
- `src/views/ReportView.tsx` — Shareable report (420px, mobile-first, WhatsApp-friendly)
- `src/views/DashboardView.tsx` — Full dashboard with charts, tables, history (lazy-loaded)
- `src/data/loader.ts` — Imports JSON data at build time via `import.meta.glob`
- `src/data/helpers.ts` — `yesPct()` extracts "Yes" probability from market data

## Key Data Details
- Polymarket `outcomePrices` is a JSON string that needs `JSON.parse()`
- Outcomes order is `["Yes", "No"]` — index 0 is the "Yes" price
- Resolved markets (prices `[0,1]` or `[1,0]`) are filtered out
- Event slugs: `us-x-iran-ceasefire-by`, `military-action-against-iran-ends-on`, `iran-x-israelus-conflict-ends-by`

## Routing
- `/` — Report view (shareable)
- `/dashboard` — Dashboard view
- SPA routing via `public/_redirects` for Cloudflare Pages

## GitHub
- Repo: hashmil/polymarket-war (public)
- Cloudflare Pages connected
