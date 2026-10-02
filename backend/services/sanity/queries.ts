/**
 * ATLAS — Sanity Agent Query Tools
 * Provides structured retrieval operations for the LangGraph agent.
 * All Sanity access goes through these tools — never directly from frontend or agent state.
 * All methods are async to support live Sanity HTTP queries.
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

  async resolveEntities(query: string): Promise<SanityEntity[]> {
    return sanityClient.findEntities(query);
  },

  async retrieveKnowledge(query: string): Promise<SanityKnowledgeDoc[]> {
    return sanityClient.searchKnowledge(query);
  },

  async queryStructuredLake(groq: string, params?: Record<string, any>): Promise<any> {
    return sanityClient.queryStructuredContent(groq, params);
  },

  async traverseRelationships(entityIds: string[]): Promise<SanityRelationship[]> {
    const seen = new Set<string>();
    const result: SanityRelationship[] = [];
    for (const id of entityIds) {
      const rels = await sanityClient.getRelationshipsForEntity(id);
      for (const rel of rels) {
        if (!seen.has(rel._id)) {
          seen.add(rel._id);
          result.push(rel);
        }
      }
    }
    return result;
  },

  async resolveSources(sourceIds: string[]): Promise<SanitySource[]> {
    const result: SanitySource[] = [];
    for (const sid of sourceIds) {
      const src = await sanityClient.getSourceById(sid);
      if (src) result.push(src);
    }
    return result;
  },

  async fetchConflicts(): Promise<SanityConflict[]> {
    return sanityClient.getConflicts();
  },

  /**
   * Executes a full multi-pass retrieval for the given entities and question.
   * This is the primary entry point for the investigation agent.
   */
  async executeInvestigationRetrieval(
    entities: SanityEntity[],
    question: string
  ): Promise<AgentRetrievalBundle> {
    const entityIds = entities.map(e => e._id);

    // Collect claims for all resolved entities
    const claimIdsSeen = new Set<string>();
    const resolvedClaims: SanityClaim[] = [];
    for (const ent of entities) {
      const claims = await sanityClient.getClaimsForEntity(ent._id);
      for (const c of claims) {
        if (!claimIdsSeen.has(c._id)) {
          claimIdsSeen.add(c._id);
          resolvedClaims.push(c);
        }
      }
    }

    const relationships = await this.traverseRelationships(entityIds);

    // Collect source IDs from claims and relationships
    const sourceIds = new Set<string>();
    resolvedClaims.forEach(c => {
      if (Array.isArray(c.sources)) {
        c.sources.forEach(s => { if (s?._ref) sourceIds.add(s._ref); });
      }
    });
    relationships.forEach(r => {
      if (Array.isArray(r.evidence)) {
        r.evidence.forEach(s => { if (s?._ref) sourceIds.add(s._ref); });
      }
    });

    const sources = await this.resolveSources(Array.from(sourceIds));
    const knowledgeDocs = await this.retrieveKnowledge(question);
    const conflicts = await this.fetchConflicts();

    return { entities, claims: resolvedClaims, sources, relationships, conflicts, knowledgeDocs };
  },
};
