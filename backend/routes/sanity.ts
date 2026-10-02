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
sanityRouter.get('/knowledge', (_req: Request, res: Response) => {
  const docs = sanityClient.getAllKnowledgeDocs();
  res.json({ docs });
});

// GET /api/sanity/entities — Layer A entities
sanityRouter.get('/entities', (_req: Request, res: Response) => {
  const entities = corpusEngine.getAllEntities();
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
