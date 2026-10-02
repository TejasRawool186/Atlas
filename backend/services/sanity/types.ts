/**
 * ATLAS — Sanity Service Type Definitions
 * Shared types for Layer A (Structured Content Lake) and Layer B (Knowledge Base).
 */

export interface SanityReference {
  _type: 'reference';
  _ref: string;
}

export interface SanityEntity {
  _id: string;
  _type: 'entity';
  name: string;
  entityType: 'framework' | 'feature' | 'organization' | 'standard' | 'database' | 'api' | 'protocol';
  description?: string;
  aliases?: string[];
  relatedEntities?: SanityReference[];
}

export interface SanityClaim {
  _id: string;
  _type: 'claim';
  statement: string;
  subject: SanityReference;
  predicate: string;
  object?: SanityReference | string;
  sources: SanityReference[];
  validFrom?: string;
  validUntil?: string;
  status: 'active' | 'superseded' | 'disputed' | 'retracted';
  confidence?: 'high' | 'medium' | 'low';
}

export interface SanitySource {
  _id: string;
  _type: 'source';
  title: string;
  url: string;
  publisher?: string;
  publishedAt?: string;
  sourceType: 'official_release' | 'documentation' | 'git_commit' | 'changelog' | 'rfcs' | 'benchmark' | 'community_forum';
  author?: string;
  excerpt?: string;
}

export interface SanityEvent {
  _id: string;
  _type: 'event';
  title: string;
  date?: string;
  description?: string;
  entities: SanityReference[];
  claims: SanityReference[];
  sources: SanityReference[];
}

export interface SanityRelationship {
  _id: string;
  _type: 'relationship';
  sourceEntity: SanityReference;
  relationType: 'introduced_in' | 'supersedes' | 'depends_on' | 'incompatible_with' | 'maintains' | 'implements';
  targetEntity: SanityReference;
  evidence: SanityReference[];
  validFrom?: string;
  validUntil?: string;
}

export interface SanityConflict {
  _id: string;
  _type: 'conflict';
  claimA: SanityReference;
  claimB: SanityReference;
  conflictType: 'TEMPORAL_CONFLICT' | 'ATTRIBUTE_CONFLICT' | 'FACTUAL_CONFLICT' | 'DEPRECATION_CONFLICT';
  resolution?: string;
  resolutionSource?: SanityReference;
  resolutionReason?: string;
}

export interface SanityVersion {
  _id: string;
  _type: 'version';
  versionNumber: string;
  frameworkRef: SanityReference;
  releaseDate: string;
  featuresIntroduced: SanityReference[];
  featuresDeprecated?: SanityReference[];
  changelogUrl?: string;
}

export interface SanityKnowledgeDoc {
  _id: string;
  _type: 'knowledge_doc';
  title: string;
  docType: 'release_notes' | 'architecture_spec' | 'changelog' | 'technical_rfc' | 'security_advisory';
  sourceUrl: string;
  publishedAt: string;
  author: string;
  summary: string;
  content: string;
  extractedClaims: string[];
  referencedEntities: string[];
}

export interface SanitySchemaDefinition {
  typeName: string;
  title: string;
  fields: {
    name: string;
    type: string;
    description?: string;
    required?: boolean;
    referenceTo?: string[];
  }[];
}

export interface SanityConnectionStatus {
  connected: boolean;
  mode: 'live' | 'local-corpus';
  projectId: string | null;
  dataset: string;
  apiVersion: string;
  contextUrl: string;
  error?: string;
}
