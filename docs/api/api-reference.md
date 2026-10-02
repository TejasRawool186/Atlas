# ATLAS API Reference

Base path: `/api`

## Investigations

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/investigations` | List all investigations (summary) |
| `POST` | `/investigations` | Create a new investigation |
| `POST` | `/investigations/:id/run` | Trigger investigation workflow |
| `GET` | `/investigations/:id` | Get investigation detail |
| `GET` | `/investigations/:id/evidence` | Get evidence graph |
| `GET` | `/investigations/:id/audit` | Get audit report |
| `GET` | `/investigations/:id/events` | SSE event stream |

### POST /investigations

Body: `{ "question": "string" }`

Returns: `{ "id": "INV-2026-XXXXX", "status": "created" }`

## Certificates

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/certificates/:id` | Get certificate |
| `POST` | `/certificates/:id/verify` | Verify certificate integrity |

### POST /certificates/:id/verify

Body: `{}` for normal verification, or `{ "tamperedEvidence": { "claims": [...] } }` to test tamper detection.

## Sanity

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/sanity/config` | Connection metadata |
| `GET` | `/sanity/status` | Connection status |
| `GET` | `/sanity/schema` | Layer A schema definitions |
| `GET` | `/sanity/knowledge` | Layer B knowledge documents |
| `GET` | `/sanity/entities` | All entities |
| `GET` | `/sanity/claims` | All claims |
| `GET` | `/sanity/sources` | All sources |
| `POST` | `/sanity/query` | Execute GROQ query |

### POST /sanity/query

Body: `{ "groq": "*[_type == 'claim']" }`

## System

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/system/status` | Full system status |
