/**
 * ATLAS — Sanity Knowledge Corpus (Local Dataset)
 * This is the ATLAS knowledge base: structured entities, claims, sources, relationships,
 * conflicts, and knowledge documents that represent the Sanity Content Lake corpus.
 *
 * When SANITY_PROJECT_ID and SANITY_API_TOKEN are configured, the live Sanity Content Lake
 * is queried instead. This corpus serves as the local representation of that data.
 *
 * Schema types mirror the Sanity schemas defined in docs/sanity/schemas.md.
 */

import {
  SanityEntity,
  SanityClaim,
  SanitySource,
  SanityEvent,
  SanityRelationship,
  SanityConflict,
  SanityVersion,
  SanityKnowledgeDoc,
  SanitySchemaDefinition,
} from './types.ts';

// ─── Schema Definitions ────────────────────────────────────────────────────

export const SANITY_SCHEMAS: SanitySchemaDefinition[] = [
  {
    typeName: 'entity',
    title: 'Entity',
    fields: [
      { name: 'name', type: 'string', required: true, description: 'Canonical entity name' },
      { name: 'entityType', type: 'string', required: true, description: 'Type: framework | feature | organization | standard | database | api | protocol' },
      { name: 'description', type: 'text', description: 'Brief entity summary' },
      { name: 'aliases', type: 'array', description: 'Synonyms and alternative labels' },
      { name: 'relatedEntities', type: 'array', referenceTo: ['entity'], description: 'Directly related entities' },
    ],
  },
  {
    typeName: 'claim',
    title: 'Claim',
    fields: [
      { name: 'statement', type: 'string', required: true, description: 'Verifiable factual statement' },
      { name: 'subject', type: 'reference', referenceTo: ['entity'], required: true },
      { name: 'predicate', type: 'string', required: true, description: 'Relational verb e.g. introduced_in' },
      { name: 'object', type: 'reference', referenceTo: ['entity', 'version'], description: 'Object entity or version' },
      { name: 'sources', type: 'array', referenceTo: ['source'], required: true },
      { name: 'validFrom', type: 'datetime' },
      { name: 'validUntil', type: 'datetime' },
      { name: 'status', type: 'string', required: true, description: 'active | superseded | disputed | retracted' },
      { name: 'confidence', type: 'string', description: 'high | medium | low' },
    ],
  },
  {
    typeName: 'source',
    title: 'Source',
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'url', type: 'url', required: true },
      { name: 'publisher', type: 'string' },
      { name: 'publishedAt', type: 'datetime' },
      { name: 'sourceType', type: 'string', required: true, description: 'official_release | documentation | git_commit | changelog | rfcs | benchmark | community_forum' },
      { name: 'author', type: 'string' },
      { name: 'excerpt', type: 'text' },
    ],
  },
  {
    typeName: 'relationship',
    title: 'Relationship',
    fields: [
      { name: 'sourceEntity', type: 'reference', referenceTo: ['entity'], required: true },
      { name: 'relationType', type: 'string', required: true, description: 'introduced_in | supersedes | depends_on | incompatible_with | maintains | implements' },
      { name: 'targetEntity', type: 'reference', referenceTo: ['entity', 'version'], required: true },
      { name: 'evidence', type: 'array', referenceTo: ['source'], required: true },
      { name: 'validFrom', type: 'datetime' },
      { name: 'validUntil', type: 'datetime' },
    ],
  },
  {
    typeName: 'conflict',
    title: 'Conflict',
    fields: [
      { name: 'claimA', type: 'reference', referenceTo: ['claim'], required: true },
      { name: 'claimB', type: 'reference', referenceTo: ['claim'], required: true },
      { name: 'conflictType', type: 'string', required: true, description: 'TEMPORAL_CONFLICT | ATTRIBUTE_CONFLICT | FACTUAL_CONFLICT | DEPRECATION_CONFLICT' },
      { name: 'resolution', type: 'string' },
      { name: 'resolutionSource', type: 'reference', referenceTo: ['source'] },
      { name: 'resolutionReason', type: 'text' },
    ],
  },
  {
    typeName: 'version',
    title: 'Version',
    fields: [
      { name: 'versionNumber', type: 'string', required: true },
      { name: 'frameworkRef', type: 'reference', referenceTo: ['entity'], required: true },
      { name: 'releaseDate', type: 'datetime', required: true },
      { name: 'featuresIntroduced', type: 'array', referenceTo: ['entity'] },
      { name: 'featuresDeprecated', type: 'array', referenceTo: ['entity'] },
      { name: 'changelogUrl', type: 'url' },
    ],
  },
  {
    typeName: 'event',
    title: 'Event',
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'date', type: 'datetime' },
      { name: 'entities', type: 'array', referenceTo: ['entity'] },
      { name: 'claims', type: 'array', referenceTo: ['claim'] },
      { name: 'sources', type: 'array', referenceTo: ['source'] },
    ],
  },
  {
    typeName: 'knowledge_doc',
    title: 'Knowledge Document',
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'docType', type: 'string', required: true, description: 'release_notes | architecture_spec | changelog | technical_rfc | security_advisory' },
      { name: 'sourceUrl', type: 'url', required: true },
      { name: 'publishedAt', type: 'datetime', required: true },
      { name: 'author', type: 'string', required: true },
      { name: 'summary', type: 'text', required: true },
      { name: 'content', type: 'text' },
      { name: 'extractedClaims', type: 'array' },
      { name: 'referencedEntities', type: 'array' },
    ],
  },
];

// ─── Layer A: Entities ─────────────────────────────────────────────────────

export const CORPUS_ENTITIES: SanityEntity[] = [
  {
    _id: 'ent_feature_x',
    _type: 'entity',
    name: 'Feature X (Zero-Copy Serialization)',
    entityType: 'feature',
    description: 'High-throughput binary zero-copy stream deserialization engine allowing memory-mapped pipeline transfers without user-space buffer copies.',
    aliases: ['Feature X', 'ZeroCopyEngine', 'Z-Copy Deserializer'],
    relatedEntities: [{ _type: 'reference', _ref: 'ent_framework' }],
  },
  {
    _id: 'ent_framework',
    _type: 'entity',
    name: 'Aether Framework',
    entityType: 'framework',
    description: 'Next-generation distributed stream processing and state reconciliation engine.',
    aliases: ['Framework', 'Aether', 'Aether Core'],
    relatedEntities: [],
  },
  {
    _id: 'ent_version_41',
    _type: 'entity',
    name: 'Framework 4.1.0',
    entityType: 'framework',
    description: 'Release 4.1.0 of Aether Framework (LTS)',
    aliases: ['v4.1', 'Framework 4.1', 'Release 4.1'],
  },
  {
    _id: 'ent_version_42',
    _type: 'entity',
    name: 'Framework 4.2.0',
    entityType: 'framework',
    description: 'Release 4.2.0 of Aether Framework. Introduced Feature X (Zero-Copy Serialization) at General Availability.',
    aliases: ['v4.2', 'Framework 4.2', 'Release 4.2', '4.2'],
  },
  {
    _id: 'ent_version_43',
    _type: 'entity',
    name: 'Framework 4.3.0-rc1',
    entityType: 'framework',
    description: 'Release Candidate for Aether Framework 4.3.0.',
    aliases: ['v4.3', 'Framework 4.3'],
  },
  {
    _id: 'ent_sanity_content_lake',
    _type: 'entity',
    name: 'Sanity Content Lake',
    entityType: 'database',
    description: 'Real-time structured document store with global CDN edge caching, document-level ACID transactions, and the GROQ query language.',
    aliases: ['Content Lake', 'Sanity Lake', 'Sanity DB'],
    relatedEntities: [{ _type: 'reference', _ref: 'ent_groq' }],
  },
  {
    _id: 'ent_groq',
    _type: 'entity',
    name: 'GROQ (Graph Relational Object Queries)',
    entityType: 'protocol',
    description: 'Declarative query language developed by Sanity for querying arbitrary JSON documents with graph joins, filters, and projections.',
    aliases: ['GROQ', 'GROQ Query Language'],
  },
  {
    _id: 'ent_sanity_context_mcp',
    _type: 'entity',
    name: 'Sanity Context MCP',
    entityType: 'api',
    description: 'Model Context Protocol server that connects AI agents to Sanity Knowledge Bases and structured content schemas.',
    aliases: ['Context MCP', 'Sanity MCP Server', 'Sanity Context Endpoint'],
  },
  // ── Twitter / X acquisition entities ──────────────────────────────────────
  {
    _id: 'ent_twitter',
    _type: 'entity',
    name: 'Twitter',
    entityType: 'organization',
    description: 'Social media platform founded in 2006, rebranded to X in 2023 following acquisition by Elon Musk.',
    aliases: ['Twitter Inc', 'Twitter/X', 'X (formerly Twitter)'],
    relatedEntities: [{ _type: 'reference', _ref: 'ent_elon_musk' }],
  },
  {
    _id: 'ent_elon_musk',
    _type: 'entity',
    name: 'Elon Musk',
    entityType: 'organization',
    description: 'CEO of Tesla and SpaceX, acquired Twitter Inc in October 2022 and rebranded it to X.',
    aliases: ['Musk', 'Elon'],
    relatedEntities: [{ _type: 'reference', _ref: 'ent_twitter' }],
  },
  {
    _id: 'ent_x_corp',
    _type: 'entity',
    name: 'X Corp',
    entityType: 'organization',
    description: 'The successor entity to Twitter Inc after Elon Musk\'s acquisition and rebranding in 2023.',
    aliases: ['X', 'X.com'],
    relatedEntities: [{ _type: 'reference', _ref: 'ent_twitter' }],
  },
];

// ─── Layer A: Sources ──────────────────────────────────────────────────────

export const CORPUS_SOURCES: SanitySource[] = [
  // ── Twitter / X acquisition sources ───────────────────────────────────────
  {
    _id: 'src_sec_twitter_acquisition',
    _type: 'source',
    title: 'SEC Filing: Elon Musk Completes Acquisition of Twitter Inc',
    url: 'https://www.sec.gov/Archives/edgar/data/1418091/000141809122000046/0001418091-22-000046-index.htm',
    publisher: 'U.S. Securities and Exchange Commission',
    publishedAt: '2022-10-27T00:00:00Z',
    sourceType: 'official_release',
    author: 'SEC EDGAR',
    excerpt: 'Elon Musk completed his $44 billion acquisition of Twitter Inc on October 27, 2022. Twitter Inc was subsequently taken private and delisted from the New York Stock Exchange.',
  },
  {
    _id: 'src_twitter_rebrand_announcement',
    _type: 'source',
    title: 'Twitter officially rebrands to X, replacing bird logo',
    url: 'https://www.bbc.com/news/technology-66304898',
    publisher: 'BBC News',
    publishedAt: '2023-07-24T00:00:00Z',
    sourceType: 'documentation',
    author: 'BBC Technology Desk',
    excerpt: 'Twitter has officially rebranded to X, with Elon Musk replacing the iconic bird logo. The domain twitter.com now redirects to x.com.',
  },
  {
    _id: 'src_musk_deal_collapse_report',
    _type: 'source',
    title: 'Elon Musk attempts to terminate Twitter deal — Reuters',
    url: 'https://www.reuters.com/technology/elon-musk-terminate-twitter-deal-2022-07-08/',
    publisher: 'Reuters',
    publishedAt: '2022-07-08T00:00:00Z',
    sourceType: 'documentation',
    author: 'Reuters Technology',
    excerpt: 'Elon Musk notified Twitter that he intends to terminate the $44 billion acquisition agreement, citing concerns about fake accounts. Twitter\'s board vowed to enforce the deal.',
  },
  {
    _id: 'src_musk_reinstated_deal',
    _type: 'source',
    title: 'Musk reinstates Twitter takeover bid at original $54.20 price — Bloomberg',
    url: 'https://www.bloomberg.com/news/articles/2022-10-04/musk-proposes-to-proceed-with-twitter-deal-at-original-price',
    publisher: 'Bloomberg',
    publishedAt: '2022-10-04T00:00:00Z',
    sourceType: 'documentation',
    author: 'Bloomberg Technology',
    excerpt: 'Elon Musk proposed reinstating his original $54.20 per share offer to acquire Twitter, weeks after attempting to back out of the deal.',
  },
  {
    _id: 'src_release_42_official',
    _type: 'source',
    title: 'Aether Framework v4.2.0 Official Release Notes',
    url: 'https://github.com/aether-framework/releases/tag/v4.2.0',
    publisher: 'Aether Core Development Team',
    publishedAt: '2025-06-15T14:30:00Z',
    sourceType: 'official_release',
    author: 'Elena Vance (Lead Architecture)',
    excerpt: 'Version 4.2.0 officially graduates Feature X (Zero-Copy Serialization) from experimental to General Availability (GA). Enabled by default for binary stream deserialization via config flag stream.serialization=zero-copy.',
  },
  {
    _id: 'src_draft_roadmap_2025',
    _type: 'source',
    title: 'Pre-4.2 Draft Roadmap & Spec Proposal (Outdated)',
    url: 'https://docs.aether-framework.org/archive/proposals/2025-01-roadmap.md',
    publisher: 'Community Working Group',
    publishedAt: '2025-01-10T09:00:00Z',
    sourceType: 'documentation',
    author: 'Community Working Group',
    excerpt: 'Notice: Feature X is delayed to v4.3 or v5.0 due to memory alignment issues on ARM64 architectures. Not planned for v4.2 release.',
  },
  {
    _id: 'src_commit_merge_feat_x',
    _type: 'source',
    title: 'Merge pull request #1842 — feature/zero-copy into v4.2-staging',
    url: 'https://github.com/aether-framework/core/commit/8a91f4d2938e',
    publisher: 'GitHub / Aether Core',
    publishedAt: '2025-05-28T18:12:00Z',
    sourceType: 'git_commit',
    author: 'Marcus Brody',
    excerpt: 'Commit 8a91f4d2: Merged zero-copy serialization engine into release branch v4.2. Closes #1839. ARM64 alignment resolved using AVX2 fallback with SIMD detection.',
  },
  {
    _id: 'src_changelog_v42',
    _type: 'source',
    title: 'Aether Framework CHANGELOG.md — Release v4.2.0',
    url: 'https://github.com/aether-framework/core/blob/main/CHANGELOG.md#420',
    publisher: 'Aether Core Maintainers',
    publishedAt: '2025-06-15T15:00:00Z',
    sourceType: 'changelog',
    author: 'Aether Release Bot',
    excerpt: '### Added: Feature X (zero-copy serialization) enabled by default in streaming runtime. Backwards compatible with v4.1 payloads.',
  },
  {
    _id: 'src_sanity_lake_spec',
    _type: 'source',
    title: 'Sanity Content Lake Architecture & Distributed Mutation Consistency',
    url: 'https://www.sanity.io/docs/datastore-and-transactions',
    publisher: 'Sanity.io Official Documentation',
    publishedAt: '2025-11-20T12:00:00Z',
    sourceType: 'documentation',
    author: 'Even Westvang & Sanity Engineering',
    excerpt: 'Sanity Content Lake guarantees document-level ACID transactions with serializable isolation at the primary content lake cluster. Global edge caches deliver eventually consistent reads within <50ms invalidation windows.',
  },
  {
    _id: 'src_sanity_mcp_rfc',
    _type: 'source',
    title: 'Sanity Context Model Context Protocol (MCP) Specification',
    url: 'https://www.sanity.io/docs/agent-context-mcp-guide',
    publisher: 'Sanity AI Lab',
    publishedAt: '2026-01-15T10:00:00Z',
    sourceType: 'rfcs',
    author: 'Sanity Agent Integration Core',
    excerpt: 'The Sanity Context MCP endpoint exposes real-time structured Content Lake query resolution, schema discovery, and Knowledge Base chunk retrieval with cryptographic origin tracing.',
  },
];

// ─── Layer A: Claims ───────────────────────────────────────────────────────

export const CORPUS_CLAIMS: SanityClaim[] = [
  // ── Twitter / X acquisition claims ────────────────────────────────────────
  {
    _id: 'clm_musk_bought_twitter_2022',
    _type: 'claim',
    statement: 'Elon Musk completed the acquisition of Twitter Inc on October 27, 2022 for approximately $44 billion, taking the company private.',
    subject: { _type: 'reference', _ref: 'ent_elon_musk' },
    predicate: 'acquired',
    object: { _type: 'reference', _ref: 'ent_twitter' },
    sources: [
      { _type: 'reference', _ref: 'src_sec_twitter_acquisition' },
    ],
    validFrom: '2022-10-27T00:00:00Z',
    status: 'active',
    confidence: 'high',
  },
  {
    _id: 'clm_musk_tried_to_cancel_deal',
    _type: 'claim',
    statement: 'Elon Musk attempted to terminate the Twitter acquisition agreement in July 2022, citing concerns about bot and fake accounts.',
    subject: { _type: 'reference', _ref: 'ent_elon_musk' },
    predicate: 'attempted_to_cancel',
    object: { _type: 'reference', _ref: 'ent_twitter' },
    sources: [
      { _type: 'reference', _ref: 'src_musk_deal_collapse_report' },
    ],
    validFrom: '2022-07-08T00:00:00Z',
    validUntil: '2022-10-04T00:00:00Z',
    status: 'superseded',
    confidence: 'high',
  },
  {
    _id: 'clm_twitter_rebranded_to_x',
    _type: 'claim',
    statement: 'Twitter was rebranded to X in July 2023, with the bird logo replaced and twitter.com redirecting to x.com.',
    subject: { _type: 'reference', _ref: 'ent_twitter' },
    predicate: 'rebranded_to',
    object: { _type: 'reference', _ref: 'ent_x_corp' },
    sources: [
      { _type: 'reference', _ref: 'src_twitter_rebrand_announcement' },
    ],
    validFrom: '2023-07-24T00:00:00Z',
    status: 'active',
    confidence: 'high',
  },
  {
    _id: 'clm_feat_x_available_in_42',
    _type: 'claim',
    statement: 'Feature X (Zero-Copy Serialization) was officially released and made available in Aether Framework version 4.2.0.',
    subject: { _type: 'reference', _ref: 'ent_feature_x' },
    predicate: 'introduced_in',
    object: { _type: 'reference', _ref: 'ent_version_42' },
    sources: [
      { _type: 'reference', _ref: 'src_release_42_official' },
      { _type: 'reference', _ref: 'src_commit_merge_feat_x' },
      { _type: 'reference', _ref: 'src_changelog_v42' },
    ],
    validFrom: '2025-06-15T14:30:00Z',
    status: 'active',
    confidence: 'high',
  },
  {
    _id: 'clm_feat_x_delayed_to_43',
    _type: 'claim',
    statement: 'Feature X was delayed and not included in Framework 4.2, deferred until v4.3 or v5.0.',
    subject: { _type: 'reference', _ref: 'ent_feature_x' },
    predicate: 'conflicts_with',
    object: { _type: 'reference', _ref: 'ent_version_42' },
    sources: [{ _type: 'reference', _ref: 'src_draft_roadmap_2025' }],
    validFrom: '2025-01-10T09:00:00Z',
    validUntil: '2025-05-28T18:12:00Z',
    status: 'superseded',
    confidence: 'low',
  },
  {
    _id: 'clm_sanity_acid_lake',
    _type: 'claim',
    statement: 'Sanity Content Lake provides document-level ACID transactions with serializable mutation guarantees.',
    subject: { _type: 'reference', _ref: 'ent_sanity_content_lake' },
    predicate: 'implements',
    object: 'ACID Transactions & Serializable Isolation',
    sources: [{ _type: 'reference', _ref: 'src_sanity_lake_spec' }],
    validFrom: '2022-01-01T00:00:00Z',
    status: 'active',
    confidence: 'high',
  },
  {
    _id: 'clm_sanity_mcp_support',
    _type: 'claim',
    statement: 'Sanity Context MCP server exposes schema discovery and Knowledge Base document retrieval directly to autonomous agents.',
    subject: { _type: 'reference', _ref: 'ent_sanity_context_mcp' },
    predicate: 'supports',
    object: { _type: 'reference', _ref: 'ent_groq' },
    sources: [{ _type: 'reference', _ref: 'src_sanity_mcp_rfc' }],
    validFrom: '2026-01-15T10:00:00Z',
    status: 'active',
    confidence: 'high',
  },
];

// ─── Layer A: Relationships ────────────────────────────────────────────────

export const CORPUS_RELATIONSHIPS: SanityRelationship[] = [
  // ── Twitter / X acquisition relationships ──────────────────────────────────
  {
    _id: 'rel_musk_acquired_twitter',
    _type: 'relationship',
    sourceEntity: { _type: 'reference', _ref: 'ent_elon_musk' },
    relationType: 'maintains',
    targetEntity: { _type: 'reference', _ref: 'ent_twitter' },
    evidence: [{ _type: 'reference', _ref: 'src_sec_twitter_acquisition' }],
    validFrom: '2022-10-27T00:00:00Z',
  },
  {
    _id: 'rel_twitter_became_x',
    _type: 'relationship',
    sourceEntity: { _type: 'reference', _ref: 'ent_twitter' },
    relationType: 'supersedes',
    targetEntity: { _type: 'reference', _ref: 'ent_x_corp' },
    evidence: [{ _type: 'reference', _ref: 'src_twitter_rebrand_announcement' }],
    validFrom: '2023-07-24T00:00:00Z',
  },
  {
    _id: 'rel_feat_x_introduced_in_42',
    _type: 'relationship',
    sourceEntity: { _type: 'reference', _ref: 'ent_feature_x' },
    relationType: 'introduced_in',
    targetEntity: { _type: 'reference', _ref: 'ent_version_42' },
    evidence: [
      { _type: 'reference', _ref: 'src_release_42_official' },
      { _type: 'reference', _ref: 'src_changelog_v42' },
    ],
    validFrom: '2025-06-15T14:30:00Z',
  },
  {
    _id: 'rel_feat_x_belongs_to_framework',
    _type: 'relationship',
    sourceEntity: { _type: 'reference', _ref: 'ent_feature_x' },
    relationType: 'depends_on',
    targetEntity: { _type: 'reference', _ref: 'ent_framework' },
    evidence: [{ _type: 'reference', _ref: 'src_release_42_official' }],
  },
  {
    _id: 'rel_sanity_lake_groq',
    _type: 'relationship',
    sourceEntity: { _type: 'reference', _ref: 'ent_sanity_content_lake' },
    relationType: 'implements',
    targetEntity: { _type: 'reference', _ref: 'ent_groq' },
    evidence: [{ _type: 'reference', _ref: 'src_sanity_lake_spec' }],
  },
  {
    _id: 'rel_sanity_mcp_lake',
    _type: 'relationship',
    sourceEntity: { _type: 'reference', _ref: 'ent_sanity_context_mcp' },
    relationType: 'depends_on',
    targetEntity: { _type: 'reference', _ref: 'ent_sanity_content_lake' },
    evidence: [{ _type: 'reference', _ref: 'src_sanity_mcp_rfc' }],
  },
];

// ─── Layer A: Conflicts ────────────────────────────────────────────────────

export const CORPUS_CONFLICTS: SanityConflict[] = [
  // ── Twitter acquisition conflict ───────────────────────────────────────────
  {
    _id: 'conf_musk_deal_cancellation_vs_completion',
    _type: 'conflict',
    claimA: { _type: 'reference', _ref: 'clm_musk_bought_twitter_2022' },
    claimB: { _type: 'reference', _ref: 'clm_musk_tried_to_cancel_deal' },
    conflictType: 'TEMPORAL_CONFLICT',
    resolution: 'CLAIM_A_VALID_AND_CLAIM_B_SUPERSEDED',
    resolutionSource: { _type: 'reference', _ref: 'src_sec_twitter_acquisition' },
    resolutionReason:
      'Claim B (deal cancellation attempt) occurred in July 2022 but was reversed in October 2022. The SEC filing of October 27, 2022 confirms the acquisition was completed. Claim B represents a superseded intermediate state, not the final outcome.',
  },
  {
    _id: 'conf_feat_x_42_timing',
    _type: 'conflict',
    claimA: { _type: 'reference', _ref: 'clm_feat_x_available_in_42' },
    claimB: { _type: 'reference', _ref: 'clm_feat_x_delayed_to_43' },
    conflictType: 'TEMPORAL_CONFLICT',
    resolution: 'CLAIM_A_VALID_AND_CLAIM_B_SUPERSEDED',
    resolutionSource: { _type: 'reference', _ref: 'src_release_42_official' },
    resolutionReason:
      'Claim B is based on an outdated roadmap proposal dated 2025-01-10. Claim A is validated by the official release v4.2.0 (2025-06-15) and git merge commit 8a91f4d2 (2025-05-28), which resolved ARM64 alignment via SIMD fallback.',
  },
];

// ─── Layer A: Events ───────────────────────────────────────────────────────

export const CORPUS_EVENTS: SanityEvent[] = [
  {
    _id: 'evt_v42_release_day',
    _type: 'event',
    title: 'Framework 4.2.0 General Availability Launch',
    date: '2025-06-15T14:30:00Z',
    description: 'Official rollout of Aether Framework 4.2.0 containing Feature X (Zero-Copy Serialization) at GA.',
    entities: [
      { _type: 'reference', _ref: 'ent_framework' },
      { _type: 'reference', _ref: 'ent_version_42' },
      { _type: 'reference', _ref: 'ent_feature_x' },
    ],
    claims: [{ _type: 'reference', _ref: 'clm_feat_x_available_in_42' }],
    sources: [{ _type: 'reference', _ref: 'src_release_42_official' }],
  },
];

// ─── Layer B: Knowledge Base Documents ────────────────────────────────────

export const CORPUS_KNOWLEDGE_DOCS: SanityKnowledgeDoc[] = [
  // ── Twitter / X acquisition knowledge doc ─────────────────────────────────
  {
    _id: 'kb_doc_twitter_acquisition_timeline',
    _type: 'knowledge_doc',
    title: 'Twitter Acquisition by Elon Musk — Full Timeline',
    docType: 'release_notes',
    sourceUrl: 'https://www.reuters.com/technology/elon-musk-twitter-timeline/',
    publishedAt: '2023-01-01T00:00:00Z',
    author: 'Reuters Technology',
    summary:
      'Complete timeline of Elon Musk\'s $44 billion acquisition of Twitter. Musk made his initial offer in April 2022, attempted to cancel in July 2022, reinstated the offer in October 2022, completed the acquisition on October 27, 2022, and rebranded the platform to X in July 2023.',
    content: `# Twitter Acquisition Timeline

April 2022: Elon Musk discloses 9.1% stake in Twitter, becomes largest shareholder.
April 14, 2022: Musk makes unsolicited offer to buy Twitter for $54.20 per share (~$44B).
April 25, 2022: Twitter board accepts Musk's offer.
July 8, 2022: Musk attempts to terminate the deal, citing concerns about fake/bot accounts.
July 12, 2022: Twitter board sues Musk to enforce the agreement.
October 4, 2022: Musk reinstates original offer at $54.20 per share.
October 27, 2022: Acquisition completed. Twitter taken private. Musk fires CEO Parag Agrawal.
November 2022: Musk begins major restructuring, cutting 50% of staff.
July 24, 2023: Twitter officially rebranded to X. Bird logo removed. twitter.com redirects to x.com.`,
    extractedClaims: [
      'Elon Musk acquired Twitter on October 27, 2022 for $44 billion',
      'Musk attempted to cancel the deal in July 2022 but reversed course',
      'Twitter was rebranded to X in July 2023',
    ],
    referencedEntities: ['ent_elon_musk', 'ent_twitter', 'ent_x_corp'],
  },
  {
    _id: 'kb_doc_aether_42_migration',
    _type: 'knowledge_doc',
    title: 'Migration Guide: Upgrading from Framework 4.1 to 4.2',
    docType: 'release_notes',
    sourceUrl: 'https://docs.aether-framework.org/v4.2/migration-guide',
    publishedAt: '2025-06-16T08:00:00Z',
    author: 'Aether Documentation SIG',
    summary:
      'Step-by-step upgrade guide for v4.2.0, including zero-copy memory allocation guidelines for Feature X and deprecation notices for the legacy buffer serializer.',
    content: `# Upgrading to Aether Framework 4.2

Framework 4.2 introduces Feature X (Zero-Copy Serialization Engine). Previously, all buffer streams underwent two memory copies through user-space allocations. In 4.2, memory-mapped zero-copy transfers are enabled by default on 64-bit kernels.

### Breaking Changes & Deprecations
- Legacy buffer serializer \`StreamBufferSerializer\` is marked deprecated.
- Replace \`stream.useLegacyBuffer()\` with \`stream.enableZeroCopy()\` (Feature X).

### Historical note
Early draft roadmaps in January 2025 suggested Feature X might slip to v4.3. PR #1842 successfully introduced dynamic SIMD alignment, landing Feature X in 4.2.0 GA.`,
    extractedClaims: [
      'Feature X introduced in 4.2.0 GA',
      'Replaced dual-copy buffer serialization',
    ],
    referencedEntities: ['ent_feature_x', 'ent_framework', 'ent_version_42'],
  },
  {
    _id: 'kb_doc_sanity_context_spec',
    _type: 'knowledge_doc',
    title: 'Sanity Context MCP: High-Assurance AI Integration Architecture',
    docType: 'technical_rfc',
    sourceUrl: 'https://sanity.io/docs/sanity-context-mcp-deep-dive',
    publishedAt: '2026-02-01T11:00:00Z',
    author: 'Sanity Agent & Context Team',
    summary:
      'Technical whitepaper explaining how Sanity Context and MCP bridge structured content schemas and unstructured knowledge base embeddings for agent verification.',
    content: `# Sanity Context Architecture

Sanity Context enables autonomous agents to query structured content lakes and knowledge bases over the open Model Context Protocol (MCP).

### Two-Tier Knowledge Representation
1. **Layer A — Structured Content Lake**: Rigorously typed JSON documents (Entities, Claims, Relationships, Conflicts, Temporal Validities). Queried via GROQ.
2. **Layer B — Knowledge Base**: Sourced documents, markdown guides, changelogs, and architecture ADRs.

### Verification Integrity Protocol
By connecting directly to the Sanity Context endpoint, an auditor agent cross-references structured relationship graphs against timestamped sources, eliminating hallucinations.`,
    extractedClaims: [
      'Sanity Context MCP bridges Layer A structured lake and Layer B knowledge base',
    ],
    referencedEntities: ['ent_sanity_content_lake', 'ent_sanity_context_mcp', 'ent_groq'],
  },
  {
    _id: 'kb_doc_lethe_adversarial_audit_spec',
    _type: 'knowledge_doc',
    title: 'Adversarial Epistemic Auditing: The Lethe 10-Probe Protocol',
    docType: 'architecture_spec',
    sourceUrl: 'https://research.lethe-epistemics.org/protocol-v1.pdf',
    publishedAt: '2025-10-12T16:00:00Z',
    author: 'Dr. Katherine Aris & Epistemic Systems Lab',
    summary:
      'Specification of the 10 adversarial probes designed to detect grounding failures, temporal contradictions, and relational hallucinations in LLM assertions.',
    content: `# The Lethe 10-Probe Epistemic Audit Standard

1. Grounding Probe
2. Unsupported Claims Probe
3. Contradiction Probe
4. Temporal Consistency Probe
5. Entity Consistency Probe
6. Relationship Validity Probe
7. Inference Detection Probe
8. Source Removal Probe (Counterfactual)
9. Alternate Interpretation Probe
10. Missing Evidence Probe`,
    extractedClaims: [
      '10 distinct adversarial probes required for epistemic knowledge certification',
    ],
    referencedEntities: ['ent_sanity_context_mcp'],
  },
];

// ─── In-Memory Dataset Query Engine ───────────────────────────────────────

/**
 * Provides GROQ-like query capabilities over the local corpus.
 * Used when Sanity live credentials are not configured.
 */
export class SanityCorpusEngine {
  private entities = new Map<string, SanityEntity>(CORPUS_ENTITIES.map(e => [e._id, e]));
  private claims = new Map<string, SanityClaim>(CORPUS_CLAIMS.map(c => [c._id, c]));
  private sources = new Map<string, SanitySource>(CORPUS_SOURCES.map(s => [s._id, s]));
  private events = new Map<string, SanityEvent>(CORPUS_EVENTS.map(ev => [ev._id, ev]));
  private relationships = new Map<string, SanityRelationship>(CORPUS_RELATIONSHIPS.map(r => [r._id, r]));
  private conflicts = new Map<string, SanityConflict>(CORPUS_CONFLICTS.map(cf => [cf._id, cf]));
  private knowledgeDocs = new Map<string, SanityKnowledgeDoc>(CORPUS_KNOWLEDGE_DOCS.map(k => [k._id, k]));

  getSchemas(): SanitySchemaDefinition[] { return SANITY_SCHEMAS; }

  getAllEntities(): SanityEntity[] { return Array.from(this.entities.values()); }
  getEntity(id: string): SanityEntity | undefined { return this.entities.get(id); }

  findEntitiesByQuery(query: string): SanityEntity[] {
    const q = query.toLowerCase();
    return this.getAllEntities().filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.aliases && e.aliases.some(a => a.toLowerCase().includes(q)))
    );
  }

  getAllClaims(): SanityClaim[] { return Array.from(this.claims.values()); }
  getClaim(id: string): SanityClaim | undefined { return this.claims.get(id); }

  getClaimsForEntity(entityId: string): SanityClaim[] {
    return this.getAllClaims().filter(
      c =>
        c.subject._ref === entityId ||
        (typeof c.object === 'object' && c.object?._ref === entityId)
    );
  }

  getAllSources(): SanitySource[] { return Array.from(this.sources.values()); }
  getSource(id: string): SanitySource | undefined { return this.sources.get(id); }

  getAllRelationships(): SanityRelationship[] { return Array.from(this.relationships.values()); }

  getRelationshipsForEntity(entityId: string): SanityRelationship[] {
    return this.getAllRelationships().filter(
      r => r.sourceEntity._ref === entityId || r.targetEntity._ref === entityId
    );
  }

  getAllConflicts(): SanityConflict[] { return Array.from(this.conflicts.values()); }
  getAllEvents(): SanityEvent[] { return Array.from(this.events.values()); }
  getAllKnowledgeDocs(): SanityKnowledgeDoc[] { return Array.from(this.knowledgeDocs.values()); }

  searchKnowledge(query: string): SanityKnowledgeDoc[] {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return this.getAllKnowledgeDocs().filter(doc => {
      const corpus = `${doc.title} ${doc.summary} ${doc.content} ${doc.extractedClaims.join(' ')}`.toLowerCase();
      return terms.some(term => corpus.includes(term));
    });
  }

  /**
   * Returns a summary of corpus statistics for debugging and system status.
   */
  public getStats(): Record<string, number> {
    return {
      entities: this.entities.size,
      claims: this.claims.size,
      sources: this.sources.size,
      relationships: this.relationships.size,
      conflicts: this.conflicts.size,
      events: this.events.size,
      knowledgeDocs: this.knowledgeDocs.size,
    };
  }

  /**
   * Dynamically adds a new knowledge document, source, and derived entity & claims
   * into the local corpus engine so they are immediately queryable via GROQ and the agent.
   */
  public addKnowledgeDoc(doc: {
    title: string;
    docType: string;
    sourceUrl: string;
    publishedAt?: string;
    author: string;
    summary: string;
    content?: string;
    extractedClaims?: string[];
  }): { doc: SanityKnowledgeDoc; entity: SanityEntity; claims: SanityClaim[]; source: SanitySource } {
    const slug = doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    const docId = `kdoc-${Date.now().toString(36)}-${slug}`;
    const entityId = `e-${Date.now().toString(36)}-${slug}`;
    const sourceId = `src-${Date.now().toString(36)}-${slug}`;

    const newSource: SanitySource = {
      _id: sourceId,
      _type: 'source',
      title: doc.title,
      url: doc.sourceUrl || 'https://atlas.local/sourced-doc',
      publisher: doc.author,
      publishedAt: doc.publishedAt || new Date().toISOString(),
      sourceType: doc.docType === 'technical_rfc' ? 'rfcs' : 'documentation',
      author: doc.author,
      excerpt: doc.summary.slice(0, 200),
    };
    this.sources.set(sourceId, newSource);

    const newEntity: SanityEntity = {
      _id: entityId,
      _type: 'entity',
      name: doc.title,
      entityType: 'standard',
      description: doc.summary,
      aliases: [slug],
      relatedEntities: [],
    };
    this.entities.set(entityId, newEntity);

    const createdClaims: SanityClaim[] = [];
    if (doc.extractedClaims && doc.extractedClaims.length > 0) {
      doc.extractedClaims.forEach((claimStmt, idx) => {
        const claimId = `claim-${Date.now().toString(36)}-${idx}`;
        const newClaim: SanityClaim = {
          _id: claimId,
          _type: 'claim',
          statement: claimStmt,
          subject: { _type: 'reference', _ref: entityId },
          predicate: 'stipulates',
          object: claimStmt,
          sources: [{ _type: 'reference', _ref: sourceId }],
          validFrom: doc.publishedAt || new Date().toISOString(),
          status: 'active',
          confidence: 'high',
        };
        this.claims.set(claimId, newClaim);
        createdClaims.push(newClaim);
      });
    }

    const validDocTypes = ['release_notes', 'architecture_spec', 'changelog', 'technical_rfc', 'security_advisory'];
    const safeDocType = (validDocTypes.includes(doc.docType) ? doc.docType : 'technical_rfc') as SanityKnowledgeDoc['docType'];

    const newDoc: SanityKnowledgeDoc = {
      _id: docId,
      _type: 'knowledge_doc',
      title: doc.title,
      docType: safeDocType,
      sourceUrl: doc.sourceUrl || 'https://atlas.local/sourced-doc',
      publishedAt: doc.publishedAt || new Date().toISOString(),
      author: doc.author,
      summary: doc.summary,
      content: doc.content || doc.summary,
      extractedClaims: doc.extractedClaims || [],
      referencedEntities: [entityId],
    };
    this.knowledgeDocs.set(docId, newDoc);

    return { doc: newDoc, entity: newEntity, claims: createdClaims, source: newSource };
  }

  executeGroq(groq: string, params: Record<string, any> = {}): any {
    const q = groq.trim();
    if (q.includes('"entity"')) {
      const results = this.getAllEntities();
      return params.name
        ? results.filter(e => e.name.toLowerCase() === String(params.name).toLowerCase() || e.aliases?.includes(params.name))
        : results;
    }
    if (q.includes('"claim"')) {
      const results = this.getAllClaims();
      return params.subjectId ? results.filter(c => c.subject._ref === params.subjectId) : results;
    }
    if (q.includes('"source"')) return this.getAllSources();
    if (q.includes('"relationship"')) {
      const results = this.getAllRelationships();
      return params.entityId
        ? results.filter(r => r.sourceEntity._ref === params.entityId || r.targetEntity._ref === params.entityId)
        : results;
    }
    if (q.includes('"conflict"')) return this.getAllConflicts();
    if (q.includes('"event"')) return this.getAllEvents();
    if (q.includes('"knowledge_doc"')) return this.getAllKnowledgeDocs();
    return {
      entities: this.getAllEntities(),
      claims: this.getAllClaims(),
      sources: this.getAllSources(),
      relationships: this.getAllRelationships(),
      conflicts: this.getAllConflicts(),
      knowledgeDocs: this.getAllKnowledgeDocs(),
    };
  }
}

export const corpusEngine = new SanityCorpusEngine();
