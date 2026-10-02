# Investigation Flow — Step by Step

## 1. Create Investigation

```
POST /api/investigations
{ "question": "Was Feature X available in Framework 4.2?" }
→ { "id": "INV-2026-46801", "status": "created" }
```

## 2. Run Investigation

```
POST /api/investigations/INV-2026-46801/run
→ { "id": "INV-2026-46801", "status": "planning" }
```

The workflow runs asynchronously. Connect to SSE for live progress.

## 3. SSE Event Stream

```
GET /api/investigations/INV-2026-46801/events
```

Events arrive in this order:

```
investigation.created     { id, question }
investigation.planning    { plan }
sanity.schema.loaded      { schemasCount }
sanity.query.started      { resolvedEntities }
sanity.query.completed    { claimsCount, sourcesCount }
knowledge.retrieved       { docsCount }
conflict.detected         { conflictId, conflictType, status }   ← if conflicts found
evidence.built            { nodesCount, edgesCount }
answer.generated          { answerLength }
audit.started             { probesCount: 10 }
audit.probe.completed     × 10  { probe, status, score }
audit.completed           { verdict, resilienceScore }
certificate.generated     { certificateId, evidenceRoot }
investigation.completed   { investigationId, verdict, certificateId }
```

## 4. Fetch Results

```
GET /api/investigations/INV-2026-46801
GET /api/investigations/INV-2026-46801/evidence
GET /api/investigations/INV-2026-46801/audit
GET /api/certificates/CERT-2026-XXXXXXXX
```

## 5. Verify Certificate

```
POST /api/certificates/CERT-2026-XXXXXXXX/verify
{}
→ { valid: true, evidenceRootValid: true, signatureValid: true }
```

## Typical Duration

Without LLM (structured fallback): ~1 second  
With Gemini LLM synthesis: ~3-8 seconds depending on evidence size
