/**
 * ATLAS — Sanity Dataset Import Script
 * Pushes the entire local corpus into your live Sanity Content Lake.
 *
 * Usage:
 *   node scripts/import-to-sanity.mjs
 *
 * Requires SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN in .env
 */

import dotenv from 'dotenv';
dotenv.config();

const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const DATASET    = process.env.SANITY_DATASET || 'production';
const TOKEN      = process.env.SANITY_API_TOKEN;
const API_VER    = process.env.SANITY_API_VERSION || '2024-01-01';

if (!PROJECT_ID || !TOKEN) {
  console.error('ERROR: SANITY_PROJECT_ID and SANITY_API_TOKEN must be set in .env');
  process.exit(1);
}

const BASE_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VER}/data/mutate/${DATASET}`;

async function mutate(mutations) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Sanity API error ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

// ── Corpus data (inline so no TS imports needed) ──────────────────────────

const ENTITIES = [
  { _id: 'ent_feature_x',          _type: 'entity', name: 'Feature X (Zero-Copy Serialization)', entityType: 'feature',       description: 'High-throughput binary zero-copy stream deserialization engine.', aliases: ['Feature X', 'ZeroCopyEngine'] },
  { _id: 'ent_framework',          _type: 'entity', name: 'Aether Framework',                    entityType: 'framework',     description: 'Next-generation distributed stream processing engine.',           aliases: ['Aether', 'Aether Core'] },
  { _id: 'ent_version_42',         _type: 'entity', name: 'Framework 4.2.0',                     entityType: 'framework',     description: 'Release 4.2.0 of Aether Framework. Introduced Feature X at GA.',  aliases: ['v4.2', 'Release 4.2'] },
  { _id: 'ent_sanity_content_lake',_type: 'entity', name: 'Sanity Content Lake',                 entityType: 'database',      description: 'Real-time structured document store with ACID transactions and GROQ.', aliases: ['Content Lake', 'Sanity DB'] },
  { _id: 'ent_groq',               _type: 'entity', name: 'GROQ',                                entityType: 'protocol',      description: 'Declarative query language for JSON documents developed by Sanity.', aliases: ['GROQ Query Language'] },
  { _id: 'ent_sanity_context_mcp', _type: 'entity', name: 'Sanity Context MCP',                  entityType: 'api',           description: 'MCP server connecting AI agents to Sanity Knowledge Bases.',      aliases: ['Context MCP', 'Sanity MCP Server'] },
  { _id: 'ent_twitter',            _type: 'entity', name: 'Twitter',                             entityType: 'organization',  description: 'Social media platform founded in 2006, rebranded to X in 2023.',  aliases: ['Twitter Inc', 'Twitter/X'] },
  { _id: 'ent_elon_musk',          _type: 'entity', name: 'Elon Musk',                           entityType: 'organization',  description: 'CEO of Tesla and SpaceX. Acquired Twitter Inc in October 2022.',   aliases: ['Musk', 'Elon'] },
  { _id: 'ent_x_corp',             _type: 'entity', name: 'X Corp',                              entityType: 'organization',  description: 'Successor to Twitter Inc after Elon Musk acquisition.',            aliases: ['X', 'X.com'] },
];

const SOURCES = [
  { _id: 'src_release_42_official',     _type: 'source', title: 'Aether Framework v4.2.0 Official Release Notes',     url: 'https://github.com/aether-framework/releases/tag/v4.2.0',                                                           publisher: 'Aether Core Dev Team',   publishedAt: '2025-06-15T14:30:00Z', sourceType: 'official_release', author: 'Elena Vance',     excerpt: 'Feature X graduates to GA in 4.2.0.' },
  { _id: 'src_draft_roadmap_2025',      _type: 'source', title: 'Pre-4.2 Draft Roadmap (Outdated)',                   url: 'https://docs.aether-framework.org/archive/proposals/2025-01-roadmap.md',                                            publisher: 'Community Working Group',publishedAt: '2025-01-10T09:00:00Z', sourceType: 'documentation',    author: 'Community WG',    excerpt: 'Feature X delayed to v4.3 due to ARM64 issues.' },
  { _id: 'src_commit_merge_feat_x',     _type: 'source', title: 'Merge PR #1842 — feature/zero-copy into v4.2',       url: 'https://github.com/aether-framework/core/commit/8a91f4d2938e',                                                      publisher: 'GitHub / Aether Core',   publishedAt: '2025-05-28T18:12:00Z', sourceType: 'git_commit',       author: 'Marcus Brody',    excerpt: 'Merged zero-copy engine. ARM64 resolved via AVX2 SIMD.' },
  { _id: 'src_changelog_v42',           _type: 'source', title: 'Aether Framework CHANGELOG — v4.2.0',                url: 'https://github.com/aether-framework/core/blob/main/CHANGELOG.md#420',                                               publisher: 'Aether Maintainers',     publishedAt: '2025-06-15T15:00:00Z', sourceType: 'changelog',        author: 'Aether Release Bot',excerpt: 'Feature X zero-copy enabled by default.' },
  { _id: 'src_sanity_lake_spec',        _type: 'source', title: 'Sanity Content Lake Architecture',                   url: 'https://www.sanity.io/docs/datastore-and-transactions',                                                             publisher: 'Sanity.io',              publishedAt: '2025-11-20T12:00:00Z', sourceType: 'documentation',    author: 'Sanity Engineering',excerpt: 'Document-level ACID transactions with serializable isolation.' },
  { _id: 'src_sanity_mcp_rfc',          _type: 'source', title: 'Sanity Context MCP Specification',                   url: 'https://www.sanity.io/docs/agent-context-mcp-guide',                                                                publisher: 'Sanity AI Lab',          publishedAt: '2026-01-15T10:00:00Z', sourceType: 'rfcs',             author: 'Sanity Agent Team',excerpt: 'MCP endpoint for schema discovery and KB retrieval.' },
  { _id: 'src_sec_twitter_acquisition', _type: 'source', title: 'SEC Filing: Musk Completes Acquisition of Twitter',  url: 'https://www.sec.gov/Archives/edgar/data/1418091/000141809122000046/0001418091-22-000046-index.htm',                   publisher: 'SEC EDGAR',              publishedAt: '2022-10-27T00:00:00Z', sourceType: 'official_release', author: 'SEC EDGAR',       excerpt: 'Musk completed $44B Twitter acquisition Oct 27 2022.' },
  { _id: 'src_twitter_rebrand',         _type: 'source', title: 'Twitter rebrands to X',                              url: 'https://www.bbc.com/news/technology-66304898',                                                                       publisher: 'BBC News',               publishedAt: '2023-07-24T00:00:00Z', sourceType: 'documentation',    author: 'BBC Technology',  excerpt: 'Twitter officially rebrands to X, bird logo removed.' },
  { _id: 'src_musk_cancel_deal',        _type: 'source', title: 'Musk attempts to terminate Twitter deal',            url: 'https://www.reuters.com/technology/elon-musk-terminate-twitter-deal-2022-07-08/',                                    publisher: 'Reuters',                publishedAt: '2022-07-08T00:00:00Z', sourceType: 'documentation',    author: 'Reuters',         excerpt: 'Musk notified Twitter of intent to terminate $44B deal.' },
  { _id: 'src_musk_reinstates_deal',    _type: 'source', title: 'Musk reinstates Twitter takeover at $54.20',         url: 'https://www.bloomberg.com/news/articles/2022-10-04/musk-proposes-to-proceed-with-twitter-deal-at-original-price',   publisher: 'Bloomberg',              publishedAt: '2022-10-04T00:00:00Z', sourceType: 'documentation',    author: 'Bloomberg',       excerpt: 'Musk proposes reinstating original offer at $54.20/share.' },
];

const CLAIMS = [
  {
    _id: 'clm_feat_x_available_in_42', _type: 'claim',
    statement: 'Feature X was officially released in Aether Framework 4.2.0.',
    subject: { _type: 'reference', _ref: 'ent_feature_x' }, predicate: 'introduced_in',
    sources: [{ _type: 'reference', _ref: 'src_release_42_official' }, { _type: 'reference', _ref: 'src_commit_merge_feat_x' }, { _type: 'reference', _ref: 'src_changelog_v42' }],
    validFrom: '2025-06-15T14:30:00Z', status: 'active', confidence: 'high',
  },
  {
    _id: 'clm_feat_x_delayed_to_43', _type: 'claim',
    statement: 'Feature X was delayed and not included in Framework 4.2, deferred until v4.3 or v5.0.',
    subject: { _type: 'reference', _ref: 'ent_feature_x' }, predicate: 'delayed_from',
    sources: [{ _type: 'reference', _ref: 'src_draft_roadmap_2025' }],
    validFrom: '2025-01-10T09:00:00Z', validUntil: '2025-05-28T18:12:00Z', status: 'superseded', confidence: 'low',
  },
  {
    _id: 'clm_sanity_acid', _type: 'claim',
    statement: 'Sanity Content Lake provides document-level ACID transactions with serializable isolation.',
    subject: { _type: 'reference', _ref: 'ent_sanity_content_lake' }, predicate: 'implements',
    sources: [{ _type: 'reference', _ref: 'src_sanity_lake_spec' }],
    validFrom: '2022-01-01T00:00:00Z', status: 'active', confidence: 'high',
  },
  {
    _id: 'clm_musk_bought_twitter', _type: 'claim',
    statement: 'Elon Musk completed the acquisition of Twitter Inc on October 27, 2022 for $44 billion.',
    subject: { _type: 'reference', _ref: 'ent_elon_musk' }, predicate: 'acquired',
    sources: [{ _type: 'reference', _ref: 'src_sec_twitter_acquisition' }],
    validFrom: '2022-10-27T00:00:00Z', status: 'active', confidence: 'high',
  },
  {
    _id: 'clm_musk_tried_to_cancel', _type: 'claim',
    statement: 'Elon Musk attempted to terminate the Twitter acquisition in July 2022.',
    subject: { _type: 'reference', _ref: 'ent_elon_musk' }, predicate: 'attempted_to_cancel',
    sources: [{ _type: 'reference', _ref: 'src_musk_cancel_deal' }],
    validFrom: '2022-07-08T00:00:00Z', validUntil: '2022-10-04T00:00:00Z', status: 'superseded', confidence: 'high',
  },
  {
    _id: 'clm_twitter_rebranded', _type: 'claim',
    statement: 'Twitter was rebranded to X in July 2023 with twitter.com redirecting to x.com.',
    subject: { _type: 'reference', _ref: 'ent_twitter' }, predicate: 'rebranded_to',
    sources: [{ _type: 'reference', _ref: 'src_twitter_rebrand' }],
    validFrom: '2023-07-24T00:00:00Z', status: 'active', confidence: 'high',
  },
];

const CONFLICTS = [
  {
    _id: 'conf_feat_x_42_timing', _type: 'conflict',
    claimA: { _type: 'reference', _ref: 'clm_feat_x_available_in_42' },
    claimB: { _type: 'reference', _ref: 'clm_feat_x_delayed_to_43' },
    conflictType: 'TEMPORAL_CONFLICT',
    resolution: 'CLAIM_A_VALID_AND_CLAIM_B_SUPERSEDED',
    resolutionSource: { _type: 'reference', _ref: 'src_release_42_official' },
    resolutionReason: 'Claim B is an outdated January 2025 roadmap draft. The official June 2025 release confirms Feature X shipped in 4.2.0.',
  },
  {
    _id: 'conf_musk_deal', _type: 'conflict',
    claimA: { _type: 'reference', _ref: 'clm_musk_bought_twitter' },
    claimB: { _type: 'reference', _ref: 'clm_musk_tried_to_cancel' },
    conflictType: 'TEMPORAL_CONFLICT',
    resolution: 'CLAIM_A_VALID_AND_CLAIM_B_SUPERSEDED',
    resolutionSource: { _type: 'reference', _ref: 'src_sec_twitter_acquisition' },
    resolutionReason: 'The cancellation attempt (July 2022) was reversed in October 2022. The SEC filing confirms the deal closed on October 27, 2022.',
  },
];

const KNOWLEDGE_DOCS = [
  {
    _id: 'kb_aether_42_migration', _type: 'knowledge_doc',
    title: 'Migration Guide: Aether Framework 4.1 → 4.2',
    docType: 'release_notes',
    sourceUrl: 'https://docs.aether-framework.org/v4.2/migration-guide',
    publishedAt: '2025-06-16T08:00:00Z',
    author: 'Aether Documentation SIG',
    summary: 'Step-by-step upgrade guide for 4.2. Feature X (Zero-Copy Serialization) enabled by default. Legacy buffer serializer deprecated.',
    extractedClaims: ['Feature X introduced in 4.2.0 GA', 'Legacy buffer serializer deprecated'],
    referencedEntities: ['ent_feature_x', 'ent_framework', 'ent_version_42'],
  },
  {
    _id: 'kb_sanity_context_spec', _type: 'knowledge_doc',
    title: 'Sanity Context MCP: AI Integration Architecture',
    docType: 'technical_rfc',
    sourceUrl: 'https://sanity.io/docs/sanity-context-mcp-deep-dive',
    publishedAt: '2026-02-01T11:00:00Z',
    author: 'Sanity Agent & Context Team',
    summary: 'Sanity Context MCP bridges Layer A (structured GROQ queries) and Layer B (Knowledge Base documents) for autonomous agent verification.',
    extractedClaims: ['Sanity Context MCP bridges structured lake and knowledge base'],
    referencedEntities: ['ent_sanity_content_lake', 'ent_sanity_context_mcp', 'ent_groq'],
  },
  {
    _id: 'kb_twitter_timeline', _type: 'knowledge_doc',
    title: 'Twitter Acquisition by Elon Musk — Full Timeline',
    docType: 'release_notes',
    sourceUrl: 'https://www.reuters.com/technology/elon-musk-twitter-timeline/',
    publishedAt: '2023-01-01T00:00:00Z',
    author: 'Reuters Technology',
    summary: 'Elon Musk acquired Twitter for $44B in October 2022 after attempting to cancel the deal in July 2022. Rebranded to X in July 2023.',
    extractedClaims: ['Musk acquired Twitter Oct 27 2022 for $44B', 'Twitter rebranded to X July 2023'],
    referencedEntities: ['ent_elon_musk', 'ent_twitter', 'ent_x_corp'],
  },
];

// ── Main import ───────────────────────────────────────────────────────────

async function importAll() {
  const allDocs = [...ENTITIES, ...SOURCES, ...CLAIMS, ...CONFLICTS, ...KNOWLEDGE_DOCS];
  
  console.log(`\nImporting ${allDocs.length} documents to Sanity...`);
  console.log(`Project: ${PROJECT_ID} / Dataset: ${DATASET}\n`);

  // Batch in groups of 10 to stay within mutation limits
  const BATCH = 10;
  for (let i = 0; i < allDocs.length; i += BATCH) {
    const batch = allDocs.slice(i, i + BATCH);
    const mutations = batch.map(doc => ({
      createOrReplace: doc,
    }));

    try {
      const result = await mutate(mutations);
      const count = result.results?.length ?? batch.length;
      console.log(`  ✓ Batch ${Math.floor(i/BATCH)+1}: ${count} documents`);
    } catch (err) {
      console.error(`  ✗ Batch ${Math.floor(i/BATCH)+1} failed:`, err.message);
      process.exit(1);
    }
  }

  console.log(`\n✓ Import complete — ${allDocs.length} documents in Sanity`);
  console.log(`\nVerify at: https://sanity.io/manage/project/${PROJECT_ID}/dataset/${DATASET}`);
  console.log(`\nNow restart ATLAS server and all queries will use live Sanity.\n`);
}

importAll();
