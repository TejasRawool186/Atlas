/**
 * ATLAS — Sanity Service Client
 * Handles all communication with Sanity Content Lake and the Context MCP endpoint.
 * When SANITY_PROJECT_ID and SANITY_API_TOKEN are configured, all queries hit the
 * live Sanity Content Lake via HTTP. Falls back to the local corpus otherwise.
 */

import { atlasConfig } from '../../config/env.ts';
import { corpusEngine } from './corpus.ts';
import {
  SanitySchemaDefinition,
  SanityEntity,
  SanityClaim,
  SanitySource,
  SanityRelationship,
  SanityConflict,
  SanityKnowledgeDoc,
  SanityConnectionStatus,
} from './types.ts';

export class SanityClient {
  private get cfg() { return atlasConfig.sanity; }

  public getConnectionStatus(): SanityConnectionStatus {
    return {
      connected: this.cfg.isConfigured,
      mode: this.cfg.isConfigured ? 'live' : 'local-corpus',
      projectId: this.cfg.projectId,
      dataset: this.cfg.dataset,
      apiVersion: this.cfg.apiVersion,
      contextUrl: this.cfg.contextUrl,
    };
  }

  public getPublicMetadata() {
    const corpusStats = corpusEngine.getStats();
    return {
      projectId: this.cfg.projectId || '(not configured)',
      dataset: this.cfg.dataset,
      apiVersion: this.cfg.apiVersion,
      contextUrl: this.cfg.contextUrl,
      mode: this.cfg.isConfigured ? 'live' : 'local-corpus',
      publicDatasetUrl: this.cfg.projectId
        ? `https://${this.cfg.projectId}.api.sanity.io/v${this.cfg.apiVersion}/data/query/${this.cfg.dataset}`
        : null,
      corpusStats,
    };
  }

  // ─── Core HTTP query ─────────────────────────────────────────────────────

  public async queryStructuredContent(groq: string, params?: Record<string, any>): Promise<any> {
    if (this.cfg.isConfigured && this.cfg.projectId && this.cfg.apiToken) {
      try {
        const url = `https://${this.cfg.projectId}.api.sanity.io/v${this.cfg.apiVersion}/data/query/${this.cfg.dataset}?query=${encodeURIComponent(groq)}`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${this.cfg.apiToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Sanity HTTP ${res.status}: ${errText}`);
        }
        const data = await res.json();
        if (data?.result !== undefined) return data.result;
        throw new Error('Sanity returned no result');
      } catch (err) {
        console.error('[SanityClient] Live query failed, falling back to local corpus:', err);
      }
    }
    return corpusEngine.executeGroq(groq, params);
  }

  // ─── Schema ──────────────────────────────────────────────────────────────

  public getSchemas(): SanitySchemaDefinition[] {
    return corpusEngine.getSchemas();
  }

  // ─── Entities ────────────────────────────────────────────────────────────

  public async findEntities(query: string): Promise<SanityEntity[]> {
    if (this.cfg.isConfigured) {
      const q = query.toLowerCase();
      // Search name, description and aliases in live Sanity
      const groq = `*[_type == "entity" && (
        lower(name) match "*${q}*" ||
        lower(description) match "*${q}*" ||
        lower(pt::text(coalesce(aliases, []))) match "*${q}*"
      )]`;
      try {
        const results = await this.queryStructuredContent(groq) as SanityEntity[];
        if (results && results.length > 0) return results;
      } catch {
        // fall through to corpus
      }
    }
    return corpusEngine.findEntitiesByQuery(query);
  }

  public getEntity(id: string): SanityEntity | undefined {
    return corpusEngine.getEntity(id);
  }

  // ─── Claims ───────────────────────────────────────────────────────────────

  public async getClaimsForEntity(entityId: string): Promise<SanityClaim[]> {
    if (this.cfg.isConfigured) {
      const groq = `*[_type == "claim" && (subject._ref == "${entityId}")]`;
      try {
        const results = await this.queryStructuredContent(groq) as SanityClaim[];
        if (results && results.length > 0) return results;
      } catch {
        // fall through to corpus
      }
    }
    return corpusEngine.getClaimsForEntity(entityId);
  }

  public async getAllClaims(): Promise<SanityClaim[]> {
    if (this.cfg.isConfigured) {
      try {
        const results = await this.queryStructuredContent('*[_type == "claim"]') as SanityClaim[];
        if (results && results.length > 0) return results;
      } catch { /* fall through */ }
    }
    return corpusEngine.getAllClaims();
  }

  // ─── Sources ─────────────────────────────────────────────────────────────

  public async getAllSources(): Promise<SanitySource[]> {
    if (this.cfg.isConfigured) {
      try {
        const results = await this.queryStructuredContent('*[_type == "source"]') as SanitySource[];
        if (results && results.length > 0) return results;
      } catch { /* fall through */ }
    }
    return corpusEngine.getAllSources();
  }

  public getSource(id: string): SanitySource | undefined {
    return corpusEngine.getSource(id);
  }

  public async getSourceById(id: string): Promise<SanitySource | undefined> {
    if (this.cfg.isConfigured) {
      try {
        const results = await this.queryStructuredContent(`*[_type == "source" && _id == "${id}"][0]`) as SanitySource;
        if (results) return results;
      } catch { /* fall through */ }
    }
    return corpusEngine.getSource(id);
  }

  // ─── Relationships ────────────────────────────────────────────────────────

  public async getRelationshipsForEntity(entityId: string): Promise<SanityRelationship[]> {
    if (this.cfg.isConfigured) {
      const groq = `*[_type == "relationship" && (sourceEntity._ref == "${entityId}" || targetEntity._ref == "${entityId}")]`;
      try {
        const results = await this.queryStructuredContent(groq) as SanityRelationship[];
        if (results && results.length > 0) return results;
      } catch { /* fall through */ }
    }
    return corpusEngine.getRelationshipsForEntity(entityId);
  }

  // ─── Conflicts ────────────────────────────────────────────────────────────

  public async getConflicts(): Promise<SanityConflict[]> {
    if (this.cfg.isConfigured) {
      try {
        const results = await this.queryStructuredContent('*[_type == "conflict"]') as SanityConflict[];
        if (results && results.length > 0) return results;
      } catch { /* fall through */ }
    }
    return corpusEngine.getAllConflicts();
  }

  // ─── Knowledge Base ───────────────────────────────────────────────────────

  public async searchKnowledge(query: string): Promise<SanityKnowledgeDoc[]> {
    if (this.cfg.isConfigured) {
      const terms = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      if (terms.length > 0) {
        const conditions = terms
          .slice(0, 3) // limit to 3 terms to keep GROQ manageable
          .map(t => `lower(title) match "*${t}*" || lower(summary) match "*${t}*" || lower(pt::text(coalesce(extractedClaims, []))) match "*${t}*"`)
          .join(' || ');
        const groq = `*[_type == "knowledge_doc" && (${conditions})]`;
        try {
          const results = await this.queryStructuredContent(groq) as SanityKnowledgeDoc[];
          if (results && results.length > 0) return results;
        } catch { /* fall through */ }
      }
    }
    return corpusEngine.searchKnowledge(query);
  }

  public async getAllKnowledgeDocs(): Promise<SanityKnowledgeDoc[]> {
    if (this.cfg.isConfigured) {
      try {
        const results = await this.queryStructuredContent('*[_type == "knowledge_doc"]') as SanityKnowledgeDoc[];
        if (results && results.length > 0) return results;
      } catch { /* fall through */ }
    }
    return corpusEngine.getAllKnowledgeDocs();
  }

  /**
   * Creates and stores a new knowledge document into Sanity Content Lake.
   * If live credentials are set, pushes mutations via HTTP API.
   * Also always registers in corpusEngine for instant local query availability.
   */
  public async createKnowledgeDoc(data: {
    title: string;
    docType: string;
    sourceUrl: string;
    publishedAt?: string;
    author: string;
    summary: string;
    content?: string;
    extractedClaims?: string[];
  }): Promise<{
    doc: SanityKnowledgeDoc;
    entity: SanityEntity;
    claims: SanityClaim[];
    liveSanityCreated: boolean;
    liveSanityError?: string | null;
  }> {
    // 1. Add to local corpus engine
    const localResult = corpusEngine.addKnowledgeDoc(data);

    // 2. If configured with live Sanity API Token, send mutations to live Content Lake
    let liveSanityCreated = false;
    let liveSanityError: string | null = null;
    if (this.cfg.isConfigured && this.cfg.projectId && this.cfg.apiToken) {
      try {
        const mutateUrl = `https://${this.cfg.projectId}.api.sanity.io/v${this.cfg.apiVersion}/data/mutate/${this.cfg.dataset}`;
        
        const mutations: any[] = [
          {
            createOrReplace: {
              _id: localResult.source._id,
              _type: 'source',
              title: localResult.source.title,
              url: localResult.source.url,
              publisher: localResult.source.publisher,
              publishedAt: localResult.source.publishedAt,
              sourceType: localResult.source.sourceType,
              author: localResult.source.author,
              excerpt: localResult.source.excerpt,
            },
          },
          {
            createOrReplace: {
              _id: localResult.entity._id,
              _type: 'entity',
              name: localResult.entity.name,
              entityType: localResult.entity.entityType,
              description: localResult.entity.description,
              aliases: localResult.entity.aliases,
            },
          },
          {
            createOrReplace: {
              _id: localResult.doc._id,
              _type: 'knowledge_doc',
              title: localResult.doc.title,
              docType: localResult.doc.docType,
              sourceUrl: localResult.doc.sourceUrl,
              publishedAt: localResult.doc.publishedAt,
              author: localResult.doc.author,
              summary: localResult.doc.summary,
              content: localResult.doc.content,
              extractedClaims: localResult.doc.extractedClaims,
              referencedEntities: localResult.doc.referencedEntities,
            },
          },
        ];

        // Add claim mutations
        for (const cl of localResult.claims) {
          mutations.push({
            createOrReplace: {
              _id: cl._id,
              _type: 'claim',
              statement: cl.statement,
              subject: { _type: 'reference', _ref: localResult.entity._id },
              predicate: cl.predicate,
              object: cl.object || cl.statement,
              sources: [{ _type: 'reference', _ref: localResult.source._id }],
              validFrom: cl.validFrom,
              status: cl.status,
              confidence: cl.confidence,
            },
          });
        }

        const res = await fetch(mutateUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.cfg.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mutations }),
        });

        if (res.ok) {
          liveSanityCreated = true;
          console.log(`[SanityClient] Successfully created documents in live Sanity Lake (Doc: ${localResult.doc._id})`);
        } else {
          const errText = await res.text();
          console.warn(`[SanityClient] Live Sanity mutation returned ${res.status}: ${errText}`);
        }
      } catch (err) {
        console.warn('[SanityClient] Live Sanity mutation failed, preserved in local corpus:', err);
      }
    }

    return {
      doc: localResult.doc,
      entity: localResult.entity,
      claims: localResult.claims,
      liveSanityCreated,
      liveSanityError,
    };
  }
}

export const sanityClient = new SanityClient();
