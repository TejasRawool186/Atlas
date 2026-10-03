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

## Overview

ATLAS validates factual claims against structured source documents and generates an auditable cryptographic proof for every verdict. The system is designed for engineering, compliance, and research teams that require autonomous agents to produce citations linked to structured schemas rather than ungrounded completions. Standard retrieval engines pass unstructured text chunks to an LLM, making temporal conflicts and subtle hallucinations difficult to isolate. ATLAS replaces this pattern by structuring sources into entities, claims, and relations within the Sanity Content Lake, evaluating conflicts with explicit authority rules, and executing a 10-probe audit suite before issuing a verdict. Every completed investigation produces a deterministic HMAC-SHA256 Merkle certificate that can be verified independently to confirm that no evidence was altered.

---

## Try it

When running locally on `http://localhost:3000`, the workflow can be tested directly from the interface:

1. Open the **Console** tab.
2. Enter the claim: `India's current AI investment is $1.2B` and click **Run Audit**.
3. Observe the live Server-Sent Events stream as the agent resolves entities, retrieves claims via GROQ, and runs the audit suite.
4. Review the verdict badge (`SUPPORTED`), the 90/100 resilience score, and citations to `claim-muswyw17-0` and `src-muswyw15-ai-boom`.
5. Enter a contradictory claim: `According to the article, did NVIDIA say that India's current AI investment is $1.2 billion and that the Union Budget provides a 10-year tax holiday for foreign companies?`
6. Observe the `PARTIALLY_SUPPORTED` verdict, where the agent confirms the $1.2B figure but notes the budget established a 20-year holiday instead.
7. Open the **Certificate** tab and click **Verify Cryptographic Proofs** to validate the SHA-256 Merkle root and signature.

---

## The problem

Production language model pipelines generate plausible assertions that can diverge from source ground truth without triggering detectable errors.

In standard RAG setups, documents are chunked into arbitrary token windows and retrieved via vector cosine similarity. If an organization updates an API policy in 2026 while leaving a 2024 RFC draft in storage, semantic similarity often retrieves both documents. The model synthesizes an answer that blends the obsolete policy with the current one because it lacks structured temporal metadata and explicit source hierarchies. Furthermore, when users receive an incorrect answer, they have no programmatic way to verify whether the agent evaluated competing sources or if the retrieved evidence set was altered after the conclusion was generated.

---

## The approach

ATLAS addresses these failure modes through four core design decisions:

1. **Structured schemas over raw text chunks**: Documents are ingested into typed Sanity schemas (`entity`, `claim`, `source`, `relationship`, `conflict`, `knowledge_doc`). The agent queries atomic propositions and explicit predicates rather than guessing structure from large markdown blocks.
2. **Deterministic contradiction resolution**: When claims share a subject and conflicting predicates, the engine evaluates source authority weights (`official_release: 100`, `git_commit: 95`, `rfcs: 85`, `documentation: 80`, `changelog: 80`, `benchmark: 70`, `community_forum: 40`). Temporal recency breaks ties between sources of equal authority.
3. **Adversarial stress testing before completion**: The synthesized response undergoes a 10-probe test protocol (the Lethe suite) that checks grounding boundaries, temporal sequencing, entity drift, and counterfactual source removal.
4. **Cryptographic evidence anchoring**: Verified evidence items are serialized into canonical strings, hashed into an RFC-6962 Merkle tree, and signed with HMAC-SHA256 to provide tamper detection.

---

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
