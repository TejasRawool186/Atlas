# Frontend Architecture

## Stack

- **React 19** with TypeScript
- **Vite 8** build tool with HMR
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **Lucide React** for icons
- **Native SVG** for evidence graph (no graph library dependency)

## Component Structure

```
src/
├── App.tsx                    # Root — tab routing, data loading, SSE subscription
├── api.ts                     # Centralised API client (all fetch calls)
├── types.ts                   # TypeScript types mirroring backend API contract
├── main.tsx                   # React entry point
├── index.css                  # Global styles and Tailwind base
└── components/
    ├── Header.tsx              # Navigation tabs + Sanity/LLM status bar
    ├── InvestigationConsole.tsx # Main investigation UI — question, log, verdict, answer
    ├── EvidenceGraph.tsx       # SVG evidence graph with node/edge layout
    ├── AuditMatrix.tsx         # 10-probe audit accordion
    ├── CertificateVerifier.tsx # Certificate display and tamper sandbox
    ├── SanityExplorer.tsx      # Schema browser, knowledge docs, GROQ playground
    └── ArchitectureView.tsx    # Pipeline diagram and compliance checklist
```

## Design System

Consistent spacing scale: 3 / 4 / 5 / 6 units (12/16/20/24px).

Visual language: high-contrast black borders, orange (`#FF5A1F`) accent, white cards on orange background. Brutalist card style with `shadow-[3px_3px_0_#000]` offset shadows.

Typography: Playfair Display (serif headings), Space Mono (monospace IDs/hashes/metadata), system sans for body.

## State Management

All state lives in `App.tsx` — passed down as props. No external state library. Investigation data loaded via `useEffect` + `useCallback`. SSE subscription managed in `InvestigationConsole` component.

## Real-Time Flow

1. User submits question → `api.createInvestigation()` → `api.runInvestigation()`
2. `api.subscribeToInvestigationEvents()` opens EventSource
3. Each SSE event appends to `liveEvents` state in InvestigationConsole
4. On `investigation.completed`: `refreshTick` increments → `useEffect` re-fetches full state
5. Evidence graph, audit report, certificate loaded in parallel

## Frontend / Backend Boundary

Frontend NEVER:
- Calls Sanity directly
- Calls Gemini directly
- Generates audit verdicts
- Creates certificate data
- Fabricates evidence

All data displayed comes from backend API responses.
