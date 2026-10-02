# Deployment Guide

## Development

```bash
npm install
cp .env.example .env
# fill in .env
npm run dev
```

Opens at `http://localhost:3000`. Vite serves the frontend with HMR; Express handles API routes.

## Production Build

```bash
npm run build          # compiles frontend to dist/
NODE_ENV=production npm start   # serves dist/ as static files
```

## Environment Variables (required for full functionality)

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | LLM answer synthesis |
| `SANITY_PROJECT_ID` | Live Sanity queries |
| `SANITY_DATASET` | Sanity dataset (default: production) |
| `SANITY_API_TOKEN` | Sanity read token |
| `CERTIFICATE_HMAC_SECRET` | Certificate signing (generate with `openssl rand -hex 32`) |
| `PORT` | Server port (default: 3000) |

## Running Without Full Config

ATLAS runs without any credentials:
- No `GEMINI_API_KEY` → structured evidence summary instead of LLM synthesis
- No Sanity credentials → local corpus mode (same schema, local data)
- No `CERTIFICATE_HMAC_SECRET` → certificates generated but not cryptographically secured

All degraded states are reported at `/api/system/status`.

## Populating the Knowledge Base

```bash
# Set editor token in .env temporarily
node scripts/import-to-sanity.mjs     # imports base corpus
node scripts/import-domains.mjs       # imports AI/Space/India domains
# Restore read token in .env
```

## TypeScript Check

```bash
npm run typecheck
```

## Health Endpoints

```
GET /api/health           → { status: "ok", uptime: X }
GET /api/system/status    → full system status JSON
```
