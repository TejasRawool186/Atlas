/**
 * ATLAS — Frontend API Client
 * Centralised fetch layer. All backend calls go through here — never raw fetch in components.
 */

import type {
  InvestigationSummary,
  InvestigationDetail,
  EvidenceGraphResponse,
  AuditReportResponse,
  AtlasCertificateResponse,
  CertificateVerificationResponse,
  SystemStatusResponse,
  SanityConfigResponse,
  InvestigationEvent,
} from './types.ts';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status} — ${url}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // ── System ──────────────────────────────────────────────────────────────
  getSystemStatus: () =>
    request<SystemStatusResponse>('/api/system/status'),

  getSanityConfig: () =>
    request<SanityConfigResponse>('/api/sanity/config'),

  // ── Investigations ───────────────────────────────────────────────────────
  getInvestigations: () =>
    request<{ investigations: InvestigationSummary[] }>('/api/investigations'),

  createInvestigation: (question: string) =>
    request<{ id: string; status: string }>('/api/investigations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    }),

  runInvestigation: (id: string) =>
    request<{ id: string; status: string }>(`/api/investigations/${id}/run`, { method: 'POST' }),

  getInvestigation: (id: string) =>
    request<InvestigationDetail>(`/api/investigations/${id}`),

  getEvidence: (id: string) =>
    request<EvidenceGraphResponse>(`/api/investigations/${id}/evidence`),

  getAudit: (id: string) =>
    request<AuditReportResponse>(`/api/investigations/${id}/audit`),

  // ── Certificates ─────────────────────────────────────────────────────────
  getCertificate: (id: string) =>
    request<AtlasCertificateResponse>(`/api/certificates/${id}`),

  verifyCertificate: (certificateId: string, tamperedEvidence?: unknown) =>
    request<CertificateVerificationResponse>(`/api/certificates/${certificateId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tamperedEvidence }),
    }),

  // ── Sanity ────────────────────────────────────────────────────────────────
  getSanitySchemas: () =>
    request<{ schemas: unknown[] }>('/api/sanity/schema'),

  getSanityKnowledge: () =>
    request<{ docs: unknown[] }>('/api/sanity/knowledge'),

  runGroqQuery: (groq: string) =>
    request<{ query: string; result: unknown }>('/api/sanity/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groq }),
    }),

  extractFromUrl: (payload: { url: string; title?: string; docType?: string; author?: string }) =>
    request<{
      success: boolean;
      article: {
        title: string;
        docType: string;
        sourceUrl: string;
        author: string;
        publishedAt: string;
        summary: string;
        content: string;
        extractedClaims: string[];
        suggestedQuestions: string[];
      };
    }>('/api/sanity/extract-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  ingestFromUrl: (payload: {
    url: string;
    title?: string;
    docType?: string;
    author?: string;
    summary?: string;
    content?: string;
    extractedClaims?: string[];
  }) =>
    request<{
      success: boolean;
      document: any;
      entity: any;
      claims: any[];
      liveSanityCreated: boolean;
      suggestedQuestions: string[];
    }>('/api/sanity/ingest-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  createTopic: (payload: {
    title: string;
    docType?: string;
    author?: string;
    summary: string;
    content?: string;
    extractedClaims?: string[];
    sourceUrl?: string;
  }) =>
    request<{
      success: boolean;
      document: any;
      entity: any;
      claims: any[];
      liveSanityCreated: boolean;
      suggestedQuestions: string[];
    }>('/api/sanity/topic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  // ── SSE Event Stream ──────────────────────────────────────────────────────
  subscribeToInvestigationEvents: (
    id: string,
    onMessage: (event: InvestigationEvent) => void,
    onError?: (err: Event) => void
  ): (() => void) => {
    const es = new EventSource(`/api/investigations/${id}/events`);

    const eventNames = [
      'investigation.created', 'investigation.planning',
      'sanity.schema.loaded', 'sanity.query.started', 'sanity.query.completed',
      'knowledge.retrieved', 'evidence.built', 'answer.generated',
      'audit.started', 'audit.probe.completed', 'conflict.detected',
      'audit.completed', 'certificate.generated',
      'investigation.completed', 'investigation.failed',
    ];

    for (const name of eventNames) {
      es.addEventListener(name, (e: MessageEvent) => {
        try { onMessage({ type: name, data: JSON.parse(e.data) }); }
        catch { /* ignore parse errors */ }
      });
    }

    if (onError) es.onerror = onError;

    return () => es.close();
  },
};
