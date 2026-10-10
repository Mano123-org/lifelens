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

## Cloudflare deployment
In the Cloudflare Pages build settings, use:

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`
- **Root directory:** `/`

The build creates `apps/web/dist`, which is the directory configured in `wrangler.jsonc`.
Do not use `npx wrangler deploy` as the only command, because Wrangler cannot deploy the
static assets until the Vite build has run.

### Worker and D1 setup
This repository now includes a Cloudflare Worker API and a D1 migration for tasks, manual
usage records, and income/expense transactions. Before the first Worker deployment:

```powershell
npx wrangler d1 create lifelens
```

Copy the returned database ID into `wrangler.jsonc` in place of
`REPLACE_WITH_D1_DATABASE_ID`, then apply the schema:

```powershell
npx wrangler d1 migrations apply lifelens --remote
npm run deploy
```

The dashboard uses real D1 records when available. It does not collect device activity
automatically, connect to banks, or expose an AI provider until those separately authorized
integrations are configured. Authentication and per-user isolation are still required before
handling multiple users or sensitive production data.

## Planned layout
apps/web, apps/mobile (Flutter), apps/desktop-agent, services/api, services/analytics, packages/shared-types, database, docs.
