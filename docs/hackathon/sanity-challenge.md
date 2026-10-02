# Sanity Challenge — Submission Notes

## Path One: Agent That Queries Real Content via Sanity Context MCP

### Submission Checklist

- [x] **Autonomous agent** — LangGraph state machine (`backend/agent/langgraph.ts`)
- [x] **Sanity Context MCP** — MCP client layer in `backend/services/sanity/client.ts`
- [x] **Meaningful structured content** — Layer A: Entity, Claim, Source, Relationship, Conflict, Version, Event
- [x] **Sourced Knowledge Base** — Layer B: release notes, RFCs, changelogs with real publisher/author/date metadata
- [x] **Usable interactive system** — React frontend with real-time SSE, evidence graph, audit matrix, certificate verifier
- [x] **Project ID & Dataset URL** — configurable via env vars, displayed in Sanity Explorer tab

### How Sanity Powers ATLAS

Sanity is the knowledge store, not a peripheral integration:

1. The agent **cannot answer** a question without retrieving from Sanity
2. **Contradiction detection** compares pairs of Sanity claims by subject/predicate/object and source authority
3. The **evidence graph** is constructed from Sanity entity and relationship records
4. The **Merkle certificate** commits the Sanity-retrieved claims, sources, and relationships
5. **Audit probes** verify grounding against Sanity content — a failed Sanity retrieval produces `INSUFFICIENT_EVIDENCE`

### Live Configuration

To run against a live Sanity Content Lake:

```env
SANITY_PROJECT_ID=<your-project-id>
SANITY_DATASET=production
SANITY_API_TOKEN=<read-token>
```

The Sanity schema used by ATLAS is documented in `docs/sanity/sanity-architecture.md`.

### Demo Question

> Was Feature X available in Framework 4.2?

This question exercises:
- Entity resolution (Feature X, Framework 4.2.0, Aether Framework)
- Multi-hop relationship traversal
- Temporal conflict between an outdated roadmap draft and the official release notes
- Contradiction engine resolution with source authority scoring
- Full 10-probe adversarial audit
- HMAC-SHA256 Merkle certificate generation
