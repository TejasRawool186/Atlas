import React from 'react';
import { Compass, CheckCircle2, Shield, Layers, Award, Terminal } from 'lucide-react';

const PIPELINE_STEPS = [
  { n: '01', title: 'Agent Orchestration', sub: 'LangGraph State Machine', body: 'Analyzes the question, extracts entities and temporal constraints, and plans a multi-hop retrieval strategy.' },
  { n: '02', title: 'Sanity Context',      sub: 'MCP Protocol Client',     body: 'Discovers schema, queries Layer A (structured GROQ), and fetches sourced documentation from Layer B Knowledge Base.' },
  { n: '03', title: 'Adversarial Audit',   sub: '10 Lethe Probes',         body: 'Contradiction Engine resolves superseded drafts. 10 probes stress-test grounding, temporal consistency, and counterfactual robustness.' },
  { n: '04', title: 'Certification',       sub: 'HMAC-SHA256 Merkle',      body: 'All normalized evidence items are deterministically hashed into a binary Merkle tree and signed with HMAC-SHA256.' },
];

const COMPLIANCE_ITEMS = [
  { title: 'Autonomous Agent',          body: 'LangGraph state machine: planner → retriever → contradiction engine → answer generator → auditor → certificate engine.' },
  { title: 'Sanity Context MCP',        body: 'Standardized MCP client layer connects to the Sanity Context endpoint for schema discovery and structured content retrieval.' },
  { title: 'Meaningful Structured Content', body: 'Layer A schema: Entity, Claim, Source, Relationship, Conflict, Version, Event — evaluated for temporal bounds and multi-hop graph edges.' },
  { title: 'Sourced Knowledge Base',    body: 'Layer B: real sourced release notes, architecture RFCs, changelogs. Every document preserves publisher, author, and date.' },
  { title: 'Usable System',             body: 'Real-time SSE execution trace, interactive evidence graph, 10-probe audit matrix, and cryptographic tamper sandbox.' },
  { title: 'Project ID & Dataset URL',  body: 'Exposed in the Sanity explorer. Project ID and dataset configurable via environment variables.' },
];

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Mandate card */}
      <div className="passport-card p-6 shadow-[6px_8px_0_#0E241E]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#DE4B39] text-white flex items-center justify-center shrink-0 shadow-[3px_3px_0_#0E241E] border-2 border-[#0E241E]">
            <Compass className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#DE4B39] mb-1.5">
              Core Epistemic Principle
            </p>
            <h2 className="text-lg font-black text-[#0E241E] font-display leading-snug">
              "If Sanity Context and the Sanity-backed Knowledge Base are removed, the ATLAS investigation workflow must no longer function correctly."
            </h2>
            <p className="text-sm text-[#5B756E] mt-3 leading-relaxed">
              ATLAS uses structured Sanity schemas — Entities, Claims, Relationships, Conflicts — as the semantic graph driving planning, retrieval, contradiction resolution, adversarial probing, and Merkle certificate generation. It is not a generic RAG chatbot with Sanity loosely attached.
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="passport-card p-6 shadow-[6px_8px_0_#0E241E]">
        <div className="flex items-center gap-2 pb-4 border-b-2 border-[#0E241E] mb-5">
          <Layers className="w-5 h-5 text-[#DE4B39] stroke-[2.2]" />
          <h3 className="text-sm font-black uppercase tracking-tight text-[#0E241E] font-display">
            End-to-End Investigation Pipeline
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PIPELINE_STEPS.map(s => (
            <div key={s.n} className="bg-[#FAF7F2] p-4 rounded-xl border-2 border-[#0E241E] shadow-[3px_3px_0_#0E241E] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-[#DE4B39]">{s.n}</span>
                <span className="text-[10px] font-mono font-bold text-[#0E241E] bg-white border-2 border-[#0E241E] px-2 py-0.5 rounded shadow-[1px_1px_0_#0E241E]">
                  {s.sub}
                </span>
              </div>
              <p className="text-sm font-black text-[#0E241E] font-display">{s.title}</p>
              <p className="text-xs text-[#5B756E] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Full workflow flow */}
      <div className="passport-card p-6 shadow-[6px_8px_0_#0E241E]">
        <div className="flex items-center gap-2 pb-4 border-b-2 border-[#0E241E] mb-5">
          <Terminal className="w-5 h-5 text-[#DE4B39] stroke-[2.2]" />
          <h3 className="text-sm font-black uppercase tracking-tight text-[#0E241E] font-display">
            LangGraph Node Sequence
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
          {[
            'Question Analyzer', '→', 'Entity Resolver', '→',
            'Schema Discovery', '→', 'Sanity Context Retrieval', '→',
            'Contradiction Engine', '→', 'Evidence Aggregator', '→',
            'Answer Generator', '→', 'Adversarial Auditor (×10)', '→',
            'Certificate Engine',
          ].map((step, i) => (
            step === '→'
              ? <span key={i} className="text-[#DE4B39] font-black">→</span>
              : <span key={i} className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E] text-[#0E241E] hover:bg-white transition-colors">
                  {step}
                </span>
          ))}
        </div>
      </div>

      {/* Compliance matrix */}
      <div className="passport-card p-6 shadow-[6px_8px_0_#0E241E]">
        <div className="flex items-center gap-2 pb-4 border-b-2 border-[#0E241E] mb-5">
          <Shield className="w-5 h-5 text-[#2EC4B6] stroke-[2.2]" />
          <h3 className="text-sm font-black uppercase tracking-tight text-[#0E241E] font-display">
            Sanity Challenge — Path One Compliance
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMPLIANCE_ITEMS.map(item => (
            <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-[#FAF7F2] border-2 border-[#0E241E] shadow-[3px_3px_0_#0E241E]">
              <div className="w-7 h-7 rounded-lg bg-[#2EC4B6] text-[#0E241E] flex items-center justify-center shrink-0 border-2 border-[#0E241E] shadow-[1px_1px_0_#0E241E] mt-0.5">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <p className="text-sm font-black text-[#0E241E] font-display">{item.title}</p>
                <p className="text-xs text-[#5B756E] mt-1 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
