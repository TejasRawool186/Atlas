/**
 * ATLAS — Evidence Engine & Graph Builder
 * Classifies evidence statements and creates frontend-compatible interactive graph representations.
 */

import {
  SanityEntity,
  SanityClaim,
  SanitySource,
  SanityRelationship,
  SanityConflict,
  SanityKnowledgeDoc,
} from '../services/sanity/types.ts';
import { EvaluatedConflict } from './contradiction.ts';

export type EvidenceClassification = 'DIRECT' | 'RELATIONAL' | 'INFERRED' | 'CONTRADICTED' | 'UNKNOWN';

export interface GraphNode {
  id: string;
  type: 'entity' | 'claim' | 'source' | 'event' | 'conflict' | 'knowledge_doc';
  label: string;
  category?: string;
  status?: string;
  metadata: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  isConflict?: boolean;
}

export interface NormalizedEvidenceBundle {
  nodes: GraphNode[];
  edges: GraphEdge[];
  claims: (SanityClaim & { classification: EvidenceClassification })[];
  sources: SanitySource[];
  conflicts: EvaluatedConflict[];
  knowledgeDocs: SanityKnowledgeDoc[];
  stats: {
    directCount: number;
    relationalCount: number;
    inferredCount: number;
    contradictedCount: number;
  };
}

export class EvidenceEngine {
  public buildEvidenceGraph(params: {
    entities: SanityEntity[];
    claims: SanityClaim[];
    sources: SanitySource[];
    relationships: SanityRelationship[];
    conflicts: EvaluatedConflict[];
    knowledgeDocs: SanityKnowledgeDoc[];
  }): NormalizedEvidenceBundle {
    const { entities, claims, sources, relationships, conflicts, knowledgeDocs } = params;

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeIds = new Set<string>();

    const addNode = (node: GraphNode) => {
      if (!nodeIds.has(node.id)) {
        nodeIds.add(node.id);
        nodes.push(node);
      }
    };

    // 1. Add Entity Nodes
    entities.forEach(ent => {
      addNode({
        id: ent._id,
        type: 'entity',
        label: ent.name,
        category: ent.entityType,
        metadata: {
          description: ent.description,
          aliases: ent.aliases
        }
      });
    });

    // 2. Add Sources
    sources.forEach(src => {
      addNode({
        id: src._id,
        type: 'source',
        label: src.title,
        category: src.sourceType,
        metadata: {
          url: src.url,
          publisher: src.publisher,
          publishedAt: src.publishedAt,
          author: src.author,
          excerpt: src.excerpt
        }
      });
    });

    // 3. Classify and Add Claims
    let directCount = 0;
    let relationalCount = 0;
    let inferredCount = 0;
    let contradictedCount = 0;

    const classifiedClaims = claims.map(c => {
      let classification: EvidenceClassification = 'DIRECT';

      const hasConflict = conflicts.some(cf => cf.claimA._id === c._id || cf.claimB._id === c._id);
      if (hasConflict && c.status === 'superseded') {
        classification = 'CONTRADICTED';
        contradictedCount++;
      } else if (c.confidence === 'low' || !c.sources || c.sources.length === 0) {
        classification = 'INFERRED';
        inferredCount++;
      } else if (relationships.some(r => r.sourceEntity._ref === c.subject._ref)) {
        classification = 'RELATIONAL';
        relationalCount++;
      } else {
        directCount++;
      }

      addNode({
        id: c._id,
        type: 'claim',
        label: c.statement.length > 50 ? `${c.statement.slice(0, 48)}...` : c.statement,
        status: c.status,
        category: classification,
        metadata: {
          fullStatement: c.statement,
          predicate: c.predicate,
          validFrom: c.validFrom,
          validUntil: c.validUntil,
          confidence: c.confidence
        }
      });

      // Claim -> Subject Entity edge
      edges.push({
        id: `edge_${c._id}_subject`,
        source: c._id,
        target: c.subject._ref,
        type: c.predicate,
        label: c.predicate
      });

      // Claim -> Object Entity/Version edge if exists
      if (c.object && typeof c.object === 'object' && c.object._ref) {
        edges.push({
          id: `edge_${c._id}_object`,
          source: c._id,
          target: c.object._ref,
          type: 'targets',
          label: 'object'
        });
      }

      // Source -> Claim edges
      c.sources.forEach(sRef => {
        edges.push({
          id: `edge_${sRef._ref}_supports_${c._id}`,
          source: sRef._ref,
          target: c._id,
          type: 'supports',
          label: 'cites'
        });
      });

      return {
        ...c,
        classification
      };
    });

    // 4. Add Relationship Edges
    relationships.forEach(rel => {
      edges.push({
        id: `rel_${rel._id}`,
        source: rel.sourceEntity._ref,
        target: rel.targetEntity._ref,
        type: rel.relationType,
        label: rel.relationType
      });
    });

    // 5. Add Conflict Nodes and Edges
    conflicts.forEach(conf => {
      addNode({
        id: conf.id,
        type: 'conflict',
        label: `Conflict: ${conf.conflictType}`,
        status: conf.status,
        category: conf.conflictType,
        metadata: {
          resolutionSummary: conf.resolutionSummary,
          resolutionReason: conf.resolutionReason,
          status: conf.status
        }
      });

      edges.push({
        id: `edge_${conf.id}_claimA`,
        source: conf.id,
        target: conf.claimA._id,
        type: 'disputes',
        label: 'claim A',
        isConflict: true
      });

      edges.push({
        id: `edge_${conf.id}_claimB`,
        source: conf.id,
        target: conf.claimB._id,
        type: 'disputes',
        label: 'claim B',
        isConflict: true
      });
    });

    // 6. Add Knowledge Base Documents
    knowledgeDocs.forEach(k => {
      addNode({
        id: k._id,
        type: 'knowledge_doc',
        label: k.title,
        category: k.docType,
        metadata: {
          author: k.author,
          summary: k.summary,
          url: k.sourceUrl,
          publishedAt: k.publishedAt
        }
      });

      k.referencedEntities.forEach(entId => {
        if (nodeIds.has(entId)) {
          edges.push({
            id: `edge_${k._id}_references_${entId}`,
            source: k._id,
            target: entId,
            type: 'references',
            label: 'discusses'
          });
        }
      });
    });

    return {
      nodes,
      edges,
      claims: classifiedClaims,
      sources,
      conflicts,
      knowledgeDocs,
      stats: {
        directCount,
        relationalCount,
        inferredCount,
        contradictedCount
      }
    };
  }
}

export const evidenceEngine = new EvidenceEngine();
