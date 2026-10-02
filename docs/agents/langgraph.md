# LangGraph Investigation Workflow

## Node Sequence

```
START → Question Analyzer → Entity Resolver → Schema Discovery
      → Sanity Context Retrieval → Contradiction Engine
      → Evidence Aggregator → Answer Generator
      → Adversarial Auditor → Certificate Engine → END
```

## State Shape

```typescript
InvestigationState {
  investigationId: string
  question: string
  status: InvestigationStatus
  entities: SanityEntity[]
  claims: SanityClaim[]
  sources: SanitySource[]
  relationships: SanityRelationship[]
  conflicts: EvaluatedConflict[]
  knowledgeDocs: SanityKnowledgeDoc[]
  evidenceGraph: NormalizedEvidenceBundle | null
  answer: string | null
  auditReport: FullAuditReport | null
  verdict: Verdict | null
  certificate: AtlasCertificate | null
  errors: string[]
  events: InvestigationEvent[]
}
```

## Question Analyzer

Uses LLM (Gemini) to extract:
- `intent`: fact_verification | relationship_query | temporal_query | comparison
- `identifiedEntities`: array of entity name strings
- `temporalConstraints`: date range if applicable
- `retrievalSteps`: planned steps

Falls back to token-based extraction if LLM unavailable.

## Entity Resolver

Queries Sanity for each identified entity name. Uses `findEntitiesByQuery` which matches against name, description, and aliases. Falls back to full-question search if no entities found by keyword.

## Contradiction Engine

Compares all retrieved claims pairwise using subject/predicate/object overlap. Evaluates against known conflicts in the corpus. Assigns TEMPORAL_CONFLICT, FACTUAL_CONFLICT, ATTRIBUTE_CONFLICT, or DEPRECATION_CONFLICT.

## Answer Generator

System instruction strictly separates policy from data:
- SYSTEM POLICY > AGENT POLICY > USER QUESTION > RETRIEVED CONTENT
- Every claim must cite a source ID
- Falls back to structured evidence summary if LLM unavailable — no invented content
