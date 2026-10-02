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
      cls: 'bg-[#2EC4B6] text-[#0E241E] border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E]',
      icon: <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />,
      label: 'PASS',
    },
    WARNING: {
      cls: 'bg-[#F5A623] text-[#0E241E] border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E]',
      icon: <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />,
      label: 'ADVISORY',
    },
    FAIL: {
      cls: 'bg-[#DE4B39] text-white border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E]',
      icon: <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />,
      label: 'FAIL',
    },
    NOT_APPLICABLE: {
      cls: 'bg-[#FAF7F2] text-[#5B756E] border-2 border-[#0E241E]',
      icon: null,
      label: 'N/A',
    },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide font-display ${s.cls}`}>
      {s.icon}
      {s.label}
    </span>
  );
}

export const AuditMatrix: React.FC<Props> = ({ auditReport, investigationId }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!auditReport || auditReport.status === 'pending') {
    return (
      <div className="passport-card p-16 text-center shadow-[5px_6px_0_#0E241E]">
        <Shield className="w-10 h-10 mx-auto text-[#DE4B39] mb-3 stroke-[1.5]" />
        <p className="text-base font-black text-[#0E241E] font-display">
          {auditReport?.status === 'pending' ? 'Audit in progress…' : 'No audit report available'}
        </p>
        <p className="text-xs text-[#5B756E] mt-1">
          Complete an investigation to run the 10-probe adversarial audit.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="passport-card p-6 shadow-[5px_6px_0_#0E241E]">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-[#0E241E]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#DE4B39] text-white flex items-center justify-center shadow-[3px_3px_0_#0E241E] shrink-0">
              <Scale className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-[#0E241E] font-display">Lethe 10-Probe Audit</h2>
              <p className="text-xs text-[#5B756E] mt-0.5">Case: {investigationId}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border-2 border-[#0E241E] shadow-[3px_3px_0_#0E241E] text-right">
            <p className="text-[10px] uppercase font-bold text-[#5B756E] font-display">Resilience Score</p>
            <p className="text-3xl font-black font-mono text-[#0E241E] leading-none mt-0.5">
              {auditReport.summary.resilienceScore}
              <span className="text-base font-bold text-[#5B756E]">/100</span>
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
            <div key={s.label} className="bg-white p-3.5 rounded-xl border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E]">
              <p className="text-[10px] font-bold uppercase text-[#5B756E] font-display">{s.label}</p>
              <p className="text-sm font-black text-[#0E241E] mt-0.5 font-mono">{s.value}</p>
            </div>
          ))}
        </div>

        {auditReport.verdictRationale && (
          <div className="mt-4 p-4 bg-white rounded-xl border-2 border-[#0E241E] text-sm leading-relaxed text-[#0E241E] shadow-[2px_2px_0_#0E241E]">
            <strong className="font-black uppercase text-[11px] tracking-wider block mb-1 font-display text-[#DE4B39]">Verdict Rationale:</strong>
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
              className={`rounded-2xl border-2 border-[#0E241E] overflow-hidden transition-shadow ${
                open ? 'bg-[#FAF7F2] shadow-[5px_6px_0_#0E241E]' : 'bg-[#FAF7F2] shadow-[3px_4px_0_#0E241E]'
              }`}
            >
              <button
                onClick={() => setExpanded(prev => prev === probe.probeId ? null : probe.probeId)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#1E3A34] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-[#0E241E] shadow-[2px_2px_0_#0E241E]">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#0E241E] font-display">{probe.name}</span>
                      <span className="text-[10px] font-mono text-[#5B756E]">[{probe.probeId}]</span>
                    </div>
                    <p className="text-xs text-[#5B756E] mt-0.5 line-clamp-1">{probe.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-mono text-[#5B756E] uppercase">Score</p>
                    <p className="text-xs font-mono font-bold text-[#0E241E]">{probe.adversarialScore}/100</p>
                  </div>
                  <StatusBadge status={probe.status} />
                  {open ? <ChevronUp className="w-4 h-4 text-[#0E241E] stroke-[2.2]" /> : <ChevronDown className="w-4 h-4 text-[#0E241E] stroke-[2.2]" />}
                </div>
              </button>

              {open && (
                <div className="px-5 pb-5 pt-0 border-t-2 border-[#0E241E] bg-[#FAF7F2] space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[#5B756E] mt-3 mb-1 font-display">Probe Details</p>
                    <div className="text-sm leading-relaxed text-[#0E241E] bg-white p-4 rounded-xl border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E]">
                      {probe.details}
                    </div>
                  </div>

                  {probe.evidenceIds.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-[#5B756E] mb-1 font-display">Evidence IDs</p>
                      <div className="flex flex-wrap gap-2">
                        {probe.evidenceIds.map(eid => (
                          <span key={eid} className="px-2.5 py-1 rounded-lg bg-white border-2 border-[#0E241E] font-mono text-[11px] font-bold text-[#0E241E] shadow-[2px_2px_0_#0E241E]">
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
