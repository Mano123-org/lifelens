# LifeLens — Your Life. In Sight.
Track. Analyze. Improve.

## Status
- Phase 1 (in progress): web shell in `apps/web` with sidebar navigation, light/dark theme, and a dashboard that reads from a data object.
  The dashboard shows an empty state until you click **Load demo data** (clearly labelled as sample data).
- Other screens are placeholders that name the phase that builds them.
- Phases 2-7 (API, database, finance/routines, analytics, AI, tracking, tests/deploy) are not built yet.

## Run on Windows (PowerShell)
1. Install Node.js LTS from https://nodejs.org
2. Then:
```
cd lifelens\apps\web
npm install
npm run dev
```
Open the printed address (usually http://localhost:5173).

## Production build check
```
npm run build
```

## Planned layout
apps/web, apps/mobile (Flutter), apps/desktop-agent, services/api, services/analytics, packages/shared-types, database, docs.
