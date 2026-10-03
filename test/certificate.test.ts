import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { certificateEngine } from '../backend/agent/certificate.ts';
import { SanityClaim, SanitySource } from '../backend/services/sanity/types.ts';

describe('CertificateEngine', () => {
  const mockClaim: SanityClaim = {
    _id: 'claim-1',
    _type: 'claim',
    statement: 'India AI infrastructure investment is 1.2 billion USD.',
    predicate: 'stipulates',
    subject: { _type: 'reference', _ref: 'entity-india-ai' },
    sources: [{ _type: 'reference', _ref: 'source-1' }],
    status: 'active',
  };

  const mockSource: SanitySource = {
    _id: 'source-1',
    _type: 'source',
    title: 'AI Impact Summit Report',
    url: 'https://example.com/ai-report',
    publisher: 'Times of India',
    sourceType: 'official_release',
  };

  test('generates deterministic Merkle evidence root and valid HMAC signature', () => {
    const cert = certificateEngine.generateCertificate({
      investigationId: 'INV-TEST-001',
      question: 'What is India AI infrastructure investment?',
      verdict: 'SUPPORTED',
      claims: [mockClaim],
      sources: [mockSource],
      relationships: [],
      conflicts: [],
    });

    assert.ok(cert.certificateId.startsWith('CERT-'));
    assert.equal(cert.verdict, 'SUPPORTED');
    assert.equal(cert.claimCount, 1);
    assert.equal(cert.sourceCount, 1);
    assert.equal(typeof cert.evidenceRoot, 'string');
    assert.equal(cert.evidenceRoot.length, 64); // SHA-256 hex string
    assert.equal(typeof cert.signature, 'string');
    assert.equal(cert.signature.length, 64); // HMAC-SHA256 hex string

    const verification = certificateEngine.verifyCertificate(cert);
    assert.equal(verification.valid, true);
    assert.equal(verification.evidenceRootValid, true);
    assert.equal(verification.signatureValid, true);
    assert.equal(verification.tamperDetected, false);
  });

  test('detects tampered claim payload and invalidates Merkle proof', () => {
    const cert = certificateEngine.generateCertificate({
      investigationId: 'INV-TEST-002',
      question: 'What is India AI infrastructure investment?',
      verdict: 'SUPPORTED',
      claims: [mockClaim],
      sources: [mockSource],
      relationships: [],
      conflicts: [],
    });

    const tamperedEvidence = {
      claims: [
        {
          _id: 'claim-1',
          statement: 'Tampered claim value: investment is 100 billion USD.',
          predicate: 'stipulates',
          status: 'active',
        },
      ],
    };

    const verification = certificateEngine.verifyCertificate(cert, tamperedEvidence);
    assert.equal(verification.valid, false);
    assert.equal(verification.tamperDetected, true);
  });
});
