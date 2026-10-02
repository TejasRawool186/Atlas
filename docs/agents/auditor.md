# Lethe 10-Probe Adversarial Audit Protocol

## Probe Definitions

| # | Probe ID | Name | What it checks |
|---|----------|------|----------------|
| 1 | `grounding` | Source Grounding | Every factual claim backed by a retrieved source |
| 2 | `unsupported_claims` | Unsupported Claims | Claims in answer not traceable to evidence |
| 3 | `contradiction` | Contradiction | Conflicts between sources or claims |
| 4 | `temporal_consistency` | Temporal Consistency | Dates, sequences, validFrom/validUntil respected |
| 5 | `entity_consistency` | Entity Consistency | Entity names, aliases, types consistent throughout |
| 6 | `relationship_validity` | Relationship Validity | Asserted relationships match corpus graph |
| 7 | `inference_detection` | Inference Detection | Distinguishes supported facts from inferences |
| 8 | `source_removal` | Source Removal | Answer still defensible if weakest source removed |
| 9 | `alternate_interpretation` | Alternate Interpretation | Alternative readings of evidence considered |
| 10 | `missing_evidence` | Missing Evidence | Significant relevant evidence not retrieved |

## Verdict Logic

| Condition | Verdict |
|-----------|---------|
| 0 FAILs, 0-2 WARNINGs, score ≥ 80 | SUPPORTED |
| 0 FAILs, any WARNINGs, score 50-79 | PARTIALLY_SUPPORTED |
| Any FAIL on probe 3 (contradiction) | CONTRADICTED |
| Score < 50 or < 3 sources | INSUFFICIENT_EVIDENCE |

## Resilience Score

Weighted sum: PASS = 10pts, WARNING = 5pts, FAIL = 0pts, N/A = 10pts.
Normalised to 0-100.
