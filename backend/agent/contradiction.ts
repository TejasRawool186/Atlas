/**
 * ATLAS — Contradiction & Conflict Resolution Engine
 * Compares claims across subject, predicate, object, temporal validities, and source authority.
 * Preserves both claims and establishes deterministic epistemic resolution.
 */

import { SanityClaim, SanitySource, SanityConflict } from '../services/sanity/types.ts';

export interface EvaluatedConflict {
  id: string;
  claimA: SanityClaim;
  claimB: SanityClaim;
  conflictType: 'TEMPORAL_CONFLICT' | 'ATTRIBUTE_CONFLICT' | 'FACTUAL_CONFLICT' | 'DEPRECATION_CONFLICT';
  status: 'RESOLVED' | 'UNRESOLVED' | 'DISPUTED';
  resolutionSummary: string;
  resolutionSourceId?: string;
  resolutionReason: string;
  evidenceComparison: {
    sourceA: string[];
    sourceB: string[];
    sourceAuthorityWinner?: 'A' | 'B' | 'TIED';
    temporalPrecedenceWinner?: 'A' | 'B' | 'TIED';
  };
}

export class ContradictionEngine {
  private static SOURCE_AUTHORITY_WEIGHTS: Record<string, number> = {
    official_release: 100,
    git_commit: 95,
    rfcs: 85,
    documentation: 80,
    changelog: 80,
    benchmark: 70,
    community_forum: 40
  };

  /**
   * Evaluates all pairs of retrieved claims for potential contradictions
   */
  public evaluateConflicts(
    claims: SanityClaim[],
    sources: Map<string, SanitySource>,
    explicitConflicts: SanityConflict[] = []
  ): EvaluatedConflict[] {
    const results: EvaluatedConflict[] = [];
    const processedPairs = new Set<string>();

    // 1. Process explicit conflicts recorded in Sanity Layer A
    for (const exp of explicitConflicts) {
      const claimA = claims.find(c => c._id === exp.claimA._ref);
      const claimB = claims.find(c => c._id === exp.claimB._ref);

      if (claimA && claimB) {
        const pairKey = [claimA._id, claimB._id].sort().join(':');
        processedPairs.add(pairKey);

        const evaluated = this.resolveConflictPair(claimA, claimB, exp.conflictType, sources, exp);
        results.push(evaluated);
      }
    }

    // 2. Discover potential unrecorded conflicts between claims with matching subject and predicate
    for (let i = 0; i < claims.length; i++) {
      for (let j = i + 1; j < claims.length; j++) {
        const c1 = claims[i];
        const c2 = claims[j];
        const pairKey = [c1._id, c2._id].sort().join(':');

        if (processedPairs.has(pairKey)) continue;

        if (c1.subject._ref === c2.subject._ref) {
          // If claims share the same primary source, they co-exist in the same document and are not contradictions
          const shareSource = Array.isArray(c1.sources) && Array.isArray(c2.sources) &&
            c1.sources.some(s1 => c2.sources.some(s2 => s1?._ref && s1._ref === s2?._ref));
          if (shareSource) continue;

          // Non-exclusive predicates: multiple statements, features, or relations do not conflict
          const NON_EXCLUSIVE_PREDICATES = new Set([
            'stipulates', 'states', 'reports', 'mentions', 'describes', 'announces',
            'features', 'contains', 'includes', 'supports', 'has_feature', 'implements',
            'maintains', 'partners_with', 'employs', 'invests_in', 'launched_on', 'relates_to'
          ]);
          if (NON_EXCLUSIVE_PREDICATES.has(c1.predicate) && NON_EXCLUSIVE_PREDICATES.has(c2.predicate)) {
            continue;
          }

          // Check for opposing predicates or mutually exclusive objects
          const isDirectConflict =
            (c1.predicate === 'introduced_in' && (c2.predicate === 'conflicts_with' || c2.predicate === 'deprecated_in')) ||
            (c2.predicate === 'introduced_in' && (c1.predicate === 'conflicts_with' || c1.predicate === 'deprecated_in')) ||
            (c1.predicate === c2.predicate && JSON.stringify(c1.object) !== JSON.stringify(c2.object));

          if (isDirectConflict) {
            processedPairs.add(pairKey);
            let cType: EvaluatedConflict['conflictType'] = 'FACTUAL_CONFLICT';
            if (c1.validUntil || c2.validUntil || c1.validFrom !== c2.validFrom) {
              cType = 'TEMPORAL_CONFLICT';
            }
            results.push(this.resolveConflictPair(c1, c2, cType, sources));
          }
        }
      }
    }

    return results;
  }

  private resolveConflictPair(
    claimA: SanityClaim,
    claimB: SanityClaim,
    conflictType: EvaluatedConflict['conflictType'],
    sources: Map<string, SanitySource>,
    explicit?: SanityConflict
  ): EvaluatedConflict {
    const id = explicit ? explicit._id : `conflict_${claimA._id}_vs_${claimB._id}`;

    // Get sources
    const sourcesA = claimA.sources.map(s => sources.get(s._ref)).filter(Boolean) as SanitySource[];
    const sourcesB = claimB.sources.map(s => sources.get(s._ref)).filter(Boolean) as SanitySource[];

    // Calculate authority score
    const scoreA = sourcesA.reduce((max, s) => Math.max(max, ContradictionEngine.SOURCE_AUTHORITY_WEIGHTS[s.sourceType] || 50), 0);
    const scoreB = sourcesB.reduce((max, s) => Math.max(max, ContradictionEngine.SOURCE_AUTHORITY_WEIGHTS[s.sourceType] || 50), 0);

    let sourceAuthorityWinner: 'A' | 'B' | 'TIED' = 'TIED';
    if (scoreA > scoreB) sourceAuthorityWinner = 'A';
    else if (scoreB > scoreA) sourceAuthorityWinner = 'B';

    // Calculate temporal recency
    const dateA = sourcesA[0]?.publishedAt ? new Date(sourcesA[0].publishedAt).getTime() : 0;
    const dateB = sourcesB[0]?.publishedAt ? new Date(sourcesB[0].publishedAt).getTime() : 0;

    let temporalPrecedenceWinner: 'A' | 'B' | 'TIED' = 'TIED';
    if (dateA > dateB) temporalPrecedenceWinner = 'A';
    else if (dateB > dateA) temporalPrecedenceWinner = 'B';

    // If explicit resolution exists in Sanity
    if (explicit?.resolution && explicit.resolutionReason) {
      return {
        id,
        claimA,
        claimB,
        conflictType,
        status: 'RESOLVED',
        resolutionSummary: explicit.resolution,
        resolutionSourceId: explicit.resolutionSource?._ref,
        resolutionReason: explicit.resolutionReason,
        evidenceComparison: {
          sourceA: sourcesA.map(s => s.title),
          sourceB: sourcesB.map(s => s.title),
          sourceAuthorityWinner,
          temporalPrecedenceWinner
        }
      };
    }

    // Status-based resolution: if one claim is active and the other is superseded or retracted
    if (claimA.status === 'active' && (claimB.status === 'superseded' || claimB.status === 'retracted')) {
      return {
        id,
        claimA,
        claimB,
        conflictType: 'TEMPORAL_CONFLICT',
        status: 'RESOLVED',
        resolutionSummary: `Claim A is active and supersedes Claim B (${claimB.status}).`,
        resolutionSourceId: sourcesA[0]?._id,
        resolutionReason: `Claim A is marked active in the authoritative content store, while Claim B is ${claimB.status}.`,
        evidenceComparison: {
          sourceA: sourcesA.map(s => s.title),
          sourceB: sourcesB.map(s => s.title),
          sourceAuthorityWinner: 'A',
          temporalPrecedenceWinner: 'A',
        },
      };
    } else if (claimB.status === 'active' && (claimA.status === 'superseded' || claimA.status === 'retracted')) {
      return {
        id,
        claimA,
        claimB,
        conflictType: 'TEMPORAL_CONFLICT',
        status: 'RESOLVED',
        resolutionSummary: `Claim B is active and supersedes Claim A (${claimA.status}).`,
        resolutionSourceId: sourcesB[0]?._id,
        resolutionReason: `Claim B is marked active in the authoritative content store, while Claim A is ${claimA.status}.`,
        evidenceComparison: {
          sourceA: sourcesA.map(s => s.title),
          sourceB: sourcesB.map(s => s.title),
          sourceAuthorityWinner: 'B',
          temporalPrecedenceWinner: 'B',
        },
      };
    }

    // Algorithmic resolution: higher authority or more recent source
    const aWins = (sourceAuthorityWinner === 'A' && (temporalPrecedenceWinner === 'A' || temporalPrecedenceWinner === 'TIED')) ||
                  (sourceAuthorityWinner === 'TIED' && temporalPrecedenceWinner === 'A');
    const bWins = (sourceAuthorityWinner === 'B' && (temporalPrecedenceWinner === 'B' || temporalPrecedenceWinner === 'TIED')) ||
                  (sourceAuthorityWinner === 'TIED' && temporalPrecedenceWinner === 'B');

    if (aWins) {
      return {
        id,
        claimA,
        claimB,
        conflictType,
        status: 'RESOLVED',
        resolutionSummary: `Claim A (${claimA.statement.slice(0, 40)}...) holds precedence.`,
        resolutionSourceId: sourcesA[0]?._id,
        resolutionReason: `Claim A is backed by higher-authority or more recent evidence (${sourcesA[0]?.sourceType || 'official'}) published on ${sourcesA[0]?.publishedAt || 'recent date'}, superseding Claim B.`,
        evidenceComparison: {
          sourceA: sourcesA.map(s => s.title),
          sourceB: sourcesB.map(s => s.title),
          sourceAuthorityWinner,
          temporalPrecedenceWinner
        }
      };
    } else if (bWins) {
      return {
        id,
        claimA,
        claimB,
        conflictType,
        status: 'RESOLVED',
        resolutionSummary: `Claim B (${claimB.statement.slice(0, 40)}...) holds precedence.`,
        resolutionSourceId: sourcesB[0]?._id,
        resolutionReason: `Claim B is backed by higher-authority or more recent evidence (${sourcesB[0]?.sourceType || 'official'}), superseding Claim A.`,
        evidenceComparison: {
          sourceA: sourcesA.map(s => s.title),
          sourceB: sourcesB.map(s => s.title),
          sourceAuthorityWinner,
          temporalPrecedenceWinner
        }
      };
    }

    return {
      id,
      claimA,
      claimB,
      conflictType,
      status: 'DISPUTED',
      resolutionSummary: 'Conflicting claims detected with balanced authority. Both preserved without silent deletion.',
      resolutionReason: 'Neither claim exhibits definitive temporal or publisher authority domination. Preserved as epistemic tension.',
      evidenceComparison: {
        sourceA: sourcesA.map(s => s.title),
        sourceB: sourcesB.map(s => s.title),
        sourceAuthorityWinner,
        temporalPrecedenceWinner
      }
    };
  }
}

export const contradictionEngine = new ContradictionEngine();
