# Environment Configuration

Copy `.env.example` to `.env` and fill in values. Never commit `.env`.

## Required for Full Functionality

### LLM

```
GEMINI_API_KEY=<your-gemini-api-key>
```

Without this, answer synthesis falls back to a structured evidence summary (no LLM, no hallucination risk).

### Sanity (Live Mode)

```
SANITY_PROJECT_ID=<your-project-id>
SANITY_DATASET=production
SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=<read-token>
```

Without these, ATLAS runs against the local corpus (same schema, no live queries).

### Certificates

```
CERTIFICATE_HMAC_SECRET=<random-32-byte-hex>
```

Generate with: `openssl rand -hex 32`

Without this, certificates are generated but the HMAC signature is not cryptographically secured.

## Optional

```
GROQ_API_KEY=<groq-key>   # Alternative LLM provider (not yet wired in)
PORT=3000
APP_URL=http://localhost:3000
```

## Checking Configuration

Visit `/api/system/status` to see the current status of all integrations:

```json
{
  "api": "online",
  "sanity": "local-corpus",
  "llm": "unavailable — configure GEMINI_API_KEY",
  "certificate": "degraded — CERTIFICATE_HMAC_SECRET not configured"
}
```
