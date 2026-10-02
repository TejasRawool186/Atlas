# ATLAS System Architecture

## Overview

ATLAS is a full-stack TypeScript application built on Express (backend) and React (frontend). The backend runs a LangGraph-style investigation agent that queries a Sanity-backed knowledge store, audits the result, and produces a cryptographic certificate.

## Component Map

```
┌─────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)           │
│  InvestigationConsole · EvidenceGraph · AuditMatrix     │
│  CertificateVerifier · SanityExplorer · ArchitectureView│
└────────────────────────┬────────────────────────────────┘
                         │ HTTP REST + SSE
┌────────────────────────▼────────────────────────────────┐
│                    Express API Server                    │
│  /api/investigations  /api/certificates                 │
│  /api/sanity          /api/system                       │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│               LangGraph Investigation Agent              │
│  Question Analyzer → Entity Resolver                    │
│  → Sanity Context Retrieval → Contradiction Engine      │
│  → Evidence Aggregator → Answer Generator               │
│  → Adversarial Auditor → Certificate Engine             │
└────────┬───────────────────────────────────────────────┘
         │
┌────────▼──────────────┐   ┌──────────────────────────┐
│   Sanity Client       │   │       LLM Provider        │
│  corpusEngine (local) │   │  Gemini (when configured) │
│  or live Sanity API   │   │  structured fallback      │
└───────────────────────┘   └──────────────────────────┘
```

## Backend Structure

```
backend/
├── agent/
│   ├── langgraph.ts     # Investigation workflow orchestrator
│   ├── auditor.ts       # Lethe 10-probe adversarial audit engine
│   ├── contradiction.ts # Claim comparison and conflict resolution
│   ├── evidence.ts      # Evidence graph construction
│   └── certificate.ts   # HMAC-SHA256 Merkle certificate engine
├── config/
│   └── env.ts           # Centralised environment config
├── llm/
│   └── provider.ts      # Gemini LLM client
├── routes/
│   ├── investigations.ts
│   ├── certificates.ts
│   ├── sanity.ts
│   └── system.ts
├── services/
│   └── sanity/
│       ├── client.ts        # Sanity HTTP + local corpus router
│       ├── corpus.ts        # Local knowledge corpus + GROQ engine
│       ├── knowledge-base.ts # Layer B retrieval
│       ├── queries.ts       # Agent-facing query tools
│       └── types.ts         # Sanity type definitions
├── store.ts             # In-memory investigation + SSE store
└── types/               # Shared backend types
```

## Data Flow

1. `POST /api/investigations` — creates investigation record
2. `POST /api/investigations/:id/run` — triggers `atlasAgent.runWorkflow()` asynchronously
3. Agent emits SSE events via `atlasStore.broadcastEvent()`
4. Frontend receives events via `GET /api/investigations/:id/events`
5. On completion, full state is stored in `atlasStore`
6. Frontend polls `GET /api/investigations/:id` for final state
