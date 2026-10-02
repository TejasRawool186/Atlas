/**
 * ATLAS — Sanity Introspection & Knowledge Base Routes
 */

import { Router, Request, Response } from 'express';
import { sanityClient } from '../services/sanity/client.ts';
import { corpusEngine } from '../services/sanity/corpus.ts';

export const sanityRouter = Router();

// GET /api/sanity/config — connection metadata (no tokens)
sanityRouter.get('/config', (_req: Request, res: Response) => {
  res.json(sanityClient.getPublicMetadata());
});

// GET /api/sanity/status — connection status
sanityRouter.get('/status', (_req: Request, res: Response) => {
  res.json(sanityClient.getConnectionStatus());
});

// GET /api/sanity/schema — discovered schemas
sanityRouter.get('/schema', (_req: Request, res: Response) => {
  const schemas = sanityClient.getSchemas();
  res.json({ schemas });
});

// GET /api/sanity/knowledge — Layer B knowledge docs
sanityRouter.get('/knowledge', async (_req: Request, res: Response) => {
  const docs = await sanityClient.getAllKnowledgeDocs();
  res.json({ docs });
});

// GET /api/sanity/entities — Layer A entities
sanityRouter.get('/entities', async (_req: Request, res: Response) => {
  const entities = await sanityClient.findEntities('');
  res.json({ entities });
});

// GET /api/sanity/claims — Layer A claims
sanityRouter.get('/claims', (_req: Request, res: Response) => {
  const claims = corpusEngine.getAllClaims();
  res.json({ claims });
});

// GET /api/sanity/sources — Layer A sources
sanityRouter.get('/sources', (_req: Request, res: Response) => {
  const sources = corpusEngine.getAllSources();
  res.json({ sources });
});

// GET /api/sanity/stats — corpus document counts per type
sanityRouter.get('/stats', (_req: Request, res: Response) => {
  const stats = corpusEngine.getStats();
  res.json({ stats, mode: sanityClient.getConnectionStatus().mode });
});

// POST /api/sanity/query — GROQ query endpoint
sanityRouter.post('/query', async (req: Request, res: Response) => {
  const { groq, params } = req.body as { groq?: string; params?: Record<string, unknown> };
  if (!groq || typeof groq !== 'string') {
    res.status(400).json({ error: 'GROQ query string is required' });
    return;
  }
  try {
    const result = await sanityClient.queryStructuredContent(groq, params);
    res.json({ query: groq, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'GROQ execution failed';
    res.status(500).json({ error: message });
  }
});

// POST /api/sanity/extract-url — Fetches and parses an article URL for preview
sanityRouter.post('/extract-url', async (req: Request, res: Response) => {
  const { url, title, docType, author } = req.body as {
    url?: string;
    title?: string;
    docType?: string;
    author?: string;
  };

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'A valid url parameter is required' });
    return;
  }

  try {
    const { articleExtractor } = await import('../services/sanity/extractor.ts');
    const extracted = await articleExtractor.fetchAndExtract(url, { title, docType, author });
    res.json({ success: true, article: extracted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Article extraction failed';
    res.status(500).json({ error: message });
  }
});

// POST /api/sanity/ingest-url — Fetches, extracts, and stores an article into Sanity
sanityRouter.post('/ingest-url', async (req: Request, res: Response) => {
  const { url, title, docType, author, summary, content, extractedClaims } = req.body as {
    url?: string;
    title?: string;
    docType?: string;
    author?: string;
    summary?: string;
    content?: string;
    extractedClaims?: string[];
  };

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'A valid url parameter is required' });
    return;
  }

  try {
    const { articleExtractor } = await import('../services/sanity/extractor.ts');
    // If summary & claims were already verified by the user in preview, use them; otherwise extract:
    let finalDoc = {
      title: title || '',
      docType: docType || 'technical_rfc',
      author: author || '',
      summary: summary || '',
      content: content || '',
      extractedClaims: extractedClaims || [],
      suggestedQuestions: [] as string[],
    };

    if (!finalDoc.summary || finalDoc.extractedClaims.length === 0) {
      const extracted = await articleExtractor.fetchAndExtract(url, { title, docType, author });
      finalDoc = {
        title: title || extracted.title,
        docType: docType || extracted.docType,
        author: author || extracted.author,
        summary: summary || extracted.summary,
        content: content || extracted.content,
        extractedClaims: extractedClaims && extractedClaims.length > 0 ? extractedClaims : extracted.extractedClaims,
        suggestedQuestions: extracted.suggestedQuestions,
      };
    } else {
      finalDoc.suggestedQuestions = [
        `What are the core statements established in ${finalDoc.title}?`,
        `Does ${finalDoc.title} contradict existing specifications?`,
      ];
    }

    const saved = await sanityClient.createKnowledgeDoc({
      title: finalDoc.title,
      docType: finalDoc.docType,
      sourceUrl: url,
      author: finalDoc.author,
      summary: finalDoc.summary,
      content: finalDoc.content,
      extractedClaims: finalDoc.extractedClaims,
    });

    res.json({
      success: true,
      document: saved.doc,
      entity: saved.entity,
      claims: saved.claims,
      liveSanityCreated: saved.liveSanityCreated,
      suggestedQuestions: finalDoc.suggestedQuestions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'URL ingestion failed';
    res.status(500).json({ error: message });
  }
});

// POST /api/sanity/topic — Manually publishes a custom topic / doc into Sanity
sanityRouter.post('/topic', async (req: Request, res: Response) => {
  const { title, docType, author, summary, content, extractedClaims, sourceUrl } = req.body as {
    title?: string;
    docType?: string;
    author?: string;
    summary?: string;
    content?: string;
    extractedClaims?: string[];
    sourceUrl?: string;
  };

  if (!title || !summary) {
    res.status(400).json({ error: 'title and summary are required' });
    return;
  }

  try {
    const saved = await sanityClient.createKnowledgeDoc({
      title,
      docType: docType || 'technical_rfc',
      sourceUrl: sourceUrl || 'https://atlas.local/manual-topic',
      author: author || 'ATLAS Contributor',
      summary,
      content: content || summary,
      extractedClaims: extractedClaims && extractedClaims.length > 0 ? extractedClaims : [summary],
    });

    const suggestedQuestions = [
      `What are the core requirements and statements defined in ${title}?`,
      `According to ${author || 'the author'}, does ${title} specify any constraints?`,
      `Does ${title} supersede any prior policies?`,
    ];

    res.json({
      success: true,
      document: saved.doc,
      entity: saved.entity,
      claims: saved.claims,
      liveSanityCreated: saved.liveSanityCreated,
      suggestedQuestions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Topic creation failed';
    res.status(500).json({ error: message });
  }
});
