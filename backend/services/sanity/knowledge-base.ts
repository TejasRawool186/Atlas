/**
 * ATLAS — Knowledge Base Retrieval Service
 * Handles Layer B (sourced documentation) queries through Sanity or local corpus.
 */

import { sanityClient } from './client.ts';
import { SanityKnowledgeDoc } from './types.ts';

export class KnowledgeBaseService {
  /**
   * Search the knowledge base for documents relevant to a query.
   * Preserves source citations and publisher metadata.
   */
  public search(query: string): SanityKnowledgeDoc[] {
    return sanityClient.searchKnowledge(query);
  }

  /**
   * Return all knowledge documents.
   */
  public getAll(): SanityKnowledgeDoc[] {
    return sanityClient.getAllKnowledgeDocs();
  }

  /**
   * Returns the count of knowledge documents in the current corpus.
   */
  public count(): number {
    return this.getAll().length;
  }
}

export const knowledgeBase = new KnowledgeBaseService();
