import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { contradictionEngine } from '../backend/agent/contradiction.ts';
import { SanityClaim, SanitySource } from '../backend/services/sanity/types.ts';

describe('ContradictionEngine', () => {
  const sourceOfficial: SanitySource = {
    _id: 'src-release',
    _type: 'source',
    title: 'Official v4.2 Release Notes',
    url: 'https://example.com/v42',
    sourceType: 'official_release',
    publishedAt: '2026-03-01T00:00:00Z',
  };

  const sourceDraft: SanitySource = {
    _id: 'src-draft',
    _type: 'source',
    title: 'Outdated Community Roadmap Proposal',
    url: 'https://example.com/draft',
    sourceType: 'community_forum',
    publishedAt: '2025-06-01T00:00:00Z',
  };

  test('resolves conflict in favor of higher source authority', () => {
    const claimOfficial: SanityClaim = {
      _id: 'claim-official',
      _type: 'claim',
      statement: 'Feature X was introduced in Framework v4.2.',
      predicate: 'introduced_in',
      object: 'v4.2',
      subject: { _type: 'reference', _ref: 'entity-feat-x' },
      sources: [{ _type: 'reference', _ref: 'src-release' }],
      status: 'active',
    };

    const claimDraft: SanityClaim = {
      _id: 'claim-draft',
      _type: 'claim',
      statement: 'Feature X was introduced in Framework v4.0.',
      predicate: 'introduced_in',
      object: 'v4.0',
      subject: { _type: 'reference', _ref: 'entity-feat-x' },
      sources: [{ _type: 'reference', _ref: 'src-draft' }],
      status: 'superseded',
    };

    const sourceMap = new Map<string, SanitySource>([
      ['src-release', sourceOfficial],
      ['src-draft', sourceDraft],
    ]);

    const conflicts = contradictionEngine.evaluateConflicts([claimOfficial, claimDraft], sourceMap);

    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0].status, 'RESOLVED');
    assert.equal(conflicts[0].evidenceComparison.sourceAuthorityWinner, 'A');
    assert.equal(conflicts[0].resolutionSourceId, 'src-release');
    assert.ok(conflicts[0].resolutionSummary.includes('supersedes'));
  });

  test('skips intra-source co-occurring statements', () => {
    const claimA: SanityClaim = {
      _id: 'claim-same-1',
      _type: 'claim',
      statement: 'India AI investment stands at 1.2 billion USD.',
      predicate: 'stipulates',
      subject: { _type: 'reference', _ref: 'entity-ai-boom' },
      sources: [{ _type: 'reference', _ref: 'src-release' }],
      status: 'active',
    };

    const claimB: SanityClaim = {
      _id: 'claim-same-2',
      _type: 'claim',
      statement: 'Union Budget provides 20-year tax holiday for foreign tech companies.',
      predicate: 'stipulates',
      subject: { _type: 'reference', _ref: 'entity-ai-boom' },
      sources: [{ _type: 'reference', _ref: 'src-release' }],
      status: 'active',
    };

    const sourceMap = new Map<string, SanitySource>([['src-release', sourceOfficial]]);
    const conflicts = contradictionEngine.evaluateConflicts([claimA, claimB], sourceMap);

    assert.equal(conflicts.length, 0);
  });
});
