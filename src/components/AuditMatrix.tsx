import React, { useState } from 'react';
import { Shield, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Scale } from 'lucide-react';
import type { AuditReportResponse, AuditProbeResult, ProbeStatus } from '../types.ts';

interface Props {
  auditReport: AuditReportResponse | null;
  investigationId: string;
}

function StatusBadge({ status }: { status: ProbeStatus }) {
  const map: Record<ProbeStatus, { cls: string; icon: React.ReactNode; label: string }> = {
    PASS: {
      cls: 'bg-white text-black border-2 border-black shadow-[2px_2px_0_#000]',
      icon: <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />,
      label: 'PASS',
    },
    WARNING: {
      cls: 'bg-[#F4F4F4] text-black border-2 border-black shadow-[2px_2px_0_#000]',
      icon: <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />,
      label: 'ADVISORY',
    },
    FAIL: {
      cls: 'bg-black text-white border-2 border-black shadow-[2px_2px_0_#000]',
      icon: <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />,
      label: 'FAIL',
    },
    NOT_APPLICABLE: {
      cls: 'bg-white text-[#888] border-2 border-black',
      icon: null,
      label: 'N/A',
    },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide ${s.cls}`}>
      {s.icon}
      {s.label}
    </span>
  );
}

export const AuditMatrix: React.FC<Props> = ({ auditReport, investigationId }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!auditReport || auditReport.status === 'pending') {
    return (
      <div className="passport-card p-16 text-center">
        <Shield className="w-10 h-10 mx-auto text-black mb-3 stroke-[1.5]" />
        <p className="text-base font-black text-black">
          {auditReport?.status === 'pending' ? 'Audit in progress…' : 'No audit report available'}
        </p>
        <p className="text-xs text-[#555] italic mt-1">
          Complete an investigation to run the 10-probe adversarial audit.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="passport-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center shadow-[3px_3px_0_#000]">
              <Scale className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-black">Lethe 10-Probe Audit</h2>
              <p className="text-xs text-[#555] italic mt-0.5">Case: {investigationId}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F4F4F4] border-2 border-black shadow-[3px_3px_0_#000] text-right">
            <p className="text-[10px] uppercase font-bold text-[#555]">Resilience Score</p>
            <p className="text-3xl font-black font-mono text-black leading-none">
              {auditReport.summary.resilienceScore}
              <span className="text-base font-bold text-[#555]">/100</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Verdict',   value: auditReport.verdict.replace(/_/g, ' ') },
            { label: 'Passed',    value: `${auditReport.summary.passCount} / 10` },
            { label: 'Advisory',  value: `${auditReport.summary.warningCount}` },
            { label: 'Failed',    value: `${auditReport.summary.failCount}` },
          ].map(s => (
            <div key={s.label} className="bg-[#F4F4F4] p-3.5 rounded-xl border-2 border-black shadow-[2px_2px_0_#000]">
              <p className="text-[10px] font-bold uppercase text-[#555]">{s.label}</p>
              <p className="text-sm font-black text-black mt-0.5 font-mono">{s.value}</p>
            </div>
          ))}
        </div>

        {auditReport.verdictRationale && (
          <div className="mt-4 p-4 bg-[#F4F4F4] rounded-xl border-2 border-black text-sm font-serif leading-relaxed text-black shadow-[2px_2px_0_#000]">
            <strong className="font-black uppercase text-[11px] tracking-wider block mb-1">Verdict Rationale:</strong>
            {auditReport.verdictRationale}
          </div>
        )}
      </div>

      {/* Probe accordion */}
      <div className="space-y-3">
        {auditReport.probes.map((probe, idx) => {
          const open = expanded === probe.probeId;
          return (
            <div
              key={probe.probeId}
              className={`rounded-2xl border-2 border-black overflow-hidden transition-shadow ${
                open ? 'bg-white shadow-[5px_7px_0_#000]' : 'bg-white shadow-[3px_4px_0_#000]'
              }`}
            >
              <button
                onClick={() => setExpanded(prev => prev === probe.probeId ? null : probe.probeId)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-[2px_2px_0_#000]">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-black font-serif">{probe.name}</span>
                      <span className="text-[10px] font-mono text-[#888]">[{probe.probeId}]</span>
                    </div>
                    <p className="text-xs text-[#555] italic mt-0.5 line-clamp-1">{probe.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-mono text-[#888] uppercase">Score</p>
                    <p className="text-xs font-mono font-bold text-black">{probe.adversarialScore}/100</p>
                  </div>
                  <StatusBadge status={probe.status} />
                  {open ? <ChevronUp className="w-4 h-4 stroke-[2.2]" /> : <ChevronDown className="w-4 h-4 stroke-[2.2]" />}
                </div>
              </button>

              {open && (
                <div className="px-5 pb-5 pt-0 border-t-2 border-black bg-[#F4F4F4] space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[#555] mt-3 mb-1">Probe Details</p>
                    <div className="text-sm font-serif leading-relaxed text-black bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0_#000]">
                      {probe.details}
                    </div>
                  </div>

                  {probe.evidenceIds.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-[#555] mb-1">Evidence IDs</p>
                      <div className="flex flex-wrap gap-2">
                        {probe.evidenceIds.map(eid => (
                          <span key={eid} className="px-2.5 py-1 rounded-lg bg-white border-2 border-black font-mono text-[11px] font-bold shadow-[2px_2px_0_#000]">
                            {eid}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
