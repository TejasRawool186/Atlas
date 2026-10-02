/**
 * ATLAS — Sanity Service Client
 * Handles all communication with Sanity Content Lake and the Context MCP endpoint.
 * Falls back to the local corpus when live Sanity credentials are not configured.
 */

import { atlasConfig } from '../../config/env.ts';
import { corpusEngine } from './corpus.ts';import {
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

  /**
   * Returns the current connection status without exposing credentials.
   */
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

  /**
   * Returns config metadata safe for the API response (no tokens).
   */
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

  public getSchemas(): SanitySchemaDefinition[] {
    return corpusEngine.getSchemas();
  }

  public searchKnowledge(query: string): SanityKnowledgeDoc[] {
    return corpusEngine.searchKnowledge(query);
  }

  public getAllKnowledgeDocs(): SanityKnowledgeDoc[] {
    return corpusEngine.getAllKnowledgeDocs();
  }

  public findEntities(query: string): SanityEntity[] {
    return corpusEngine.findEntitiesByQuery(query);
  }

  public getClaimsForEntity(entityId: string): SanityClaim[] {
    return corpusEngine.getClaimsForEntity(entityId);
  }

  public getRelationshipsForEntity(entityId: string): SanityRelationship[] {
    return corpusEngine.getRelationshipsForEntity(entityId);
  }

  public getConflicts(): SanityConflict[] {
    return corpusEngine.getAllConflicts();
  }

  public getAllSources(): SanitySource[] {
    return corpusEngine.getAllSources();
  }

  public getSource(id: string): SanitySource | undefined {
    return corpusEngine.getSource(id);
  }

  public getEntity(id: string): SanityEntity | undefined {
    return corpusEngine.getEntity(id);
  }

  /**
   * Executes a GROQ query. When live Sanity credentials are present, queries
   * the real Content Lake via HTTP. Otherwise uses the local corpus engine.
   */
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
}

export const sanityClient = new SanityClient();
