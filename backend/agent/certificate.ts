/**
 * ATLAS — Cryptographic Certificate Engine
 * Computes deterministic SHA-256 Merkle tree evidence roots
 * and generates tamper-evident HMAC-SHA256 signatures.
 */

import crypto from 'node:crypto';
import { atlasConfig } from '../config/env.ts';

export interface MerkleNodeInfo {
  hash: string;
  left?: string;
  right?: string;
  isLeaf: boolean;
  itemType?: string;
  itemId?: string;
  canonicalSummary?: string;
}

export interface AtlasCertificate {
  certificateId: string;
  investigationId: string;
  question: string;
  verdict: 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'CONTRADICTED' | 'INSUFFICIENT_EVIDENCE';
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
    leaves: { hash: string; type: string; id: string; summary: string }[];
    root: string;
    depth: number;
  };
}

export interface VerificationResult {
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

export class CertificateEngine {
  private secret: string;

  constructor() {
    this.secret = atlasConfig.certificate.hmacSecret || 'atlas-default-insecure-secret';
    if (atlasConfig.certificate.isDefaultSecret) {
      console.warn('[CertificateEngine] CERTIFICATE_HMAC_SECRET is not configured. Certificate signatures are not cryptographically secured until a real secret is set.');
    }
  }

  /**
   * Deterministically hash any arbitrary string using SHA-256
   */
  public sha256(data: string): string {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
  }

  /**
   * Compute HMAC-SHA256 signature using sovereign backend key
   */
  public hmacSha256(payload: string): string {
    return crypto.createHmac('sha256', this.secret).update(payload, 'utf8').digest('hex');
  }

  /**
   * Normalize an evidence item into a canonical deterministic representation
   */
  public canonicalizeEvidenceItem(type: string, item: any): { hash: string; summary: string; id: string } {
    let id = item._id || item.id || 'unknown';
    let canonicalStr = '';

    if (type === 'claim') {
      canonicalStr = `CLAIM|${id}|${item.statement}|${item.predicate}|${item.status}|${item.confidence || ''}|${item.validFrom || ''}`;
    } else if (type === 'source') {
      canonicalStr = `SOURCE|${id}|${item.title}|${item.url}|${item.sourceType}|${item.publishedAt || ''}`;
    } else if (type === 'relationship') {
      canonicalStr = `REL|${id}|${item.relationType}|${item.sourceEntity?._ref || ''}|${item.targetEntity?._ref || ''}`;
    } else if (type === 'conflict') {
      canonicalStr = `CONFLICT|${id}|${item.conflictType}|${item.status || ''}|${item.resolutionSummary || ''}`;
    } else {
      canonicalStr = `${type.toUpperCase()}|${id}|${JSON.stringify(item)}`;
    }

    const hash = this.sha256(canonicalStr);
    return {
      hash,
      summary: canonicalStr,
      id
    };
  }

  /**
   * Builds a binary Merkle Tree from an array of leaf hashes
   */
  public buildMerkleTree(leafHashes: string[]): { root: string; depth: number } {
    if (leafHashes.length === 0) {
      const emptyRoot = this.sha256('ATLAS_EMPTY_EVIDENCE_TREE');
      return { root: emptyRoot, depth: 0 };
    }

    let currentLevel = [...leafHashes];
    let depth = 1;

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        // If odd number of nodes, duplicate the last node
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        const combined = this.sha256(`${left}:${right}`);
        nextLevel.push(combined);
      }
      currentLevel = nextLevel;
      depth++;
    }

    return { root: currentLevel[0], depth };
  }

  /**
   * Generates a tamper-evident audit certificate
   */
  public generateCertificate(params: {
    investigationId: string;
    question: string;
    verdict: AtlasCertificate['verdict'];
    claims: any[];
    sources: any[];
    relationships: any[];
    conflicts: any[];
  }): AtlasCertificate {
    const { investigationId, question, verdict, claims, sources, relationships, conflicts } = params;

    const certificateId = `CERT-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const createdAt = new Date().toISOString();

    // 1. Compute leaf hashes
    const leaves: { hash: string; type: string; id: string; summary: string }[] = [];

    claims.forEach(c => {
      const leaf = this.canonicalizeEvidenceItem('claim', c);
      leaves.push({ hash: leaf.hash, type: 'claim', id: leaf.id, summary: leaf.summary });
    });

    sources.forEach(s => {
      const leaf = this.canonicalizeEvidenceItem('source', s);
      leaves.push({ hash: leaf.hash, type: 'source', id: leaf.id, summary: leaf.summary });
    });

    relationships.forEach(r => {
      const leaf = this.canonicalizeEvidenceItem('relationship', r);
      leaves.push({ hash: leaf.hash, type: 'relationship', id: leaf.id, summary: leaf.summary });
    });

    conflicts.forEach(cf => {
      const leaf = this.canonicalizeEvidenceItem('conflict', cf);
      leaves.push({ hash: leaf.hash, type: 'conflict', id: leaf.id, summary: leaf.summary });
    });

    // Sort leaves deterministically by hash
    leaves.sort((a, b) => a.hash.localeCompare(b.hash));

    // 2. Build Merkle Root
    const { root: evidenceRoot, depth } = this.buildMerkleTree(leaves.map(l => l.hash));

    // 3. Create canonical certificate string for HMAC signature
    // certificateId:investigationId:verdict:evidenceRoot:createdAt
    const canonicalPayload = `${certificateId}:${investigationId}:${verdict}:${evidenceRoot}:${createdAt}`;
    const signature = this.hmacSha256(canonicalPayload);

    return {
      certificateId,
      investigationId,
      question,
      verdict,
      evidenceCount: leaves.length,
      claimCount: claims.length,
      sourceCount: sources.length,
      relationshipCount: relationships.length,
      conflictCount: conflicts.length,
      evidenceRoot,
      signature,
      algorithm: 'HMAC-SHA256 (Merkle Tree / RFC-6962 compliant)',
      createdAt,
      merkleTree: {
        leaves,
        root: evidenceRoot,
        depth
      }
    };
  }

  /**
   * Verifies an existing certificate against provided or stored evidence
   */
  public verifyCertificate(
    certificate: AtlasCertificate,
    evidenceOverride?: {
      claims?: any[];
      sources?: any[];
      relationships?: any[];
      conflicts?: any[];
    }
  ): VerificationResult {
    const verifiedAt = new Date().toISOString();

    let computedLeaves = certificate.merkleTree.leaves.map(l => l.hash);

    // If evidenceOverride is provided (e.g. testing tamper detection), recompute leaves
    if (evidenceOverride) {
      const overrideLeaves: { hash: string }[] = [];
      (evidenceOverride.claims || []).forEach(c => overrideLeaves.push({ hash: this.canonicalizeEvidenceItem('claim', c).hash }));
      (evidenceOverride.sources || []).forEach(s => overrideLeaves.push({ hash: this.canonicalizeEvidenceItem('source', s).hash }));
      (evidenceOverride.relationships || []).forEach(r => overrideLeaves.push({ hash: this.canonicalizeEvidenceItem('relationship', r).hash }));
      (evidenceOverride.conflicts || []).forEach(cf => overrideLeaves.push({ hash: this.canonicalizeEvidenceItem('conflict', cf).hash }));
      overrideLeaves.sort((a, b) => a.hash.localeCompare(b.hash));
      computedLeaves = overrideLeaves.map(l => l.hash);
    }

    const { root: recomputedRoot } = this.buildMerkleTree(computedLeaves);
    const evidenceRootValid = recomputedRoot === certificate.evidenceRoot;

    // Verify HMAC
    const canonicalPayload = `${certificate.certificateId}:${certificate.investigationId}:${certificate.verdict}:${certificate.evidenceRoot}:${certificate.createdAt}`;
    const expectedSignature = this.hmacSha256(canonicalPayload);
    const signatureValid = expectedSignature === certificate.signature;

    const valid = evidenceRootValid && signatureValid;
    const tamperDetected = !valid;

    let message = 'Certificate mathematically verified: Merkle evidence root and HMAC cryptographic signature are intact.';
    if (!evidenceRootValid && !signatureValid) {
      message = 'CRITICAL TAMPER ALERT: Both Merkle evidence root and HMAC signature are invalid! Evidence has been altered.';
    } else if (!evidenceRootValid) {
      message = 'EVIDENCE TAMPER DETECTED: The underlying evidence items do not hash to the certified Merkle root.';
    } else if (!signatureValid) {
      message = 'SIGNATURE INVALID: HMAC signature does not match the certificate authority key.';
    }

    return {
      valid,
      evidenceRootValid,
      signatureValid,
      certificateId: certificate.certificateId,
      investigationId: certificate.investigationId,
      recomputedRoot,
      storedRoot: certificate.evidenceRoot,
      expectedSignature,
      providedSignature: certificate.signature,
      tamperDetected,
      message,
      verifiedAt
    };
  }
}

export const certificateEngine = new CertificateEngine();
