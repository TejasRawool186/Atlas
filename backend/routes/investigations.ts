/**
 * ATLAS — Investigation API Routes
 */

import { Router, Request, Response } from 'express';
import { atlasStore } from '../store.ts';
import { atlasAgent, InvestigationEvent, InvestigationState } from '../agent/langgraph.ts';

export const investigationsRouter = Router();

// GET /api/investigations
investigationsRouter.get('/', (_req: Request, res: Response) => {
  const all = atlasStore.getAllInvestigations().map(inv => ({
    id: inv.investigationId,
    question: inv.question,
    status: inv.status,
    verdict: inv.verdict,
    createdAt: inv.createdAt,
    completedAt: inv.completedAt,
    certificateId: inv.certificate?.certificateId ?? null,
  }));
  res.json({ investigations: all });
});

// POST /api/investigations
investigationsRouter.post('/', (req: Request, res: Response) => {
  const { question } = req.body as { question?: string };
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    res.status(400).json({ error: 'question is required and must be a non-empty string' });
    return;
  }

  const id = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = new Date().toISOString();

  const initialState: InvestigationState = {
    investigationId: id,
    question: question.trim(),
    status: 'created',
    currentStep: 'CREATED',
    entities: [],
    claims: [],
    sources: [],
    relationships: [],
    conflicts: [],
    knowledgeDocs: [],
    evidenceGraph: null,
    answer: null,
    auditReport: null,
    verdict: null,
    certificate: null,
    errors: [],
    events: [{ type: 'investigation.created', timestamp: now, data: { id, question: question.trim() } }],
    plan: null,
    createdAt: now,
  };

  atlasStore.saveInvestigation(initialState);
  res.status(201).json({ id, status: 'created' });
});

// POST /api/investigations/:id/run
investigationsRouter.post('/:id/run', (req: Request, res: Response) => {
  const id = req.params.id;
  const investigation = atlasStore.getInvestigation(id);

  if (!investigation) {
    res.status(404).json({ error: `Investigation ${id} not found` });
    return;
  }

  res.json({ id, status: 'planning' });

  // Run asynchronously — do not block the HTTP response
  setImmediate(async () => {
    try {
      const finalState = await atlasAgent.runWorkflow(id, investigation.question, (ev: InvestigationEvent) => {
        atlasStore.broadcastEvent(id, ev);
      });
      atlasStore.saveInvestigation(finalState);
    } catch (err) {
      console.error(`[InvestigationsRouter] Run failed for ${id}:`, err);
    }
  });
});

// GET /api/investigations/:id
investigationsRouter.get('/:id', (req: Request, res: Response) => {
  const inv = atlasStore.getInvestigation(req.params.id);
  if (!inv) { res.status(404).json({ error: `Investigation ${req.params.id} not found` }); return; }

  res.json({
    id: inv.investigationId,
    question: inv.question,
    status: inv.status,
    currentStep: inv.currentStep,
    answer: inv.answer,
    verdict: inv.verdict,
    verdictRationale: inv.auditReport?.verdictRationale ?? null,
    certificateId: inv.certificate?.certificateId ?? null,
    evidenceRoot: inv.certificate?.evidenceRoot ?? null,
    plan: inv.plan,
    stats: {
      entitiesCount: inv.entities.length,
      claimsCount: inv.claims.length,
      sourcesCount: inv.sources.length,
      relationshipsCount: inv.relationships.length,
      conflictsCount: inv.conflicts.length,
      knowledgeDocsCount: inv.knowledgeDocs.length,
    },
    errors: inv.errors,
    createdAt: inv.createdAt,
    completedAt: inv.completedAt ?? null,
  });
});

// GET /api/investigations/:id/evidence
investigationsRouter.get('/:id/evidence', (req: Request, res: Response) => {
  const inv = atlasStore.getInvestigation(req.params.id);
  if (!inv) { res.status(404).json({ error: `Investigation ${req.params.id} not found` }); return; }

  if (!inv.evidenceGraph) {
    res.json({ nodes: [], edges: [], claims: [], sources: [], conflicts: [], knowledgeDocs: [], stats: { directCount: 0, relationalCount: 0, inferredCount: 0, contradictedCount: 0 } });
    return;
  }
  res.json(inv.evidenceGraph);
});

// GET /api/investigations/:id/audit
investigationsRouter.get('/:id/audit', (req: Request, res: Response) => {
  const inv = atlasStore.getInvestigation(req.params.id);
  if (!inv) { res.status(404).json({ error: `Investigation ${req.params.id} not found` }); return; }

  if (!inv.auditReport) {
    res.json({ status: 'pending', probes: [], summary: { passCount: 0, warningCount: 0, failCount: 0, resilienceScore: 0 } });
    return;
  }
  res.json(inv.auditReport);
});

// GET /api/investigations/:id/events (SSE)
investigationsRouter.get('/:id/events', (req: Request, res: Response) => {
  const id = req.params.id;
  const inv = atlasStore.getInvestigation(id);
  if (!inv) { res.status(404).json({ error: `Investigation ${id} not found` }); return; }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Replay historical events
  for (const ev of inv.events) {
    res.write(`event: ${ev.type}\ndata: ${JSON.stringify(ev.data)}\n\n`);
  }

  // Subscribe to future events
  const unsubscribe = atlasStore.subscribeToEvents(id, (ev: InvestigationEvent) => {
    res.write(`event: ${ev.type}\ndata: ${JSON.stringify(ev.data)}\n\n`);
  });

  const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 20000);

  req.on('close', () => { clearInterval(heartbeat); unsubscribe(); });
});
