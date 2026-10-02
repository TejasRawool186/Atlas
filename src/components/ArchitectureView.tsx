import React from 'react';
import { Compass, CheckCircle2, Shield, Globe, Award, BookOpen } from 'lucide-react';

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
      <div className="passport-card p-6 shadow-[6px_8px_0_#000]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-[3px_3px_0_#000]">
            <Compass className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#555] mb-1.5">
              Core Epistemic Principle
            </p>
            <h2 className="text-lg font-black text-black font-serif leading-snug">
              "If Sanity Context and the Sanity-backed Knowledge Base are removed, the ATLAS investigation workflow must no longer function correctly."
            </h2>
            <p className="text-sm text-[#555] font-serif italic mt-3 leading-relaxed">
              ATLAS uses structured Sanity schemas — Entities, Claims, Relationships, Conflicts — as the semantic graph driving planning, retrieval, contradiction resolution, adversarial probing, and Merkle certificate generation. It is not a generic RAG chatbot with Sanity loosely attached.
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="passport-card p-6 shadow-[6px_8px_0_#000]">
        <h3 className="text-sm font-black uppercase tracking-tight text-black pb-4 border-b-2 border-black mb-5">
          End-to-End Investigation Pipeline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PIPELINE_STEPS.map(s => (
            <div key={s.n} className="bg-[#F4F4F4] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0_#000] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#555]">{s.n}</span>
                <span className="text-[10px] font-mono font-bold text-black bg-white border border-black px-2 py-0.5 rounded shadow-[2px_2px_0_#000]">{s.sub}</span>
              </div>
              <p className="text-sm font-black text-black">{s.title}</p>
              <p className="text-xs text-[#555] font-serif italic leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Full workflow flow */}
      <div className="passport-card p-6 shadow-[6px_8px_0_#000]">
        <h3 className="text-sm font-black uppercase tracking-tight text-black pb-4 border-b-2 border-black mb-5">
          LangGraph Node Sequence
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
          {[
            'Question Analyzer', '→', 'Entity Resolver', '→',
            'Schema Discovery', '→', 'Sanity Context Retrieval', '→',
            'Contradiction Engine', '→', 'Evidence Aggregator', '→',
            'Answer Generator', '→', 'Adversarial Auditor (×10)', '→',
            'Certificate Engine',
          ].map((step, i) => (
            step === '→'
              ? <span key={i} className="text-[#555]">→</span>
              : <span key={i} className="px-2.5 py-1.5 rounded-xl bg-[#F4F4F4] border-2 border-black shadow-[2px_2px_0_#000] text-black">{step}</span>
          ))}
        </div>
      </div>

      {/* Compliance matrix */}
      <div className="passport-card p-6 shadow-[6px_8px_0_#000]">
        <h3 className="text-sm font-black uppercase tracking-tight text-black pb-4 border-b-2 border-black mb-5">
          Sanity Challenge — Path One Compliance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMPLIANCE_ITEMS.map(item => (
            <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-[#F4F4F4] border-2 border-black shadow-[2px_2px_0_#000]">
              <CheckCircle2 className="w-5 h-5 text-black stroke-[3] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-black text-black">{item.title}</p>
                <p className="text-xs text-[#555] italic mt-1 leading-relaxed font-serif">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
