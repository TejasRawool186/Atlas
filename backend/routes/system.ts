/**
 * ATLAS — System Health & Status Routes
 */

import { Router, Request, Response } from 'express';
import { llmProvider } from '../llm/provider.ts';
import { sanityClient } from '../services/sanity/client.ts';
import { atlasConfig } from '../config/env.ts';

export const systemRouter = Router();

// GET /api/health
systemRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// GET /api/system/status
systemRouter.get('/system/status', (_req: Request, res: Response) => {
  const sanityStatus = sanityClient.getConnectionStatus();

  res.json({
    api: 'online',
    sanity: sanityStatus.connected ? 'connected' : 'local-corpus',
    sanityMode: sanityStatus.mode,
    knowledgeBase: 'ready',
    llm: llmProvider.isAvailable() ? `ready (${llmProvider.getProviderName()})` : 'unavailable — configure GEMINI_API_KEY',
    certificate: atlasConfig.certificate.isDefaultSecret
      ? 'degraded — CERTIFICATE_HMAC_SECRET not configured'
      : 'ready',
    metadata: {
      projectId: sanityStatus.projectId || '(not configured)',
      dataset: sanityStatus.dataset,
      apiVersion: sanityStatus.apiVersion,
      contextUrl: sanityStatus.contextUrl,
      agentOrchestrator: 'LangGraph State Machine',
      auditorProtocol: 'Lethe 10-Probe Epistemic Specification',
      cryptographicSignature: 'HMAC-SHA256 Merkle Tree',
    },
  });
});
