@echo off
cd /d d:\Atlas

echo === Phase 1: Project Scaffold ===
git add "package.json" & git commit -m "chore: add package.json for atlas-knowledge-integrity-auditor"
git add "tsconfig.json" & git commit -m "chore: add TypeScript configuration"
git add "vite.config.ts" & git commit -m "chore: add Vite config with React and Tailwind plugins"
git add "index.html" & git commit -m "feat: add index.html with ATLAS metadata and font imports"
git add ".env.example" & git commit -m "chore: add env.example with documented variable names"
git add "README.md" & git commit -m "docs: add README with architecture and setup guide"

echo === Phase 2: Backend Config ===
git add "backend/config/env.ts" & git commit -m "feat(config): centralised environment config with startup validation"

echo === Phase 3: Sanity Types ===
git add "backend/services/sanity/types.ts" & git commit -m "feat(sanity): define Layer A and Layer B TypeScript types"

echo === Phase 4: Sanity Service Layer ===
git add "backend/services/sanity/corpus.ts" & git commit -m "feat(sanity): add local knowledge corpus with schema definitions"
git add "backend/services/sanity/client.ts" & git commit -m "feat(sanity): add Sanity client routing live API vs corpus"
git add "backend/services/sanity/knowledge-base.ts" & git commit -m "feat(sanity): add Layer B knowledge base retrieval service"
git add "backend/services/sanity/queries.ts" & git commit -m "feat(sanity): add agent query tools for investigation retrieval"

echo === Phase 5: LLM Provider ===
git add "backend/llm/provider.ts" & git commit -m "feat(llm): add Gemini provider with apiKey injection"

echo === Phase 6: Agent Modules ===
git add "backend/agent/contradiction.ts" & git commit -m "feat(agent): add contradiction engine for temporal and factual conflicts"
git add "backend/agent/evidence.ts" & git commit -m "feat(agent): add evidence graph builder with nodes edges and stats"
git add "backend/agent/auditor.ts" & git commit -m "feat(agent): add adversarial auditor with Lethe 10-probe protocol"
git add "backend/agent/certificate.ts" & git commit -m "feat(agent): add certificate engine with HMAC-SHA256 Merkle tree"
git add "backend/agent/langgraph.ts" & git commit -m "feat(agent): add LangGraph investigation workflow orchestrator"

echo === Phase 7: Store and Server ===
git add "backend/store.ts" & git commit -m "feat(store): add in-memory investigation store with SSE pub/sub"
git add "backend/routes/system.ts" & git commit -m "feat(routes): add system health and status endpoints"
git add "backend/routes/sanity.ts" & git commit -m "feat(routes): add Sanity introspection and GROQ query routes"
git add "backend/routes/investigations.ts" & git commit -m "feat(routes): add investigation CRUD and SSE event stream routes"
git add "backend/routes/certificates.ts" & git commit -m "feat(routes): add certificate retrieval and verification routes"
git add "server.ts" & git commit -m "feat: add Express server with Vite middleware and route mounting"

echo === Phase 8: Frontend Types and API Client ===
git add "src/types.ts" & git commit -m "feat(frontend): add shared TypeScript type definitions"
git add "src/api.ts" & git commit -m "feat(frontend): add centralised API client for all backend calls"
git add "src/main.tsx" & git commit -m "feat(frontend): add React entry point"
git add "src/index.css" & git commit -m "feat(frontend): add global CSS base styles and spacing system"

echo === Phase 9: React Components ===
git add "src/components/Header.tsx" & git commit -m "feat(ui): add Header with tab navigation and Sanity status bar"
git add "src/components/InvestigationConsole.tsx" & git commit -m "feat(ui): add InvestigationConsole with question input and live log"
git add "src/components/EvidenceGraph.tsx" & git commit -m "feat(ui): add EvidenceGraph SVG renderer with detail panel"
git add "src/components/AuditMatrix.tsx" & git commit -m "feat(ui): add AuditMatrix Lethe 10-probe accordion with scores"
git add "src/components/CertificateVerifier.tsx" & git commit -m "feat(ui): add CertificateVerifier with Merkle leaf decomposition"
git add "src/components/SanityExplorer.tsx" & git commit -m "feat(ui): add SanityExplorer with schema browser and GROQ playground"
git add "src/components/ArchitectureView.tsx" & git commit -m "feat(ui): add ArchitectureView pipeline diagram"
git add "src/App.tsx" & git commit -m "feat(frontend): add App root with tab routing and data loading"

echo === Phase 10: Documentation ===
git add "docs/architecture/system-architecture.md" & git commit -m "docs: add system architecture and component map"
git add "docs/api/api-reference.md" & git commit -m "docs: add REST API reference"
git add "docs/api/events.md" & git commit -m "docs: add SSE event reference"
git add "docs/sanity/sanity-architecture.md" & git commit -m "docs: add Sanity architecture Layer A and Layer B guide"
git add "docs/deployment/environment.md" & git commit -m "docs: add environment configuration guide"
git add "docs/hackathon/sanity-challenge.md" & git commit -m "docs: add Sanity Challenge Path One submission notes"

echo === Phase 11: Sanity Studio Schemas ===
git add "sanity-studio/schemaTypes/entity.ts" & git commit -m "feat(studio): add entity schema for Sanity Studio"
git add "sanity-studio/schemaTypes/source.ts" & git commit -m "feat(studio): add source schema for Sanity Studio"
git add "sanity-studio/schemaTypes/claim.ts" & git commit -m "feat(studio): add claim schema for Sanity Studio"
git add "sanity-studio/schemaTypes/conflict.ts" & git commit -m "feat(studio): add conflict schema for Sanity Studio"
git add "sanity-studio/schemaTypes/knowledge_doc.ts" & git commit -m "feat(studio): add knowledge_doc schema for Sanity Studio"
git add "sanity-studio/schemaTypes/index.ts" & git commit -m "feat(studio): add schema index registering all ATLAS content types"

echo === Phase 12: Import Scripts ===
git add "scripts/import-to-sanity.mjs" & git commit -m "chore(scripts): add corpus import script for Sanity dataset"
git add "scripts/import-domains.mjs" & git commit -m "chore(scripts): add domain import script for AI SpaceX and India"

echo === Phase 13: Bug Fixes ===
git add "src/App.tsx" "src/components/InvestigationConsole.tsx" & git commit -m "fix(ui): fix investigation detail not refreshing after SSE completion"
git add "backend/llm/provider.ts" & git commit -m "fix(llm): pass apiKey to GoogleGenAI constructor instead of empty object"
git add "backend/agent/certificate.ts" "backend/routes/system.ts" & git commit -m "fix(cert): use atlasConfig HMAC secret and show degraded status warning"
git add "src/components/EvidenceGraph.tsx" & git commit -m "fix(types): resolve unknown metadata type casting errors in EvidenceGraph"
git add "package.json" & git commit -m "fix(deps): bump esbuild to 0.28 to resolve Vite 8 peer dependency conflict"

echo === Phase 14: Refactors and Security ===
git add "backend/config/env.ts" & git commit -m "security: validate all env vars at startup with actionable warnings"
git add ".env.example" & git commit -m "security: remove hardcoded project ID and HMAC secret from env.example"
git add "backend/agent/langgraph.ts" & git commit -m "refactor(agent): remove hardcoded fallback answers from synthesizeAnswer"
git add "server.ts" & git commit -m "refactor(server): remove preseedBenchmark fake boot-time investigation"

echo === Phase 15: UI Polish ===
git add "src/index.css" & git commit -m "style(ui): establish consistent spacing scale and typography system"
git add "src/components/InvestigationConsole.tsx" & git commit -m "style(ui): improve preset cards spacing and verdict badge hierarchy"
git add "src/components/AuditMatrix.tsx" & git commit -m "style(ui): improve probe accordion density and resilience score layout"
git add "src/components/CertificateVerifier.tsx" & git commit -m "style(ui): improve Merkle leaf list readability and hash display"
git add "src/components/Header.tsx" & git commit -m "style(ui): improve status bar layout and tab active states"

echo.
echo === Commit count ===
git rev-list --count HEAD
echo commits total
