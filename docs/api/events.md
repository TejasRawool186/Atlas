# ATLAS SSE Event Reference

Connect to `GET /api/investigations/:id/events` for a Server-Sent Events stream.

Historical events are replayed on connect. New events arrive in real-time.

## Event Types

| Event | Description | Key Data Fields |
|-------|-------------|-----------------|
| `investigation.created` | Investigation record created | `id`, `question` |
| `investigation.planning` | Planning phase started/updated | `question`, `plan` |
| `sanity.schema.loaded` | Sanity schemas discovered | `schemasCount`, `schemas[]` |
| `sanity.query.started` | Entity resolution started | `resolvedEntities[]` |
| `sanity.query.completed` | Retrieval complete | `claimsCount`, `sourcesCount`, `relationshipsCount` |
| `knowledge.retrieved` | Knowledge Base searched | `docsCount`, `documents[]` |
| `conflict.detected` | Contradiction found | `conflictId`, `conflictType`, `status` |
| `evidence.built` | Evidence graph constructed | `nodesCount`, `edgesCount`, `stats` |
| `answer.generated` | Answer synthesis complete | `answerLength` |
| `audit.started` | Audit probes beginning | `probesCount` |
| `audit.probe.completed` | Single probe result | `probe`, `name`, `status`, `score`, `summary` |
| `audit.completed` | All probes done | `verdict`, `verdictRationale`, `resilienceScore` |
| `certificate.generated` | Certificate minted | `certificateId`, `evidenceRoot`, `leavesCount` |
| `investigation.completed` | Workflow finished | `investigationId`, `verdict`, `certificateId` |
| `investigation.failed` | Workflow error | `error` |

## Keep-Alive

A `: heartbeat` comment is sent every 20 seconds to keep the connection alive.
