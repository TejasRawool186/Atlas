/**
 * ATLAS — Knowledge Base Retrieval Service
 * Handles Layer B (sourced documentation) queries through live Sanity or local corpus.
 */

import { sanityClient } from './client.ts';
import { SanityKnowledgeDoc } from './types.ts';

export class KnowledgeBaseService {
  public async search(query: string): Promise<SanityKnowledgeDoc[]> {
    return sanityClient.searchKnowledge(query);
  }

  public async getAll(): Promise<SanityKnowledgeDoc[]> {
    return sanityClient.getAllKnowledgeDocs();
  }

  public async count(): Promise<number> {
    const docs = await this.getAll();
    return docs.length;
  }
}

export const knowledgeBase = new KnowledgeBaseService();
