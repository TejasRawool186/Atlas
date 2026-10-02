/**
 * ATLAS — Frontend Type Definitions
 * Mirrors the backend API contract exactly.
 */

export type InvestigationStatus =
  | 'created' | 'planning' | 'retrieving' | 'analyzing'
  | 'auditing' | 'certifying' | 'completed' | 'failed';

export type Verdict =
  | 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'CONTRADICTED' | 'INSUFFICIENT_EVIDENCE';

export type ProbeId =
  | 'grounding' | 'unsupported_claims' | 'contradiction' | 'temporal_consistency'
  | 'entity_consistency' | 'relationship_validity' | 'inference_detection'
  | 'source_removal' | 'alternate_interpretation' | 'missing_evidence';

export type ProbeStatus = 'PASS' | 'WARNING' | 'FAIL' | 'NOT_APPLICABLE';

// ─── Investigation ─────────────────────────────────────────────────────────

export interface InvestigationSummary {
  id: string;
  question: string;
  status: InvestigationStatus;
  verdict: Verdict | null;
  createdAt: string;
  completedAt: string | null;
  certificateId: string | null;
}

export interface InvestigationPlan {
  intent: string;
  identifiedEntities: string[];
  temporalConstraints?: string;
  requiredSchemas: string[];
  retrievalSteps: string[];
}

export interface InvestigationStats {
  entitiesCount: number;
  claimsCount: number;
  sourcesCount: number;
  relationshipsCount: number;
  conflictsCount: number;
  knowledgeDocsCount: number;
}

export interface InvestigationDetail {
  id: string;
  question: string;
  status: InvestigationStatus;
  currentStep: string;
  answer: string | null;
  verdict: Verdict | null;
  verdictRationale: string | null;
  certificateId: string | null;
  evidenceRoot: string | null;
  plan: InvestigationPlan | null;
  stats: InvestigationStats;
  errors: string[];
  createdAt: string;
  completedAt: string | null;
}

export interface InvestigationEvent {
  type: string;
  data: Record<string, unknown>;
}

// ─── Evidence Graph ────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  type: 'entity' | 'claim' | 'source' | 'event' | 'conflict' | 'knowledge_doc';
  label: string;
  category?: string;
  status?: string;
  metadata: Record<string, unknown>;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  isConflict?: boolean;
}

export interface EvidenceStats {
  directCount: number;
  relationalCount: number;
  inferredCount: number;
  contradictedCount: number;
}

export interface EvidenceGraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  claims: unknown[];
  sources: unknown[];
  conflicts: unknown[];
  knowledgeDocs: unknown[];
  stats: EvidenceStats;
}

// ─── Audit ─────────────────────────────────────────────────────────────────

export interface AuditProbeResult {
  probeId: ProbeId;
  name: string;
  status: ProbeStatus;
  summary: string;
  details: string;
  evidenceIds: string[];
  adversarialScore: number;
}

export interface AuditSummary {
  passCount: number;
  warningCount: number;
  failCount: number;
  resilienceScore: number;
}

export interface AuditReportResponse {
  status: 'COMPLETED' | 'FAILED' | 'pending';
  probes: AuditProbeResult[];
  verdict: Verdict;
  verdictRationale: string;
  summary: AuditSummary;
}

// ─── Certificate ───────────────────────────────────────────────────────────

export interface MerkleLeaf {
  hash: string;
  type: string;
  id: string;
  summary: string;
}

export interface AtlasCertificateResponse {
  certificateId: string;
  investigationId: string;
  question: string;
  verdict: Verdict;
  evidenceCount: number;
  claimCount: number;
  sourceCount: number;
  relationshipCount: number;
  conflictCount: number;
  evidenceRoot: string;
  signature: string;
  algorithm: string;
  createdAt: string;
  merkleTree: {
    leaves: MerkleLeaf[];
    root: string;
    depth: number;
  };
}

export interface CertificateVerificationResponse {
  valid: boolean;
  evidenceRootValid: boolean;
  signatureValid: boolean;
  certificateId: string;
  investigationId: string;
  recomputedRoot: string;
  storedRoot: string;
  expectedSignature: string;
  providedSignature: string;
  tamperDetected: boolean;
  message: string;
  verifiedAt: string;
}

// ─── System ────────────────────────────────────────────────────────────────

export interface SystemStatusMetadata {
  projectId: string;
  dataset: string;
  apiVersion: string;
  contextUrl: string;
  agentOrchestrator: string;
  auditorProtocol: string;
  cryptographicSignature: string;
}

export interface SystemStatusResponse {
  api: string;
  sanity: string;
  sanityMode: string;
  knowledgeBase: string;
  llm: string;
  certificate: string;
  metadata: SystemStatusMetadata;
}

export interface SanityConfigResponse {
  projectId: string;
  dataset: string;
  apiVersion: string;
  contextUrl: string;
  mode: string;
  publicDatasetUrl: string | null;
}
