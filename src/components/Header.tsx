import React from 'react';
import { Shield, Compass, BookOpen, Award, Globe, Radio } from 'lucide-react';
import type { SystemStatusResponse, SanityConfigResponse } from '../types.ts';
import type { TabId } from '../App.tsx';

interface HeaderProps {
  systemStatus: SystemStatusResponse | null;
  sanityConfig: SanityConfigResponse | null;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  investigationCount: number;
}

const tabs: { id: TabId; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'console',      label: 'Investigation',  Icon: Radio },
  { id: 'graph',        label: 'Evidence Graph', Icon: Compass },
  { id: 'audit',        label: 'Audit Probes',   Icon: Shield },
  { id: 'certificate',  label: 'Certificate',    Icon: Award },
  { id: 'sanity',       label: 'Sanity Lake',    Icon: BookOpen },
  { id: 'architecture', label: 'Architecture',   Icon: Globe },
];

export const Header: React.FC<HeaderProps> = ({
  systemStatus,
  sanityConfig,
  activeTab,
  setActiveTab,
  investigationCount,
}) => {
  const sanityMode = sanityConfig?.mode ?? null;
  const sanityConnected = sanityMode === 'live';

  return (
    <header className="border-b-2 border-black bg-white sticky top-0 z-40 shadow-[0_4px_0_#000]">
      {/* Status bar */}
      <div className="border-b-2 border-black bg-[#F4F4F4] px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Sanity status pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border-2 border-black bg-white font-bold tracking-wider shadow-[2px_2px_0_#000]">
            <span className={`w-2 h-2 rounded-full border border-black ${sanityConnected ? 'bg-[#FF5A1F] animate-pulse' : 'bg-[#888]'}`} />
            <span>SANITY CONTEXT MCP · {sanityConnected ? 'LIVE' : sanityMode === 'local-corpus' ? 'LOCAL CORPUS' : 'CONNECTING'}</span>
          </div>

          {sanityConfig?.projectId && sanityConfig.projectId !== '(not configured)' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[#555]">Project:</span>
              <span className="font-bold bg-white border border-black px-2 py-0.5 rounded shadow-[2px_2px_0_#000]">
                {sanityConfig.projectId}
              </span>
              <span className="text-[#555]">/ {sanityConfig.dataset}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          {systemStatus?.llm && (
            <span className="text-[#555]">LLM: <strong className="text-black">{systemStatus.llm}</strong></span>
          )}
          <span className="text-[#888] italic">HMAC-SHA256 · Merkle</span>
        </div>
      </div>

      {/* Main header row */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF5A1F] border-2 border-black flex items-center justify-center shadow-[3px_3px_0_#000] shrink-0">
            <Shield className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-black leading-none">ATLAS</h1>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-md border-2 border-black bg-[#FF5A1F] text-black shadow-[2px_2px_0_#000]">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-[#555] font-serif italic mt-0.5">
              AI Knowledge Integrity Auditor
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1.5 flex-wrap">
          {tabs.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer border-2 border-black ${
                  active
                    ? 'bg-black text-white shadow-[3px_3px_0_#000] -translate-y-px'
                    : 'bg-white text-black shadow-[2px_2px_0_#000] hover:bg-[#F4F4F4] hover:-translate-y-px hover:shadow-[3px_3px_0_#000]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 stroke-[2.2] ${active ? 'text-[#FF5A1F]' : 'text-black'}`} />
                <span>{label}</span>
                {id === 'console' && (
                  <span className={`text-[10px] font-mono px-1.5 rounded-full border border-black ${active ? 'bg-[#FF5A1F] text-black' : 'bg-black text-white'}`}>
                    {investigationCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
