import React, { useState } from 'react';
import {
  Shield,
  Compass,
  Award,
  BookOpen,
  ArrowRight,
  Terminal,
  Search,
  CheckCircle2,
  AlertTriangle,
  Radio,
  GitBranch,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Sparkles,
  ExternalLink,
  Lock,
  Zap,
  Plus,
} from 'lucide-react';
import type { TabId } from '../App.tsx';

interface LandingPageProps {
  onNavigateTab: (tab: TabId) => void;
  onSelectQuery?: (query: string) => void;
  onOpenAddTopic?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateTab, onSelectQuery, onOpenAddTopic }) => {
  const [heroQuery, setHeroQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleRunAudit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onSelectQuery && heroQuery.trim()) {
      onSelectQuery(heroQuery.trim());
    }
    onNavigateTab('console');
  };

  const handlePickPreset = (query: string) => {
    if (onSelectQuery) {
      onSelectQuery(query);
    }
    onNavigateTab('console');
  };

  const faqs = [
    {
      q: 'Why is Sanity essential to ATLAS rather than a generic vector database?',
      a: 'Generic vector retrieval relies purely on fuzzy semantic similarity, making it vulnerable to hallucinations and silent temporal drift. ATLAS uses structured Sanity schemas (Entities, Claims, Relationships, Conflicts) as an epistemic semantic graph that directly drives planning, retrieval, contradiction resolution, and deterministic adversarial verification.',
    },
    {
      q: 'How do the 10 Lethe adversarial probes stress-test agent reasoning?',
      a: 'The Lethe suite automatically generates 10 targeted adversarial challenges against each investigation—including temporal distortion, superseded policy injections, entity confabulations, and counterfactual boundary conditions—to verify that the agent never produces ungrounded assertions.',
    },
    {
      q: 'What is an RFC-6962 Merkle certificate and how is it verified?',
      a: 'Every piece of verified evidence is hashed with deterministic SHA-256 into leaves of a binary Merkle tree. ATLAS calculates the Merkle Root and signs it with HMAC-SHA256. Anyone can mathematically verify the seal using the built-in verifier or simulate adversarial tampering in the sandbox.',
    },
    {
      q: 'Can I run ATLAS against my own Sanity project or in local mode?',
      a: 'Yes. ATLAS comes equipped with a bundled local corpus matching the Sanity schema so it runs out-of-the-box with zero configuration. You can switch to live mode simply by setting SANITY_PROJECT_ID and SANITY_API_TOKEN in your environment.',
    },
    {
      q: 'How does LangGraph coordinate the autonomous investigation?',
      a: 'ATLAS uses a compiled LangGraph state machine: Question Analyzer → Entity Resolver → Schema Discovery → Sanity Context Retrieval → Contradiction Engine → Evidence Aggregator → Answer Generator → Adversarial Auditor (×10) → Merkle Certificate Engine.',
    },
  ];

  const benchmarkCases = [
    {
      title: 'Refund Policy Deprecation v2.4',
      type: 'TEMPORAL_DRIFT',
      source: 'Sanity Layer B · RFC-108',
      probe: 'PROBE 04',
      status: 'CONTRADICTION',
      statusBg: 'bg-[#DE4B39]',
      query: 'Does the 2024 refund policy permit cash refunds for enterprise tier customers after 30 days?',
    },
    {
      title: 'Multi-Region Token Quotas',
      type: 'CONCURRENT_MUTATION',
      source: 'Sanity Layer A · Cluster Schema',
      probe: 'PROBE 07',
      status: 'ADVISORY',
      statusBg: 'bg-[#F5A623]',
      query: 'What is the rate limit for the Sanity Context MCP endpoint across EU and US regions?',
    },
    {
      title: 'Enterprise SLA P99 Guarantees',
      type: 'SLA_GROUNDING',
      source: 'Sanity Sourced Changelog',
      probe: 'PROBE 01',
      status: 'SUPPORTED',
      statusBg: 'bg-[#2EC4B6]',
      query: 'What is the guaranteed p99 query latency under the Enterprise SLA?',
    },
    {
      title: 'Sanity Context MCP Discovery',
      type: 'MCP_TOOLSET',
      source: 'Sanity Layer A & B Protocol',
      probe: 'PROBE 09',
      status: 'AUDITED',
      statusBg: 'bg-[#2EC4B6]',
      query: 'Does Sanity Context MCP support schema discovery for agents?',
    },
  ];

  return (
    <div className="space-y-0 -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Deep Forest Pine #1A3831) */}
      {/* ========================================================================= */}
      <section className="bg-[#1A3831] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b-2 border-[#0E241E] relative overflow-hidden">
        {/* Subtle decorative grid background */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#FAF7F2 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Top Banner Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-[#0E241E] bg-[#142C26] text-xs font-mono font-bold tracking-widest text-[#2EC4B6] shadow-[3px_3px_0_#0E241E] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#DE4B39] animate-pulse" />
            <span>SANITY CHALLENGE 2026 · PATH ONE: AUTONOMOUS AGENT AUDITING</span>
          </div>

          {/* Huge Display Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight leading-[1.08] text-[#FAF7F2]">
            300+ Epistemic Audits.{' '}
            <span className="text-[#DE4B39] underline decoration-[#0E241E] decoration-wavy decoration-2">
              One is running now.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-[#A3C2B8] max-w-3xl mx-auto font-sans leading-relaxed font-normal">
            Autonomous AI agents drifting into hallucinations? ATLAS grounds agent logic against structured
            Sanity Content Lake schemas with 10 Lethe adversarial probes and cryptographic Merkle certificates.
          </p>

          {/* Retro Neo-Brutalist Search / Audit Input */}
          <form onSubmit={handleRunAudit} className="max-w-2xl mx-auto pt-2">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-[#FAF7F2] p-2 rounded-2xl border-2 border-[#0E241E] shadow-[6px_8px_0_#0E241E]">
              <div className="flex items-center gap-3 px-3 flex-1 text-[#0E241E]">
                <Search className="w-5 h-5 text-[#DE4B39] stroke-[2.5] shrink-0" />
                <input
                  type="text"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  placeholder="Ask an epistemic claim (e.g. Can an agent claim refunds after deprecation?)"
                  className="w-full bg-transparent text-xs sm:text-sm font-sans font-medium text-[#0E241E] placeholder:text-[#5B756E] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="stamp-btn px-6 py-3 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shadow-[3px_3px_0_#0E241E]"
              >
                <span>Run Epistemic Audit</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>

          {/* Quick Ingest Article Action */}
          {onOpenAddTopic && (
            <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5 text-xs font-mono">
              <span className="text-[#A3C2B8]">Want to audit your own documentation or article?</span>
              <button
                type="button"
                onClick={onOpenAddTopic}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F5A623] text-[#0E241E] border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E] font-bold font-display hover:-translate-y-px transition-transform cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Ingest Article Link / Topic</span>
              </button>
            </div>
          )}

          {/* Stylized Interactive Epistemic World Map */}
          <div className="pt-6">
            <div className="bg-[#142C26] rounded-2xl border-2 border-[#0E241E] p-6 shadow-[6px_8px_0_#0E241E] relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-[#0E241E] text-xs font-mono text-[#A3C2B8]">
                <span className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#2EC4B6] animate-pulse" />
                  EPISTEMIC NETWORK TOPOLOGY · REAL-TIME
                </span>
                <span className="text-[11px] bg-[#0E201B] px-2 py-0.5 rounded border border-[#0E241E] text-[#2EC4B6]">
                  100% Deterministic Grounding
                </span>
              </div>

              {/* Vector SVG Knowledge Network */}
              <div className="py-6 relative min-h-[180px] flex items-center justify-center">
                <svg viewBox="0 0 800 240" className="w-full h-auto max-h-[220px]">
                  {/* Subtle continent dots background */}
                  <g opacity="0.18" fill="#A3C2B8">
                    {/* North America */}
                    <circle cx="150" cy="70" r="3" />
                    <circle cx="170" cy="60" r="3" />
                    <circle cx="190" cy="80" r="4" />
                    <circle cx="210" cy="100" r="3" />
                    <circle cx="160" cy="110" r="3" />
                    {/* Europe */}
                    <circle cx="410" cy="65" r="4" />
                    <circle cx="430" cy="75" r="3" />
                    <circle cx="450" cy="60" r="3" />
                    <circle cx="470" cy="80" r="4" />
                    {/* Asia */}
                    <circle cx="560" cy="70" r="3" />
                    <circle cx="600" cy="85" r="4" />
                    <circle cx="640" cy="100" r="3" />
                    <circle cx="680" cy="120" r="3" />
                    {/* South America */}
                    <circle cx="250" cy="160" r="3" />
                    <circle cx="270" cy="190" r="4" />
                    {/* Africa */}
                    <circle cx="420" cy="140" r="4" />
                    <circle cx="440" cy="170" r="3" />
                  </g>

                  {/* Interconnecting glowing graph edges */}
                  <g stroke="#2EC4B6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6">
                    <line x1="180" y1="85" x2="330" y2="120" />
                    <line x1="330" y1="120" x2="430" y2="70" />
                    <line x1="430" y1="70" x2="520" y2="140" />
                    <line x1="520" y1="140" x2="660" y2="95" />
                    <line x1="330" y1="120" x2="520" y2="140" stroke="#DE4B39" />
                  </g>

                  {/* Pulsing Nodes */}
                  {/* Node 1: Sanity Context Lake */}
                  <g transform="translate(180, 85)">
                    <circle r="14" fill="#DE4B39" stroke="#FAF7F2" strokeWidth="2" />
                    <circle r="22" fill="none" stroke="#DE4B39" strokeWidth="1.5" opacity="0.6">
                      <animate attributeName="r" values="14;28;14" dur="3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <text y="32" textAnchor="middle" fill="#FAF7F2" fontSize="10" fontFamily="Space Mono" fontWeight="bold">
                      Sanity Lake (Layer A)
                    </text>
                  </g>

                  {/* Node 2: LangGraph Orchestrator */}
                  <g transform="translate(330, 120)">
                    <circle r="16" fill="#F5A623" stroke="#0E241E" strokeWidth="2" />
                    <text y="4" textAnchor="middle" fill="#0E241E" fontSize="10" fontFamily="Space Grotesk" fontWeight="bold">
                      LG
                    </text>
                    <text y="32" textAnchor="middle" fill="#FAF7F2" fontSize="10" fontFamily="Space Mono" fontWeight="bold">
                      LangGraph Engine
                    </text>
                  </g>

                  {/* Node 3: Sourced Docs */}
                  <g transform="translate(430, 70)">
                    <circle r="12" fill="#2EC4B6" stroke="#0E241E" strokeWidth="2" />
                    <text y="28" textAnchor="middle" fill="#FAF7F2" fontSize="10" fontFamily="Space Mono" fontWeight="bold">
                      Layer B Knowledge
                    </text>
                  </g>

                  {/* Node 4: 10 Lethe Probes */}
                  <g transform="translate(520, 140)">
                    <circle r="15" fill="#DE4B39" stroke="#FAF7F2" strokeWidth="2" />
                    <text y="4" textAnchor="middle" fill="#FAF7F2" fontSize="10" fontFamily="Space Grotesk" fontWeight="bold">
                      ×10
                    </text>
                    <text y="32" textAnchor="middle" fill="#FAF7F2" fontSize="10" fontFamily="Space Mono" fontWeight="bold">
                      Lethe Probes
                    </text>
                  </g>

                  {/* Node 5: RFC-6962 Merkle Seal */}
                  <g transform="translate(660, 95)">
                    <polygon points="0,-16 14,0 0,16 -14,0" fill="#2EC4B6" stroke="#0E241E" strokeWidth="2" />
                    <text y="30" textAnchor="middle" fill="#FAF7F2" fontSize="10" fontFamily="Space Mono" fontWeight="bold">
                      Merkle Root (SHA-256)
                    </text>
                  </g>
                </svg>
              </div>

              <p className="text-xs text-[#A3C2B8] italic">
                Active epistemic nodes verify temporal boundaries, schema relationships, and counterfactual constraints in real time.
              </p>
            </div>
          </div>
        </div>

        {/* Sponsor / Trust Ecosystem Strip */}
        <div className="max-w-5xl mx-auto mt-10 bg-[#FAF7F2] rounded-2xl border-2 border-[#0E241E] p-4 text-[#0E241E] shadow-[5px_6px_0_#0E241E] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#DE4B39]">
              Built with:
            </span>
            <span className="text-xs font-bold text-[#0E241E] font-display">
              Sanity Content Lake · LangGraph State Machine · RFC-6962 Merkle Trees
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono font-bold flex-wrap">
            {['Sanity.io', 'LangGraph', 'Groq Llama-3.3', 'TypeScript', 'Vite', 'Express'].map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg bg-white border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E] text-[11px]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. WHAT IS ATLAS? (Deep Forest Pine #142C26) */}
      {/* ========================================================================= */}
      <section className="bg-[#142C26] text-white py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-[#0E241E]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 space-y-2">
            <p className="text-xs font-mono font-bold text-[#2EC4B6] uppercase tracking-widest">
              INTRODUCTION
            </p>
            <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[#FAF7F2]">
              What is <span className="text-[#F5A623]">ATLAS?</span>
            </h2>
          </div>

          <div className="md:col-span-7 space-y-5 text-sm sm:text-base text-[#D3E4DC] leading-relaxed">
            <p>
              ATLAS is an autonomous epistemic auditor designed specifically for modern AI agent systems.
              While traditional benchmarks rely on probabilistic text similarity, ATLAS grounds every claim
              against structured Sanity Content Lake schemas (<strong className="text-white">Layer A</strong>)
              and immutable source documentation (<strong className="text-white">Layer B</strong>).
            </p>
            <p>
              Whenever an agent encounters temporal ambiguities or superseded policies, the ATLAS Contradiction
              Engine detects epistemic drift and generates an RFC-6962 HMAC-SHA256 cryptographic certificate.
            </p>
            <p className="text-xs font-mono text-[#A3C2B8] bg-[#0E201B] p-3 rounded-xl border border-[#0E241E]">
              "If Sanity Context and the Sanity-backed Knowledge Base are removed, the ATLAS investigation
              workflow must no longer function correctly."
            </p>
            <div>
              <button
                onClick={() => onNavigateTab('architecture')}
                className="stamp-btn px-5 py-2.5 text-xs font-display flex items-center gap-2 cursor-pointer shadow-[3px_3px_0_#0E241E]"
              >
                <span>EXPLORE SYSTEM ARCHITECTURE</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ACTIVE BENCHMARK CASES (Warm Oat #FAF7F2) */}
      {/* ========================================================================= */}
      <section className="bg-[#FAF7F2] text-[#0E241E] py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-[#0E241E]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-mono font-bold text-[#5B756E] uppercase tracking-wider">
                EPISTEMIC TESTBED
              </p>
              <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#0E241E]">
                Upcoming <span className="text-[#DE4B39]">Benchmark Cases.</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5B756E] max-w-md font-sans">
              Live adversarial benchmark scenarios stress-tested against structured Sanity schemas and temporal rules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benchmarkCases.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handlePickPreset(item.query)}
                className="passport-card p-5 cursor-pointer hover:-translate-y-1 hover:shadow-[7px_9px_0_#0E241E] transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-[#0E241E]">
                  <div>
                    <h3 className="text-base font-black font-display text-[#0E241E] leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] font-mono text-[#5B756E] mt-1">{item.source}</p>
                  </div>
                  <div className="bg-[#0E201B] text-[#FAF7F2] p-2 rounded-xl border-2 border-[#0E241E] text-center min-w-[70px] shadow-[2px_2px_0_#0E241E] shrink-0">
                    <span className="block text-[9px] font-mono font-bold text-[#A3C2B8] uppercase">
                      {item.probe}
                    </span>
                    <span className="block text-xs font-black font-display text-[#2EC4B6]">
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-[#F5EFE6] border border-[#0E241E] font-bold text-[10px] text-[#0E241E]">
                    {item.type}
                  </span>
                  <span className="text-[#DE4B39] font-bold flex items-center gap-1 hover:underline">
                    Run case <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center sm:text-left">
            <button
              onClick={() => onNavigateTab('audit')}
              className="stamp-btn px-6 py-3 text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-[4px_4px_0_#0E241E]"
            >
              <span>Inspect All 10 Lethe Benchmark Probes</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CAN'T TRUST BLACK-BOX LLMS? AUDIT FROM ANYWHERE (Warm Oat #FAF7F2) */}
      {/* ========================================================================= */}
      <section className="bg-[#F5EFE6] text-[#0E241E] py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-[#0E241E]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-mono font-bold text-[#5B756E] uppercase tracking-wider">
                CONTINUOUS VERIFICATION
              </p>
              <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#0E241E]">
                Can't trust black-box LLMs? <br />
                <span className="text-[#DE4B39]">Audit from anywhere.</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5B756E] max-w-sm">
              Continuous deterministic auditing for autonomous AI agents, multi-agent workflows, and enterprise retrieval systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Feature 1 */}
            <div className="passport-card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#2EC4B6] border-2 border-[#0E241E] flex items-center justify-center text-[#0E241E] shadow-[3px_3px_0_#0E241E] mb-4">
                  <Terminal className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-lg font-black font-display text-[#0E241E]">
                  Live SSE Tracing
                </h3>
                <p className="text-xs text-[#5B756E] mt-2 leading-relaxed">
                  Stream step-by-step state machine execution logs in real time. Watch entity resolution,
                  GROQ schema queries, and prompt synthesis live.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('console')}
                className="text-xs font-mono font-bold text-[#DE4B39] flex items-center gap-1.5 pt-2 hover:underline cursor-pointer"
              >
                Inspect Agent Log <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 2 */}
            <div className="passport-card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#F5A623] border-2 border-[#0E241E] flex items-center justify-center text-[#0E241E] shadow-[3px_3px_0_#0E241E] mb-4">
                  <Shield className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-lg font-black font-display text-[#0E241E]">
                  10 Lethe Probes
                </h3>
                <p className="text-xs text-[#5B756E] mt-2 leading-relaxed">
                  Automated probes inject counterfactual traps, temporal distortions, and entity
                  confabulations to calculate an Epistemic Resilience Score.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('audit')}
                className="text-xs font-mono font-bold text-[#DE4B39] flex items-center gap-1.5 pt-2 hover:underline cursor-pointer"
              >
                View Audit Matrix <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 3 */}
            <div className="passport-card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#DE4B39] border-2 border-[#0E241E] flex items-center justify-center text-white shadow-[3px_3px_0_#0E241E] mb-4">
                  <Award className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-lg font-black font-display text-[#0E241E]">
                  RFC-6962 Merkle Seal
                </h3>
                <p className="text-xs text-[#5B756E] mt-2 leading-relaxed">
                  Deterministic SHA-256 leaves assembled into a binary Merkle tree and signed with HMAC-SHA256.
                  Mathematically testable with tamper detection.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('certificate')}
                className="text-xs font-mono font-bold text-[#DE4B39] flex items-center gap-1.5 pt-2 hover:underline cursor-pointer"
              >
                Verify Merkle Proofs <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. QUERY, STRESS-TEST, CERTIFY (Deep Forest Pine #1A3831) */}
      {/* ========================================================================= */}
      <section className="bg-[#1A3831] text-white py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-[#0E241E]">
        <div className="max-w-5xl mx-auto space-y-10">
          <div>
            <p className="text-xs font-mono font-bold text-[#2EC4B6] uppercase tracking-wider">
              THREE-STAGE METHODOLOGY
            </p>
            <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#FAF7F2]">
              Query, stress-test, <span className="text-[#F5A623]">certify.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-[#142C26] p-6 rounded-2xl border-2 border-[#0E241E] shadow-[5px_6px_0_#0E241E] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] text-[#0E241E] flex items-center justify-center font-mono font-black text-lg border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E]">
                01
              </div>
              <h3 className="text-base font-black font-display text-[#FAF7F2]">
                Query Sanity Context
              </h3>
              <p className="text-xs text-[#A3C2B8] leading-relaxed">
                Connect to Sanity Context MCP endpoint. Discover schema, query structured GROQ claims,
                and fetch verified documentation chunks from Layer A and B.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#142C26] p-6 rounded-2xl border-2 border-[#0E241E] shadow-[5px_6px_0_#0E241E] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F5A623] text-[#0E241E] flex items-center justify-center font-mono font-black text-lg border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E]">
                02
              </div>
              <h3 className="text-base font-black font-display text-[#FAF7F2]">
                Run 10 Adversarial Probes
              </h3>
              <p className="text-xs text-[#A3C2B8] leading-relaxed">
                Trigger the Contradiction Engine and 10 Lethe probes to detect temporal conflicts,
                superseded drafts, and subtle semantic drift in real time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#142C26] p-6 rounded-2xl border-2 border-[#0E241E] shadow-[5px_6px_0_#0E241E] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#DE4B39] text-white flex items-center justify-center font-mono font-black text-lg border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E]">
                03
              </div>
              <h3 className="text-base font-black font-display text-[#FAF7F2]">
                Mint Merkle Certificate
              </h3>
              <p className="text-xs text-[#A3C2B8] leading-relaxed">
                Compute SHA-256 leaves for all evidence items, assemble the Merkle root, and sign with
                HMAC-SHA256 for deterministic non-repudiation.
              </p>
            </div>
          </div>

          <div className="text-center sm:text-left pt-2">
            <button
              onClick={() => onNavigateTab('console')}
              className="stamp-btn px-6 py-3 text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-[4px_4px_0_#0E241E]"
            >
              <span>Launch Your First Investigation</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. BACKING THE BUILDERS (Warm Oat #FAF7F2) */}
      {/* ========================================================================= */}
      <section className="bg-[#FAF7F2] text-[#0E241E] py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-[#0E241E]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-mono font-bold text-[#5B756E] uppercase tracking-wider">
                ARCHITECTURE ECOSYSTEM
              </p>
              <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#0E241E]">
                Backing the <span className="text-[#DE4B39]">builders.</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5B756E] max-w-sm">
              Engineered with production-grade open standards, cryptographic primitives, and structured content infrastructure.
            </p>
          </div>

          {/* Featured Sponsors Card Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="passport-card p-6 flex items-center justify-between shadow-[4px_4px_0_#0E241E]">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#DE4B39]">Primary Content Lake</span>
                <h4 className="text-xl font-black font-display text-[#0E241E]">Sanity.io</h4>
                <p className="text-xs text-[#5B756E]">Layer A Structured Schemas · Layer B Sourced Knowledge</p>
              </div>
              <div className="px-3 py-1 rounded-xl bg-[#DE4B39] text-white font-mono text-xs font-bold border-2 border-[#0E241E]">
                MCP
              </div>
            </div>

            <div className="passport-card p-6 flex items-center justify-between shadow-[4px_4px_0_#0E241E]">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#2EC4B6]">Agent Orchestration</span>
                <h4 className="text-xl font-black font-display text-[#0E241E]">LangGraph</h4>
                <p className="text-xs text-[#5B756E]">Compiled State Graph Machine · Dynamic Multi-Hop Routing</p>
              </div>
              <div className="px-3 py-1 rounded-xl bg-[#2EC4B6] text-[#0E241E] font-mono text-xs font-bold border-2 border-[#0E241E]">
                STATE
              </div>
            </div>
          </div>

          {/* Grid of Technologies */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { name: 'Groq Cloud', role: 'Llama 3.3 70B' },
              { name: 'RFC-6962', role: 'Merkle Tree Standard' },
              { name: 'TypeScript', role: 'Strict Type System' },
              { name: 'Express.js', role: 'Streaming API Server' },
              { name: 'Vite & React', role: 'Modern UI Runtime' },
              { name: 'Tailwind CSS', role: 'Neo-Brutalist Styles' },
              { name: 'HMAC-SHA256', role: 'Cryptographic Integrity' },
              { name: 'GROQ Engine', role: 'Graph-Oriented Queries' },
              { name: 'Server-Sent Events', role: 'Real-time Trace Telemetry' },
              { name: 'Lethe Probes', role: '10 Adversarial Vectors' },
              { name: 'MCP Protocol', role: 'Model Context Protocol' },
              { name: 'GitHub CI/CD', role: 'Automated Test Suites' },
            ].map((tech, idx) => (
              <div
                key={idx}
                className="bg-white p-3.5 rounded-xl border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E] flex flex-col justify-center"
              >
                <p className="text-xs font-black font-display text-[#0E241E] truncate">{tech.name}</p>
                <p className="text-[10px] font-mono text-[#5B756E] mt-0.5 truncate">{tech.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. EVERYTHING ELSE, ANSWERED (Warm Oat #FAF7F2) */}
      {/* ========================================================================= */}
      <section className="bg-[#FAF7F2] text-[#0E241E] py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-[#0E241E]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-mono font-bold text-[#5B756E] uppercase tracking-wider">
                COMMON QUESTIONS
              </p>
              <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#0E241E]">
                Everything else, <span className="text-[#DE4B39]">answered.</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5B756E] max-w-sm">
              Answers to questions on epistemic auditing, Sanity grounding, and cryptographic certificates.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="passport-card overflow-hidden transition-all shadow-[3px_3px_0_#0E241E]"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-white transition-colors"
                  >
                    <span className="text-sm sm:text-base font-black font-display text-[#0E241E]">
                      {faq.q}
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-[#F5EFE6] border-2 border-[#0E241E] flex items-center justify-center shrink-0 text-[#0E241E]">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[#5B756E] leading-relaxed border-t border-[#0E241E]/15">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => onNavigateTab('console')}
              className="stamp-btn px-8 py-3.5 text-xs sm:text-sm flex items-center gap-2 mx-auto cursor-pointer shadow-[4px_4px_0_#0E241E]"
            >
              <span>Launch Auditor Console</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER (Warm Oat #FAF7F2) */}
      {/* ========================================================================= */}
      <footer className="bg-[#F5EFE6] text-[#0E241E] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#DE4B39] text-white flex items-center justify-center border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E]">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-lg font-black font-display">ATLAS</span>
              </div>
              <p className="text-[#5B756E] leading-relaxed">
                Autonomous AI Knowledge Integrity Auditor built for the Sanity Challenge (Path One).
              </p>
            </div>

            <div>
              <p className="font-bold uppercase tracking-wider text-[#0E241E] mb-3 font-display">Auditor</p>
              <ul className="space-y-2 text-[#5B756E] font-medium">
                <li><button onClick={() => onNavigateTab('console')} className="hover:text-[#DE4B39] cursor-pointer">Investigation Console</button></li>
                <li><button onClick={() => onNavigateTab('graph')} className="hover:text-[#DE4B39] cursor-pointer">Evidence Graph</button></li>
                <li><button onClick={() => onNavigateTab('audit')} className="hover:text-[#DE4B39] cursor-pointer">10 Lethe Probes</button></li>
                <li><button onClick={() => onNavigateTab('certificate')} className="hover:text-[#DE4B39] cursor-pointer">Merkle Certificate</button></li>
              </ul>
            </div>

            <div>
              <p className="font-bold uppercase tracking-wider text-[#0E241E] mb-3 font-display">Sanity Context</p>
              <ul className="space-y-2 text-[#5B756E] font-medium">
                <li><button onClick={() => onNavigateTab('sanity')} className="hover:text-[#DE4B39] cursor-pointer">Layer A Schemas</button></li>
                <li><button onClick={() => onNavigateTab('sanity')} className="hover:text-[#DE4B39] cursor-pointer">Layer B Knowledge</button></li>
                <li><button onClick={() => onNavigateTab('sanity')} className="hover:text-[#DE4B39] cursor-pointer">GROQ Query Executor</button></li>
                <li><button onClick={() => onNavigateTab('architecture')} className="hover:text-[#DE4B39] cursor-pointer">MCP Protocol Client</button></li>
              </ul>
            </div>

            <div>
              <p className="font-bold uppercase tracking-wider text-[#0E241E] mb-3 font-display">Standards</p>
              <ul className="space-y-2 text-[#5B756E] font-medium">
                <li><span className="text-[#5B756E]">RFC-6962 Merkle Trees</span></li>
                <li><span className="text-[#5B756E]">LangGraph State Machines</span></li>
                <li><span className="text-[#5B756E]">HMAC-SHA256 Non-Repudiation</span></li>
                <li><span className="text-[#5B756E]">Zero-Trust Epistemics</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-[#0E241E]/15 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#5B756E]">
            <p>© 2026 ATLAS Knowledge Integrity Auditor · Path One Compliance.</p>
            <p className="text-[#DE4B39] font-bold">Deterministic Grounding · Zero Hallucinations</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
