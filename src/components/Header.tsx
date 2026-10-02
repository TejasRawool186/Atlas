import React from 'react';
import { Shield, Compass, BookOpen, Award, Globe, Radio, Flame, Plus } from 'lucide-react';
import type { SystemStatusResponse, SanityConfigResponse } from '../types.ts';
import type { TabId } from '../App.tsx';

interface HeaderProps {
  systemStatus: SystemStatusResponse | null;
  sanityConfig: SanityConfigResponse | null;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  investigationCount: number;
  onOpenAddTopic?: () => void;
}

const tabs: { id: TabId; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'landing',      label: 'Overview',       Icon: Flame },
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
  onOpenAddTopic,
}) => {
  const sanityMode = sanityConfig?.mode ?? null;
  const sanityConnected = sanityMode === 'live';

  return (
    <header className="border-b-2 border-[#0E241E] bg-[#FAF7F2] sticky top-0 z-40 shadow-[0_4px_0_#0E241E] transition-colors">
      {/* Main header row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
          title="Go to Overview Landing Page"
        >
          <div className="w-10 h-10 rounded-xl bg-[#DE4B39] border-2 border-[#0E241E] flex items-center justify-center shadow-[3px_3px_0_#0E241E] shrink-0 group-hover:-translate-y-0.5 transition-transform">
            <Shield className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-[#0E241E] leading-none font-display">ATLAS</h1>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-md border-2 border-[#0E241E] bg-[#DE4B39] text-white shadow-[2px_2px_0_#0E241E]">
                2026
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[10.5px] text-[#5B756E] font-sans font-semibold tracking-tight">
                AI Knowledge Integrity Auditor
              </p>
              {sanityConnected && (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-[#144A3E] bg-[#2EC4B6]/25 border border-[#144A3E]/30 px-1.5 py-0.2 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2EC4B6] animate-pulse" />
                  Live
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation & Action */}
        <div className="flex items-center gap-2 flex-wrap">
          <nav className="flex items-center gap-1.5 flex-wrap">
            {tabs.map(({ id, label, Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-[11px] lg:text-xs font-bold uppercase tracking-wide transition-all cursor-pointer border-2 border-[#0E241E] font-display shrink-0 ${
                    active
                      ? 'bg-[#DE4B39] text-white shadow-[2px_2px_0_#0E241E] -translate-y-0.5'
                      : 'bg-white text-[#0E241E] shadow-[2px_2px_0_#0E241E] hover:bg-[#F3ECE0] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#0E241E]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 stroke-[2.2] ${active ? 'text-white' : 'text-[#0E241E]'}`} />
                  <span>{label}</span>
                  {id === 'console' && (
                    <span
                      className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded-full border border-[#0E241E] ${
                        active ? 'bg-white text-[#0E241E]' : 'bg-[#DE4B39] text-white'
                      }`}
                    >
                      {investigationCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {onOpenAddTopic && (
            <button
              onClick={onOpenAddTopic}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide bg-[#F5A623] text-[#0E241E] border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E] hover:-translate-y-px hover:shadow-[3px_3px_0_#0E241E] cursor-pointer font-display ml-1"
              title="Ingest new article link or topic into Sanity"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Add Topic / URL</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}

          {activeTab !== 'console' && (
            <button
              onClick={() => setActiveTab('console')}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide bg-[#2EC4B6] text-[#0E241E] border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E] hover:-translate-y-px hover:shadow-[3px_3px_0_#0E241E] cursor-pointer font-display ml-1"
            >
              <span>Audit Console</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
