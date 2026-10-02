/**
 * ATLAS — Certificate & Verification API Routes
 */

import { Router, Request, Response } from 'express';
import { atlasStore } from '../store.ts';
import { certificateEngine } from '../agent/certificate.ts';

export const certificatesRouter = Router();

// GET /api/certificates/:id
certificatesRouter.get('/:id', (req: Request, res: Response) => {
  const cert = atlasStore.getCertificate(req.params.id);
  if (!cert) { res.status(404).json({ error: `Certificate ${req.params.id} not found` }); return; }
  res.json(cert);
});

// POST /api/certificates/:id/verify
certificatesRouter.post('/:id/verify', (req: Request, res: Response) => {
  const cert = atlasStore.getCertificate(req.params.id);
  if (!cert) { res.status(404).json({ error: `Certificate ${req.params.id} not found` }); return; }

  const { tamperedEvidence } = (req.body || {}) as { tamperedEvidence?: Record<string, unknown> };
  const result = certificateEngine.verifyCertificate(cert, tamperedEvidence as any);
  res.json(result);
});
