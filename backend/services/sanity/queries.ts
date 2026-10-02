/**
 * ATLAS — Sanity Agent Query Tools
 * Provides structured retrieval operations for the LangGraph agent.
 * All Sanity access goes through these tools — never directly from frontend or agent state.
 */

import { sanityClient } from './client.ts';
import {
  SanitySchemaDefinition,
  SanityEntity,
  SanityClaim,
  SanitySource,
  SanityRelationship,
  SanityConflict,
  SanityKnowledgeDoc,
} from './types.ts';

export interface AgentRetrievalBundle {
  entities: SanityEntity[];
  claims: SanityClaim[];
  sources: SanitySource[];
  relationships: SanityRelationship[];
  conflicts: SanityConflict[];
  knowledgeDocs: SanityKnowledgeDoc[];
}

export const sanityQueries = {
  discoverSchema(): SanitySchemaDefinition[] {
    return sanityClient.getSchemas();
  },

  resolveEntities(query: string): SanityEntity[] {
    return sanityClient.findEntities(query);
  },

  retrieveKnowledge(query: string): SanityKnowledgeDoc[] {
    return sanityClient.searchKnowledge(query);
  },

  async queryStructuredLake(groq: string, params?: Record<string, any>): Promise<any> {
    return sanityClient.queryStructuredContent(groq, params);
  },

  traverseRelationships(entityIds: string[]): SanityRelationship[] {
    const seen = new Set<string>();
    const result: SanityRelationship[] = [];
    for (const id of entityIds) {
      for (const rel of sanityClient.getRelationshipsForEntity(id)) {
        if (!seen.has(rel._id)) {
          seen.add(rel._id);
          result.push(rel);
        }
      }
    }
    return result;
  },

  resolveSources(sourceIds: string[]): SanitySource[] {
    const result: SanitySource[] = [];
    for (const sid of sourceIds) {
      const src = sanityClient.getSource(sid);
      if (src) result.push(src);
    }
    return result;
  },

  fetchConflicts(): SanityConflict[] {
    return sanityClient.getConflicts();
  },

  /**
   * Executes a full multi-pass retrieval for the given entities and question.
   * This is the primary entry point for the investigation agent.
   */
  executeInvestigationRetrieval(entities: SanityEntity[], question: string): AgentRetrievalBundle {
    const entityIds = entities.map(e => e._id);
    const claimIdsSeen = new Set<string>();
    const resolvedClaims: SanityClaim[] = [];

    for (const ent of entities) {
      for (const c of sanityClient.getClaimsForEntity(ent._id)) {
        if (!claimIdsSeen.has(c._id)) {
          claimIdsSeen.add(c._id);
          resolvedClaims.push(c);
        }
      }
    }

    const relationships = this.traverseRelationships(entityIds);

    const sourceIds = new Set<string>();
    resolvedClaims.forEach(c => c.sources.forEach(s => sourceIds.add(s._ref)));
    relationships.forEach(r => r.evidence.forEach(s => sourceIds.add(s._ref)));

    const sources = this.resolveSources(Array.from(sourceIds));
    const knowledgeDocs = this.retrieveKnowledge(question);
    const conflicts = this.fetchConflicts();

    return { entities, claims: resolvedClaims, sources, relationships, conflicts, knowledgeDocs };
  },
};
