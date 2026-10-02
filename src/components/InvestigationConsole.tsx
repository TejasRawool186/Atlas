import React, { useState, useEffect } from 'react';
import {
  Play, CheckCircle2, AlertTriangle, XCircle, HelpCircle,
  ArrowRight, Compass, Lock, RefreshCw, FileText, Search,
} from 'lucide-react';
import type { InvestigationDetail, InvestigationSummary, InvestigationEvent, Verdict } from '../types.ts';
import { api } from '../api.ts';

interface Props {
  currentInvestigation: InvestigationDetail | null;
  investigationsList: InvestigationSummary[];
  onSelectInvestigation: (id: string) => void;
  onRefreshInvestigations: () => void;
  onNavigateTab: (tab: string) => void;
  initialQuestion?: string;
}

const PRESETS = [
  {
    tag: 'BENCHMARK',
    question: 'Was Feature X available in Framework 4.2?',
    desc: 'Multi-hop entity resolution, temporal conflict disambiguation between a superseded roadmap draft and official release notes.',
  },
  {
    tag: 'ACID AUDIT',
    question: 'Is Sanity Content Lake ACID-compliant across global regions?',
    desc: 'Structured database schema claims vs global CDN edge eventual consistency.',
  },
  {
    tag: 'MCP PROBE',
    question: 'Does Sanity Context MCP support schema discovery for agents?',
    desc: 'MCP toolset inspection, schema resolution, and Knowledge Base chunk retrieval.',
  },
];

function VerdictBadge({ verdict }: { verdict: Verdict | null }) {
  if (!verdict) return (
    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 border-[#0E241E] bg-[#FAF7F2] text-[#0E241E] text-xs font-bold uppercase tracking-wide shadow-[3px_3px_0_#0E241E]">
      Pending Evaluation
    </span>
  );
  const map: Record<Verdict, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    SUPPORTED: { bg: 'bg-[#2EC4B6]', text: 'text-[#0E241E]', icon: <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />, label: 'Supported' },
    PARTIALLY_SUPPORTED: { bg: 'bg-[#F5A623]', text: 'text-[#0E241E]', icon: <AlertTriangle className="w-4 h-4 stroke-[2.5]" />, label: 'Partially Supported' },
    CONTRADICTED: { bg: 'bg-[#DE4B39]', text: 'text-white', icon: <XCircle className="w-4 h-4 stroke-[2.5]" />, label: 'Contradicted' },
    INSUFFICIENT_EVIDENCE: { bg: 'bg-[#FAF7F2]', text: 'text-[#0E241E]', icon: <HelpCircle className="w-4 h-4 stroke-[2.5]" />, label: 'Insufficient Evidence' },
  };
  const s = map[verdict];
  return (
    <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 border-[#0E241E] ${s.bg} ${s.text} text-xs font-black uppercase tracking-wide shadow-[3px_3px_0_#0E241E]`}>
      {s.icon}
      {s.label}
    </span>
  );
}

export const InvestigationConsole: React.FC<Props> = ({
  currentInvestigation,
  investigationsList,
  onSelectInvestigation,
  onRefreshInvestigations,
  onNavigateTab,
  initialQuestion,
}) => {
  const [question, setQuestion] = useState(initialQuestion ?? '');
  const [isRunning, setIsRunning] = useState(false);
  const [liveEvents, setLiveEvents] = useState<(InvestigationEvent & { time: string })[]>([]);
  const [runError, setRunError] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion);
    }
  }, [initialQuestion]);

  const handleRun = async (q?: string) => {
    const target = (q ?? question).trim();
    if (!target) return;

    setIsRunning(true);
    setLiveEvents([]);
    setRunError(null);

    try {
      const { id } = await api.createInvestigation(target);
      onSelectInvestigation(id);

      const unsub = api.subscribeToInvestigationEvents(id, ev => {
        setLiveEvents(prev => [...prev, { ...ev, time: new Date().toLocaleTimeString() }]);
        if (ev.type === 'investigation.completed' || ev.type === 'investigation.failed') {
          setIsRunning(false);
          onRefreshInvestigations();
          // Small delay to ensure the backend has persisted the final state
          setTimeout(() => onSelectInvestigation(id), 300);
        }
      });

      await api.runInvestigation(id);

      // Safety: if SSE closes without terminal event, clear running state
      setTimeout(() => setIsRunning(false), 120_000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start investigation';
      setRunError(msg);
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Question Input ─────────────────────────────────────────────── */}
      <div className="passport-card p-6">
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#0E241E] mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black uppercase tracking-tight text-[#0E241E] font-display">
              Investigation Query
            </h2>
            <span className="text-xs font-bold text-[#DE4B39]">· Ground Truth Verification</span>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-[#FAF7F2] border-2 border-[#0E241E] text-[#0E241E] shadow-[2px_2px_0_#0E241E]">
            Sanity Context MCP
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRun()}
            placeholder="Ask a verifiable question — e.g. Did Chandrayaan-3 land on the Moon?"
            className="paper-input flex-1 px-4 py-3 text-sm placeholder-[#7E968F]"
          />
          <button
            onClick={() => handleRun()}
            disabled={isRunning || !question.trim()}
            className="stamp-btn px-6 py-3 text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
          >
            {isRunning
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Investigating…</>
              : <><Play className="w-4 h-4 fill-current" /> Investigate</>
            }
          </button>
        </div>

        {runError && (
          <p className="mt-3 text-xs font-mono text-white bg-[#DE4B39] border-2 border-[#0E241E] rounded-xl px-4 py-2 shadow-[2px_2px_0_#0E241E]">
            Error: {runError}
          </p>
        )}

        {/* Preset queries */}
        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#5B756E] mb-2.5 font-display">Preset cases:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => { setQuestion(p.question); handleRun(p.question); }}
                className="text-left p-4 rounded-xl bg-white hover:bg-[#FAF7F2] border-2 border-[#0E241E] shadow-[3px_3px_0_#0E241E] hover:shadow-[5px_5px_0_#0E241E] hover:-translate-y-px transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#0E241E] ${
                    i === 0 ? 'bg-[#DE4B39] text-white' : i === 1 ? 'bg-[#F5A623] text-[#0E241E]' : 'bg-[#1E3A34] text-white'
                  }`}>
                    {p.tag}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0E241E] group-hover:translate-x-1 group-hover:text-[#DE4B39] transition-all" />
                </div>
                <p className="text-xs font-bold text-[#0E241E] mb-1 line-clamp-2">"{p.question}"</p>
                <p className="text-[11px] text-[#5B756E] line-clamp-2">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: case list + live log */}
        <div className="lg:col-span-4 space-y-5">
          {/* Case list */}
          <div className="passport-card p-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#0E241E] mb-3">
              <span className="text-xs font-black uppercase tracking-wide text-[#0E241E] font-display">
                Cases ({investigationsList.length})
              </span>
              <button
                onClick={onRefreshInvestigations}
                className="p-1.5 rounded-lg border-2 border-[#0E241E] bg-white hover:bg-[#FAF7F2] shadow-[2px_2px_0_#0E241E] cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#0E241E]" />
              </button>
            </div>

            {investigationsList.length === 0 ? (
              <p className="text-xs text-[#5B756E] italic text-center py-6">
                No investigations yet. Submit a question above.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {investigationsList.map(inv => {
                  const active = currentInvestigation?.id === inv.id;
                  return (
                    <button
                      key={inv.id}
                      onClick={() => onSelectInvestigation(inv.id)}
                      className={`w-full text-left p-3 rounded-xl border-2 border-[#0E241E] transition-all cursor-pointer ${
                        active ? 'bg-[#0E241E] text-white shadow-[3px_3px_0_#DE4B39]' : 'bg-white text-[#0E241E] shadow-[2px_2px_0_#0E241E] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="font-bold">{inv.id}</span>
                        <span className={`px-1.5 py-0.5 rounded border ${
                          active ? 'border-[#DE4B39] bg-[#DE4B39] text-white font-bold' : 'border-[#0E241E] bg-[#FAF7F2] text-[#0E241E]'
                        }`}>
                          {inv.verdict ?? inv.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs font-bold line-clamp-1">{inv.question}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Live event log (Dark Pine Terminal) */}
          <div className="passport-card p-5 bg-[#FAF7F2]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#0E241E] mb-3">
              <div className="flex items-center gap-2">
                {isRunning && <span className="w-2.5 h-2.5 rounded-full bg-[#DE4B39] border border-[#0E241E] animate-ping" />}
                <span className="text-xs font-black uppercase tracking-wide text-[#0E241E] font-display">Agent Log</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#0E201B] border border-[#0E241E] px-2 py-0.5 rounded text-[#2EC4B6]">
                {currentInvestigation?.currentStep ?? (isRunning ? 'RUNNING' : 'IDLE')}
              </span>
            </div>

            <div className="bg-[#0E201B] rounded-xl border-2 border-[#0E241E] p-3.5 max-h-72 overflow-y-auto font-mono text-[11px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
              {liveEvents.length > 0 ? (
                liveEvents.map((ev, i) => (
                  <div key={i} className="flex items-start gap-2 py-1 border-b border-white/5 last:border-none">
                    <span className="text-[#5B756E] shrink-0">{ev.time}</span>
                    <span className="font-bold text-[#2EC4B6] shrink-0">{ev.type}</span>
                    {ev.data && Object.keys(ev.data).length > 0 && (
                      <span className="text-[#A3C2B8] truncate">
                        {JSON.stringify(ev.data).slice(0, 60)}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[#5B756E] italic text-center py-6">
                  {currentInvestigation
                    ? `Investigation ${currentInvestigation.id} — ${currentInvestigation.status}`
                    : 'Awaiting investigation trigger…'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: verdict + answer */}
        <div className="lg:col-span-8 space-y-5">
          {currentInvestigation ? (
            <>
              {/* Verdict card */}
              <div className="passport-card p-6 shadow-[5px_6px_0_#0E241E]">
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b-2 border-[#0E241E]">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#5B756E] font-bold">Epistemic Verdict</p>
                    <p className="text-xl font-black font-mono text-[#0E241E] mt-0.5">{currentInvestigation.id}</p>
                  </div>
                  <VerdictBadge verdict={currentInvestigation.verdict} />
                </div>

                {currentInvestigation.verdictRationale && (
                  <div className="mt-4 bg-white p-4 rounded-xl border-2 border-[#0E241E] text-sm leading-relaxed text-[#0E241E] shadow-[2px_2px_0_#0E241E]">
                    {currentInvestigation.verdictRationale}
                  </div>
                )}

                {/* Evidence stats (Hacktoberfest style blocks) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t-2 border-[#0E241E]">
                  {[
                    { label: 'Claims',    value: currentInvestigation.stats.claimsCount },
                    { label: 'Sources',   value: currentInvestigation.stats.sourcesCount },
                    { label: 'Conflicts', value: currentInvestigation.stats.conflictsCount },
                    { label: 'Relations', value: currentInvestigation.stats.relationshipsCount },
                  ].map(s => (
                    <div key={s.label} className="bg-white p-3.5 rounded-xl border-2 border-[#0E241E] text-center shadow-[3px_3px_0_#0E241E]">
                      <p className="text-[10px] text-[#5B756E] font-black uppercase font-display">{s.label}</p>
                      <p className="text-2xl font-black font-mono text-[#0E241E] mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Answer card */}
              <div className="passport-card p-6 shadow-[5px_6px_0_#0E241E]">
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#0E241E] mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#DE4B39] stroke-[2.5]" />
                    <h3 className="text-sm font-black uppercase tracking-tight text-[#0E241E] font-display">
                      Synthesized Finding
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border border-[#0E241E] bg-[#DE4B39] text-white shadow-[2px_2px_0_#0E241E]">
                    SANITY ATTESTED
                  </span>
                </div>

                {currentInvestigation.answer ? (
                  <div className="text-sm leading-7 text-[#0E241E] bg-white p-5 rounded-xl border-2 border-[#0E241E] whitespace-pre-wrap shadow-[2px_2px_0_#0E241E]">
                    {currentInvestigation.answer}
                  </div>
                ) : (
                  <div className="text-sm text-[#5B756E] italic text-center py-8 bg-white rounded-xl border-2 border-[#0E241E]">
                    {currentInvestigation.status === 'completed'
                      ? 'No answer was generated.'
                      : `Investigation is ${currentInvestigation.status}…`}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t-2 border-[#0E241E]">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <Lock className="w-3.5 h-3.5 text-[#DE4B39]" />
                    <span className="text-[#5B756E]">Merkle Root:</span>
                    <span className="bg-white border-2 border-[#0E241E] px-2 py-0.5 rounded font-bold text-[#0E241E] shadow-[2px_2px_0_#0E241E]">
                      {currentInvestigation.evidenceRoot
                        ? `${currentInvestigation.evidenceRoot.slice(0, 16)}…`
                        : 'pending'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onNavigateTab('graph')} className="stamp-btn-secondary px-3.5 py-2 text-xs cursor-pointer">
                      Evidence Graph →
                    </button>
                    <button onClick={() => onNavigateTab('audit')} className="stamp-btn px-3.5 py-2 text-xs cursor-pointer">
                      Audit Probes →
                    </button>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {currentInvestigation.errors.length > 0 && (
                <div className="passport-card p-5 border-2 border-[#0E241E] bg-[#DE4B39] text-white shadow-[4px_4px_0_#0E241E]">
                  <p className="text-xs font-bold uppercase mb-2 font-display">Errors</p>
                  {currentInvestigation.errors.map((e, i) => (
                    <p key={i} className="text-xs font-mono">{e}</p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="passport-card p-16 text-center shadow-[5px_6px_0_#0E241E]">
              <Compass className="w-10 h-10 mx-auto text-[#DE4B39] mb-3 stroke-[1.8]" />
              <p className="text-base font-black text-[#0E241E] font-display">No investigation selected</p>
              <p className="text-xs text-[#5B756E] mt-1">
                Submit a question above or select an existing case from the left list.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
