import React, { useState } from 'react';
import { Lock, CheckCircle2, AlertTriangle, Award, Hash, Fingerprint, RefreshCw, GitBranch, Copy, Check, Bug } from 'lucide-react';
import type { AtlasCertificateResponse, CertificateVerificationResponse } from '../types.ts';
import { api } from '../api.ts';

interface Props {
  certificate: AtlasCertificateResponse | null;
  investigationId: string;
}

export const CertificateVerifier: React.FC<Props> = ({ certificate, investigationId }) => {
  const [verification, setVerification] = useState<CertificateVerificationResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tamperMode, setTamperMode] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleVerify = async (withTamper = false) => {
    if (!certificate) return;
    setIsVerifying(true);
    setTamperMode(withTamper);
    try {
      const tamperedEvidence = withTamper ? {
        claims: [{
          id: certificate.investigationId,
          statement: '(Tampered — adversarial payload for tamper detection test)',
          predicate: 'tampered',
          status: 'active',
        }],
      } : undefined;

      const result = await api.verifyCertificate(certificate.certificateId, tamperedEvidence);
      setVerification(result);
    } catch (err) {
      console.error('[CertificateVerifier] Verification failed:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!certificate) {
    return (
      <div className="passport-card p-16 text-center">
        <Award className="w-10 h-10 mx-auto text-black mb-3 stroke-[1.5]" />
        <p className="text-base font-black text-black">No certificate issued</p>
        <p className="text-xs text-[#555] italic mt-1">
          Complete an investigation to generate an HMAC-SHA256 Merkle certificate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Certificate header */}
      <div className="passport-card p-6 shadow-[6px_8px_0_#000]">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center shadow-[3px_3px_0_#000]">
              <Award className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black uppercase tracking-tight text-black">Certificate of Integrity</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border-2 border-black bg-[#F4F4F4] text-black shadow-[2px_2px_0_#000]">RFC-6962</span>
              </div>
              <p className="text-xs text-[#555] italic mt-0.5 font-mono">{certificate.certificateId}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleVerify(false)}
              disabled={isVerifying}
              className="stamp-btn px-4 py-2.5 text-xs flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {isVerifying && !tamperMode ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
              Verify
            </button>
            <button
              onClick={() => handleVerify(true)}
              disabled={isVerifying}
              className="stamp-btn-secondary px-4 py-2.5 text-xs flex items-center gap-2 cursor-pointer disabled:opacity-40"
              title="Simulate tampering to test Merkle detection"
            >
              {isVerifying && tamperMode ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Bug className="w-3.5 h-3.5 stroke-[2.2]" />}
              Simulate Tamper
            </button>
          </div>
        </div>

        {/* Verification result */}
        {verification && (
          <div className={`mt-4 p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0_#000] ${verification.valid ? 'bg-white text-black' : 'bg-black text-white'}`}>
            <div className="flex items-start gap-3">
              {verification.valid
                ? <CheckCircle2 className="w-5 h-5 text-black stroke-[3] shrink-0 mt-0.5" />
                : <AlertTriangle className="w-5 h-5 text-white stroke-[3] shrink-0 mt-0.5" />
              }
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-wide">
                  {verification.valid ? 'Merkle seal intact — mathematically verified' : 'Integrity breach detected'}
                </p>
                <p className="text-xs font-serif leading-relaxed">{verification.message}</p>
                <p className={`text-[11px] font-mono pt-1 flex flex-wrap gap-4 ${verification.valid ? 'text-[#555]' : 'text-neutral-300'}`}>
                  <span>Merkle Root: <strong>{verification.evidenceRootValid ? 'VALID ✓' : 'INVALID ✗'}</strong></span>
                  <span>HMAC: <strong>{verification.signatureValid ? 'VALID ✓' : 'INVALID ✗'}</strong></span>
                  <span>{new Date(verification.verifiedAt).toLocaleTimeString()}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Investigation',     value: certificate.investigationId },
            { label: 'Verdict',          value: certificate.verdict.replace(/_/g, ' ') },
            { label: 'Evidence Leaves',  value: `${certificate.evidenceCount} (depth: ${certificate.merkleTree.depth})` },
            { label: 'Issued',           value: new Date(certificate.createdAt).toLocaleDateString() },
          ].map(s => (
            <div key={s.label} className="bg-[#F4F4F4] p-3.5 rounded-xl border-2 border-black shadow-[2px_2px_0_#000]">
              <p className="text-[10px] font-bold uppercase text-[#555]">{s.label}</p>
              <p className="text-xs font-mono font-bold text-black mt-0.5 break-all">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Hashes */}
        <div className="mt-4 space-y-3">
          {[
            { label: 'Merkle Evidence Root (SHA-256)', value: certificate.evidenceRoot, key: 'root', Icon: Hash },
            { label: 'HMAC-SHA256 Signature',          value: certificate.signature,    key: 'sig',  Icon: Fingerprint },
          ].map(({ label, value, key, Icon }) => (
            <div key={key} className="bg-[#F4F4F4] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0_#000]">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase">
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                  {label}
                </span>
                <button
                  onClick={() => copy(value, key)}
                  className="text-[11px] font-mono flex items-center gap-1 hover:underline cursor-pointer"
                >
                  {copied === key ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === key ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="font-mono text-xs text-black break-all bg-white p-3 rounded-lg border-2 border-black shadow-[2px_2px_0_#000]">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Merkle leaf decomposition */}
      <div className="passport-card p-6 shadow-[6px_8px_0_#000]">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 stroke-[2.2]" />
            <h3 className="text-sm font-black uppercase tracking-tight">
              Merkle Leaves ({certificate.merkleTree.leaves.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono font-bold bg-[#F4F4F4] border border-black px-2 py-0.5 rounded text-black">
            SHA-256 · Deterministic
          </span>
        </div>

        <div className="space-y-2">
          {certificate.merkleTree.leaves.map((leaf, idx) => (
            <div
              key={leaf.hash}
              className="p-3 bg-[#F4F4F4] rounded-xl border-2 border-black text-xs flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-[2px_2px_0_#000]"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold w-6 text-[#555]">#{idx + 1}</span>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-black text-white uppercase">{leaf.type}</span>
                <span className="font-mono font-bold text-black text-[11px]">{leaf.id}</span>
              </div>
              <p className="text-[#555] italic truncate max-w-sm text-[11px]">
                {leaf.summary.length > 60 ? `${leaf.summary.slice(0, 58)}…` : leaf.summary}
              </p>
              <span className="text-[#888] font-mono text-[11px] shrink-0">
                {leaf.hash.slice(0, 14)}…
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
