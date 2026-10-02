# Sanity Context MCP Integration

## What is Sanity Context MCP?

Sanity Context MCP is a Model Context Protocol server that exposes Sanity Content Lake capabilities directly to autonomous AI agents. It provides:

- **Schema discovery** — agent can understand available content types
- **Structured GROQ queries** — query Layer A documents with full type safety
- **Knowledge Base retrieval** — semantic search over Layer B documents
- **Relationship traversal** — graph navigation across entity references
- **Origin tracing** — every retrieved document preserves source provenance

## ATLAS Integration Architecture

```
ATLAS Investigation Agent
        ↓
SanityClient.queryStructuredContent(groq)
        ↓
  [if live credentials]          [if no credentials]
        ↓                                ↓
Sanity HTTP API                  SanityCorpusEngine
(live Content Lake)              (local corpus)
        ↓                                ↓
          Layer A + Layer B Results
```

## Endpoint

```
SANITY_CONTEXT_URL=https://mcp.sanity.io/v1/context
```

## Configuration

Set in `.env`:
```
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=your-read-token
```

## Live vs Local Corpus

| Mode | `SANITY_PROJECT_ID` set | `SANITY_API_TOKEN` set | Behaviour |
|------|------------------------|------------------------|-----------|
| `live` | yes | yes | Queries real Sanity Content Lake |
| `local-corpus` | no | no | Uses `corpus.ts` in-memory dataset |
| `local-corpus` | yes | no | Falls back to corpus, warns in console |

The system status endpoint always reports the current mode transparently.

## Adding Content to Sanity

Use the import scripts in `scripts/` or the Sanity Studio schemas in `sanity-studio/schemaTypes/` with a configured Sanity Studio instance.
