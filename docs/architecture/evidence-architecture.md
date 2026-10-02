# Evidence Architecture

## NormalizedEvidenceBundle

The output of the Evidence Aggregator node. Contains everything needed to render the graph and generate the certificate.

```typescript
NormalizedEvidenceBundle {
  nodes: GraphNode[]
  edges: GraphEdge[]
  claims: SanityClaim[]
  sources: SanitySource[]
  conflicts: EvaluatedConflict[]
  knowledgeDocs: SanityKnowledgeDoc[]
  stats: {
    directCount: number       // nodes directly answering the question
    relationalCount: number   // nodes connected via relationships
    inferredCount: number     // nodes inferred from context
    contradictedCount: number // nodes involved in conflicts
  }
}
```

## Node Types

| Type | Shape | Fill | Description |
|------|-------|------|-------------|
| `entity` | circle | black | Named entity from Sanity |
| `claim` | circle | white | Factual statement with status |
| `source` | circle | grey | Authoritative source document |
| `conflict` | circle | black | Detected contradiction between claims |
| `knowledge_doc` | circle | grey | Layer B knowledge document |

## Edge Types

| Type | Style | Meaning |
|------|-------|---------|
| `introduced_in` | solid | Entity feature was introduced in a version |
| `supports` | solid | Source supports a claim |
| `contradicts` | dashed | Claim contradicts another claim |
| `supersedes` | solid | Newer claim supersedes older |
| `related_to` | solid | General entity relationship |
| `documented_by` | solid | Entity documented by source |

## Conflict Resolution in Graph

Resolved conflicts show as dashed edges between the two conflicting claim nodes. The resolution reason and winning source are exposed in the node detail panel.

## Merkle Leaf Generation

Each item in the evidence bundle becomes a Merkle leaf:
- claims → `claim:{_id}:{statement}`
- sources → `source:{_id}:{title}:{url}`
- relationships → `relationship:{_id}:{relationType}`
- conflicts → `conflict:{_id}:{conflictType}:{resolution}`

All leaves are SHA-256 hashed deterministically. Same evidence always produces the same root.
