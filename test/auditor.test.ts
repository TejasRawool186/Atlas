import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { adversarialAuditor } from '../backend/agent/auditor.ts';
import { SanityEntity, SanityClaim, SanitySource } from '../backend/services/sanity/types.ts';

describe('AdversarialAuditor (Lethe Probes)', () => {
  const entity: SanityEntity = {
    _id: 'ent-feature-x',
    _type: 'entity',
    name: 'Feature X',
    entityType: 'feature',
  };

  const source: SanitySource = {
    _id: 'src-1',
    _type: 'source',
    title: 'Framework 4.2 Release Notes',
    url: 'https://example.com/v42',
    sourceType: 'official_release',
    publishedAt: '2026-03-01T00:00:00Z',
  };

  const claim: SanityClaim = {
    _id: 'clm-1',
    _type: 'claim',
    statement: 'Feature X was released in Framework 4.2.',
    predicate: 'introduced_in',
    subject: { _type: 'reference', _ref: 'ent-feature-x' },
    sources: [{ _type: 'reference', _ref: 'src-1' }],
    status: 'active',
  };

  test('runs all 10 probes and assigns SUPPORTED verdict when fully grounded', () => {
    const report = adversarialAuditor.executeFullAudit({
      question: 'Was Feature X available in Framework 4.2?',
      answer: 'Yes, Feature X was released in Framework 4.2 [clm-1, src-1].',
      entities: [entity],
      claims: [claim],
      sources: [source],
      relationships: [],
      conflicts: [],
    });

    assert.equal(report.status, 'COMPLETED');
    assert.equal(report.probes.length, 10);
    assert.equal(report.verdict, 'SUPPORTED');
    assert.ok(report.summary.resilienceScore >= 80);
    assert.equal(report.summary.failCount, 0);
  });

  test('assigns INSUFFICIENT_EVIDENCE verdict when evidence is missing', () => {
    const report = adversarialAuditor.executeFullAudit({
      question: 'Is unknown system active?',
      answer: 'No evidence is available.',
      entities: [],
      claims: [],
      sources: [],
      relationships: [],
      conflicts: [],
    });

    assert.equal(report.verdict, 'INSUFFICIENT_EVIDENCE');
  });
});
