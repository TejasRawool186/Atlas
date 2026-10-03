import { adversarialAuditor } from '../backend/agent/auditor.ts';
import { certificateEngine } from '../backend/agent/certificate.ts';
import { contradictionEngine } from '../backend/agent/contradiction.ts';
import { corpusEngine } from '../backend/services/sanity/corpus.ts';
import os from 'node:os';

async function runBenchmark() {
  const iterations = 100;
  const entity = corpusEngine.getEntity('ent_feature_x') || corpusEngine.getAllEntities()[0];
  const claims = corpusEngine.getAllClaims().slice(0, 5);
  const sources = corpusEngine.getAllSources().slice(0, 3);
  const sourceMap = new Map(sources.map(s => [s._id, s]));

  const timesAudit: number[] = [];
  const timesCert: number[] = [];
  const timesVerify: number[] = [];
  const timesTotal: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();

    // 1. Contradiction evaluation
    const conflicts = contradictionEngine.evaluateConflicts(claims, sourceMap);

    // 2. 10 Lethe probes
    const tAudit0 = performance.now();
    const report = adversarialAuditor.executeFullAudit({
      question: 'Was Feature X available in Framework 4.2?',
      answer: 'Yes, Feature X was released in Framework 4.2 [clm_feat_x_introduced, src_release_42].',
      entities: [entity],
      claims,
      sources,
      relationships: [],
      conflicts,
    });
    const tAudit1 = performance.now();

    // 3. Merkle certificate generation
    const tCert0 = performance.now();
    const cert = certificateEngine.generateCertificate({
      investigationId: `INV-BENCH-${i}`,
      question: 'Was Feature X available in Framework 4.2?',
      verdict: report.verdict,
      claims,
      sources,
      relationships: [],
      conflicts,
    });
    const tCert1 = performance.now();

    // 4. Verification
    const tVer0 = performance.now();
    const ver = certificateEngine.verifyCertificate(cert);
    const tVer1 = performance.now();

    const tEnd = performance.now();

    timesAudit.push(tAudit1 - tAudit0);
    timesCert.push(tCert1 - tCert0);
    timesVerify.push(tVer1 - tVer0);
    timesTotal.push(tEnd - t0);
  }

  const calc = (arr: number[]) => {
    arr.sort((a, b) => a - b);
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const p50 = arr[Math.floor(arr.length * 0.5)];
    const p95 = arr[Math.floor(arr.length * 0.95)];
    const p99 = arr[Math.floor(arr.length * 0.99)];
    return { mean: mean.toFixed(3), p50: p50.toFixed(3), p95: p95.toFixed(3), p99: p99.toFixed(3) };
  };

  console.log('BENCHMARK RESULTS (100 iterations):');
  console.log(`Machine: ${os.cpus()[0]?.model} (${os.cpus().length} cores), OS: ${os.type()} ${os.release()}`);
  console.log(`Node: ${process.version}`);
  console.log('Adversarial Audit (10 Lethe Probes):', calc(timesAudit), 'ms');
  console.log('Certificate Generation (Merkle Tree + HMAC):', calc(timesCert), 'ms');
  console.log('Certificate Verification (SHA-256 Re-root):', calc(timesVerify), 'ms');
  console.log('Full Pipeline (Audit + Cert + Verify):', calc(timesTotal), 'ms');
}

runBenchmark().catch(console.error);
