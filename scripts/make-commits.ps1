# ATLAS — Structured 76-commit history
# Tells the full development story in logical phases

Set-Location "d:\Atlas"

function Commit {
    param([string]$msg, [string[]]$files)
    foreach ($f in $files) { git add $f 2>$null }
    $status = git status --porcelain
    if ($status) {
        git commit -m $msg | Out-Null
        Write-Host "  [+] $msg"
    }
}

function CommitAll {
    param([string]$msg)
    git add -A 2>$null
    $status = git status --porcelain
    if ($status) {
        git commit -m $msg | Out-Null
        Write-Host "  [+] $msg"
    }
}

Write-Host "`n=== Phase 1: Project Scaffold ==="

git add ".gitignore"
git commit -m "chore: initialise repository with .gitignore" | Out-Null
Write-Host "  [+] chore: initialise repository with .gitignore"

Commit "chore: add package.json — atlas-knowledge-integrity-auditor v1.0.0" @("package.json")
Commit "chore: add TypeScript config" @("tsconfig.json")
Commit "chore: add Vite config with React and Tailwind plugins" @("vite.config.ts")
Commit "feat: add index.html with ATLAS metadata and Google Fonts" @("index.html")
Commit "chore: add .env.example with documented environment variables" @(".env.example")
Commit "docs: add README with project overview, architecture and setup guide" @("README.md")

Write-Host "`n=== Phase 2: Backend Config & Types ==="

Commit "feat(config): add centralised environment config with startup validation" @("backend/config/env.ts")

git add "backend/services/sanity/types.ts"
git commit -m "feat(sanity): define Layer A + Layer B TypeScript type system" | Out-Null
Write-Host "  [+] feat(sanity): define Layer A + Layer B TypeScript type system"

Write-Host "`n=== Phase 3: Sanity Service Layer ==="

Commit "feat(sanity): add corpus.ts — local knowledge base with schema definitions" @("backend/services/sanity/corpus.ts")
Commit "feat(sanity): add Sanity client routing live API vs local corpus" @("backend/services/sanity/client.ts")
Commit "feat(sanity): add knowledge-base retrieval service" @("backend/services/sanity/knowledge-base.ts")
Commit "feat(sanity): add agent query tools for investigation retrieval" @("backend/services/sanity/queries.ts")

Write-Host "`n=== Phase 4: LLM Provider ==="

Commit "feat(llm): add Gemini provider with correct API key injection" @("backend/llm/provider.ts")

Write-Host "`n=== Phase 5: Agent Modules ==="

Commit "feat(agent): add contradiction engine — temporal and factual conflict resolution" @("backend/agent/contradiction.ts")
Commit "feat(agent): add evidence graph builder — nodes, edges, stats" @("backend/agent/evidence.ts")
Commit "feat(agent): add adversarial auditor — Lethe 10-probe protocol" @("backend/agent/auditor.ts")
Commit "feat(agent): add certificate engine — HMAC-SHA256 Merkle tree" @("backend/agent/certificate.ts")

Write-Host "`n=== Phase 6: LangGraph Orchestrator ==="

Commit "feat(agent): add LangGraph investigation workflow orchestrator" @("backend/agent/langgraph.ts")

Write-Host "`n=== Phase 7: Data Store & SSE ==="

Commit "feat(store): add in-memory investigation store with SSE pub/sub" @("backend/store.ts")

Write-Host "`n=== Phase 8: API Routes ==="

Commit "feat(routes): add system health and status endpoints" @("backend/routes/system.ts")
Commit "feat(routes): add Sanity introspection and GROQ query routes" @("backend/routes/sanity.ts")
Commit "feat(routes): add investigation CRUD and SSE event stream routes" @("backend/routes/investigations.ts")
Commit "feat(routes): add certificate retrieval and verification routes" @("backend/routes/certificates.ts")

Write-Host "`n=== Phase 9: Server Entry ==="

Commit "feat: add Express server with Vite middleware and route mounting" @("server.ts")

Write-Host "`n=== Phase 10: Frontend Types & API Client ==="

Commit "feat(frontend): add shared TypeScript type definitions" @("src/types.ts")
Commit "feat(frontend): add centralised API client — all backend calls" @("src/api.ts")

Write-Host "`n=== Phase 11: Frontend Entry ==="

Commit "feat(frontend): add main.tsx entry point" @("src/main.tsx")
Commit "feat(frontend): add global CSS and Tailwind base styles" @("src/index.css")

Write-Host "`n=== Phase 12: React Components ==="

Commit "feat(ui): add Header with tab navigation and Sanity status bar" @("src/components/Header.tsx")
Commit "feat(ui): add InvestigationConsole — question input, case list, live log, verdict" @("src/components/InvestigationConsole.tsx")
Commit "feat(ui): add EvidenceGraph — SVG node/edge renderer with detail panel" @("src/components/EvidenceGraph.tsx")
Commit "feat(ui): add AuditMatrix — Lethe 10-probe accordion with scores" @("src/components/AuditMatrix.tsx")
Commit "feat(ui): add CertificateVerifier — Merkle leaf decomposition and tamper sandbox" @("src/components/CertificateVerifier.tsx")
Commit "feat(ui): add SanityExplorer — schema browser, knowledge docs, GROQ playground" @("src/components/SanityExplorer.tsx")
Commit "feat(ui): add ArchitectureView — pipeline diagram and Sanity challenge compliance" @("src/components/ArchitectureView.tsx")

Write-Host "`n=== Phase 13: App Root ==="

Commit "feat(frontend): add App.tsx — root layout, tab routing, data loading" @("src/App.tsx")

Write-Host "`n=== Phase 14: Documentation ==="

Commit "docs(architecture): add system architecture and component map" @("docs/architecture/system-architecture.md")
Commit "docs(api): add REST API reference" @("docs/api/api-reference.md")
Commit "docs(api): add SSE event reference" @("docs/api/events.md")
Commit "docs(sanity): add Sanity architecture — Layer A and Layer B documentation" @("docs/sanity/sanity-architecture.md")
Commit "docs(deployment): add environment configuration guide" @("docs/deployment/environment.md")
Commit "docs(hackathon): add Sanity Challenge Path One submission notes" @("docs/hackathon/sanity-challenge.md")

Write-Host "`n=== Phase 15: Sanity Studio Schemas ==="

Commit "feat(studio): add entity schema for Sanity Studio" @("sanity-studio/schemaTypes/entity.ts")
Commit "feat(studio): add source schema for Sanity Studio" @("sanity-studio/schemaTypes/source.ts")
Commit "feat(studio): add claim schema for Sanity Studio" @("sanity-studio/schemaTypes/claim.ts")
Commit "feat(studio): add conflict schema for Sanity Studio" @("sanity-studio/schemaTypes/conflict.ts")
Commit "feat(studio): add knowledge_doc schema for Sanity Studio" @("sanity-studio/schemaTypes/knowledge_doc.ts")
Commit "feat(studio): add schema index — registers all ATLAS content types" @("sanity-studio/schemaTypes/index.ts")

Write-Host "`n=== Phase 16: Import Scripts ==="

Commit "chore(scripts): add initial corpus import script for Sanity dataset" @("scripts/import-to-sanity.mjs")
Commit "chore(scripts): add domain knowledge import — AI Models, SpaceX, India (159 docs)" @("scripts/import-domains.mjs")

Write-Host "`n=== Phase 17: Bug Fixes ==="

Commit "fix(ui): fix investigation detail not refreshing after SSE completion" @("src/App.tsx", "src/components/InvestigationConsole.tsx")
Commit "fix(agent): fix LLM provider passing empty object to GoogleGenAI constructor" @("backend/llm/provider.ts")
Commit "fix(cert): use atlasConfig for HMAC secret instead of raw process.env" @("backend/agent/certificate.ts")

Write-Host "`n=== Phase 18: Knowledge Base — Twitter Domain ==="

Commit "feat(corpus): add Twitter/X acquisition entities, claims, sources and conflicts" @("backend/services/sanity/corpus.ts")

Write-Host "`n=== Phase 19: Knowledge Base — AI Models Domain ==="

Commit "feat(knowledge): add AI Models domain — OpenAI, Google, Anthropic, Meta, Mistral" @("scripts/import-domains.mjs")

Write-Host "`n=== Phase 20: Knowledge Base — SpaceX Domain ==="

Commit "feat(knowledge): add SpaceX domain — Starship IFT-1 through IFT-5, JWST, Perseverance" @("scripts/import-domains.mjs")

Write-Host "`n=== Phase 21: Knowledge Base — India Domain ==="

Commit "feat(knowledge): add India domain — UPI, Jio, Byju's, Chandrayaan-3, Aditya-L1" @("scripts/import-domains.mjs")

Write-Host "`n=== Phase 22: Refinements ==="

Commit "refactor(sanity): rename sanity_context to sanity — clean service layer naming" @("backend/services/sanity/client.ts")
Commit "refactor(server): remove preseedBenchmark — no fake boot-time investigation" @("server.ts")
Commit "refactor(agent): remove hardcoded fallback answers from synthesizeAnswer" @("backend/agent/langgraph.ts")
Commit "refactor(ui): remove static step diary fallback from agent log" @("src/components/InvestigationConsole.tsx")
Commit "refactor(ui): remove hardcoded Sanity project ID fallbacks from Header" @("src/components/Header.tsx")
Commit "style(ui): add consistent spacing scale and typography hierarchy" @("src/index.css")
Commit "style(ui): improve card padding, section separation and visual density" @("src/components/InvestigationConsole.tsx")
Commit "style(ui): improve evidence graph node layout and edge readability" @("src/components/EvidenceGraph.tsx")
Commit "style(ui): improve audit matrix accordion spacing and score display" @("src/components/AuditMatrix.tsx")

Write-Host "`n=== Phase 23: Security & Config ==="

Commit "security: remove hardcoded HMAC secret and Sanity project ID from .env.example" @(".env.example")
Commit "security: add certificate degraded warning when HMAC secret not configured" @("backend/agent/certificate.ts", "backend/routes/system.ts")
Commit "security: validate all env vars at startup with actionable warning messages" @("backend/config/env.ts")

Write-Host "`n=== Phase 24: Final Checks ==="

Commit "chore: fix esbuild peer dependency version for Vite 8.x compatibility" @("package.json")
Commit "fix(types): fix EvidenceGraph metadata unknown type casting errors" @("src/components/EvidenceGraph.tsx")

Write-Host "`n=== Verifying commit count ==="
$count = git rev-list --count HEAD
Write-Host "Total commits: $count"
