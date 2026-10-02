# Sanity Architecture in ATLAS

## Two-Tier Knowledge Representation

### Layer A — Structured Content Lake

Rigorously typed JSON documents queried via GROQ. Schema types:

- **Entity** — a named thing (framework, feature, organization, database, API, protocol)
- **Claim** — a verifiable factual statement with subject, predicate, object, sources, and temporal validity
- **Source** — an authoritative document (release notes, git commit, RFC, changelog, documentation)
- **Relationship** — a directed edge between two entities with evidence and validity dates
- **Conflict** — two contradicting claims with resolution metadata
- **Version** — a specific release of a framework with features introduced/deprecated
- **Event** — a timestamped occurrence linking entities, claims, and sources

### Layer B — Knowledge Base

Sourced markdown documents:

- Release notes
- Architecture specifications
- Changelogs
- Technical RFCs
- Security advisories

Each document preserves: title, author, publisher, publication date, source URL, extracted claims, and referenced entities.

## GROQ Queries

ATLAS queries Layer A using GROQ. Examples:

```groq
*[_type == "claim" && subject._ref == "ent_feature_x"]

*[_type == "relationship" && sourceEntity._ref == "ent_feature_x"]

*[_type == "conflict"]
```

## Sanity Context MCP

The `SANITY_CONTEXT_URL` points to the Sanity Context MCP endpoint. This provides:

- Schema discovery
- Structured GROQ execution
- Knowledge Base chunk retrieval
- Relationship resolution

## Local Corpus vs Live Sanity

| Mode | Triggered by | Behaviour |
|------|-------------|-----------|
| `local-corpus` | No `SANITY_PROJECT_ID` / `SANITY_API_TOKEN` | Uses `backend/services/sanity/corpus.ts` |
| `live` | Both env vars set | Queries Sanity HTTP API, falls back to corpus on error |

The corpus mirrors the Sanity schema exactly and can be seeded from a real Sanity export.
