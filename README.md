<div align="center">

# ATLAS

**Audit factual claims against structured knowledge with cryptographic verification.**

ATLAS is an epistemic integrity auditor that validates factual assertions against relational schemas in Sanity, evaluates contradictions across sources, and seals the evidence into tamper-evident Merkle certificates.

[![Node](https://img.shields.io/badge/node-v24.11.0-blue?style=flat-square)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-v7.0.2-blue?style=flat-square)](https://www.typescriptlang.org)
[![Tests](https://img.shields.io/badge/tests-9%20passed-brightgreen?style=flat-square)](#testing)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#license)
[![Sanity](https://img.shields.io/badge/sanity-content%20lake-red?style=flat-square)](https://www.sanity.io)

[Overview](#overview) • [How it works](#how-it-works) • [Tech stack](#tech-stack) • [Getting started](#getting-started) • [Testing](#testing)

</div>

---

## What It Does

A user submits a question. ATLAS:

1. **Plans** — extracts entities and temporal constraints
2. **Retrieves** — queries structured Sanity content (Layer A) and sourced knowledge documents (Layer B) via Sanity Context MCP
3. **Resolves contradictions** — detects and resolves conflicting claims using source authority and temporal precedence
4. **Builds an evidence graph** — topological graph of entities, claims, sources, relationships, and conflicts
5. **Synthesizes an answer** — LLM-grounded response with source citations (or structured evidence summary when LLM is unavailable)
6. **Audits** — runs the Lethe 10-probe adversarial protocol (grounding, contradiction, temporal consistency, source removal, inference detection, and more)
7. **Certifies** — generates an HMAC-SHA256 Merkle certificate that cryptographically commits the evidence set

## Architecture

```
User Question
  ↓
ATLAS LangGraph Agent
  ├─ Question Analyzer
  ├─ Entity Resolver
  ├─ Sanity Context Retrieval ──→ Sanity Content Lake (Layer A)
  │                            └→ Sanity Knowledge Base (Layer B)
  ├─ Contradiction Engine
  ├─ Evidence Aggregator
  ├─ Answer Generator (Gemini / structured fallback)
  ├─ Adversarial Auditor (10 Lethe Probes)
  └─ Certificate Engine (HMAC-SHA256 Merkle)
```

See [`docs/architecture/system-architecture.md`](docs/architecture/system-architecture.md) for detail.

## Sanity Integration

ATLAS uses Sanity as the primary knowledge store:

| Layer | Description |
|-------|-------------|
| **Layer A** | Structured Content Lake — Entity, Claim, Source, Relationship, Conflict, Version, Event documents queried via GROQ |
| **Layer B** | Knowledge Base — sourced markdown documents (release notes, RFCs, changelogs) |

The agent connects via the **Sanity Context MCP** endpoint. When `SANITY_PROJECT_ID` and `SANITY_API_TOKEN` are set, all queries hit the live Sanity Content Lake. Without credentials, ATLAS operates against a local corpus that mirrors the Sanity schema.

## Setup

### Prerequisites

- Node.js 20+
- A Sanity project (for live mode) — create one at [sanity.io/manage](https://www.sanity.io/manage)
- A Gemini API key (for LLM answer synthesis) — obtain at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### Installation

```bash
git clone <repo>
cd atlas
npm install
cp .env.example .env
# edit .env with your credentials
```

### Environment Variables

See [`.env.example`](.env.example) for all variables. Required for full functionality:

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | For LLM synthesis | Gemini API key |
| `SANITY_PROJECT_ID` | For live Sanity | Your Sanity project ID |
| `SANITY_DATASET` | For live Sanity | Dataset name (default: `production`) |
| `SANITY_API_TOKEN` | For live Sanity | Read token from Sanity manage |
| `CERTIFICATE_HMAC_SECRET` | For certificates | Random 32-byte hex string |

### Development

```bash
npm run dev
```

Starts the Express server with Vite middleware on `http://localhost:3000`.

### Production Build

```bash
npm run build
NODE_ENV=production npm start
```

### Type Check

```bash
npm run typecheck
```

## Documentation

| Path | Contents |
|------|----------|
| [`docs/architecture/`](docs/architecture/) | System architecture, investigation flow, evidence model |
| [`docs/api/`](docs/api/) | REST API reference, SSE events |
| [`docs/agents/`](docs/agents/) | LangGraph workflow, audit probes, certificate engine |
| [`docs/sanity/`](docs/sanity/) | Sanity schemas, knowledge base, MCP integration |
| [`docs/frontend/`](docs/frontend/) | Frontend architecture |
| [`docs/deployment/`](docs/deployment/) | Environment setup, production deployment |
| [`docs/hackathon/`](docs/hackathon/) | Sanity Challenge submission notes |

## Hackathon — Sanity Challenge (Path One)

ATLAS demonstrates meaningful Sanity usage by:

- Using Sanity as the **authoritative knowledge store** (not a peripheral cache)
- Running **GROQ queries** against structured Layer A content
- Querying the **Sanity Context MCP** endpoint for schema discovery and Knowledge Base retrieval
- Constructing a **knowledge graph** from Sanity entities, claims, and relationships
- Detecting **contradictions** between Sanity claims and resolving them with source authority
- Generating **Merkle-certified audit reports** that commit the Sanity-retrieved evidence

The Sanity Project ID and dataset are configurable via environment variables and displayed in the Sanity Explorer tab.
