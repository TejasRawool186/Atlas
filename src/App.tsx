/**
 * ATLAS — Application Root
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { InvestigationConsole } from './components/InvestigationConsole.tsx';
import { EvidenceGraph } from './components/EvidenceGraph.tsx';
import { AuditMatrix } from './components/AuditMatrix.tsx';
import { CertificateVerifier } from './components/CertificateVerifier.tsx';
import { SanityExplorer } from './components/SanityExplorer.tsx';
import { ArchitectureView } from './components/ArchitectureView.tsx';
import { AddTopicModal } from './components/AddTopicModal.tsx';
import { api } from './api.ts';
import type {
  InvestigationSummary,
  InvestigationDetail,
  EvidenceGraphResponse,
  AuditReportResponse,
  AtlasCertificateResponse,
  SystemStatusResponse,
  SanityConfigResponse,
} from './types.ts';

export type TabId = 'landing' | 'console' | 'graph' | 'audit' | 'certificate' | 'sanity' | 'architecture';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('landing');
  const [stagedQuery, setStagedQuery] = useState<string>('');
  const [isAddTopicOpen, setIsAddTopicOpen] = useState<boolean>(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatusResponse | null>(null);
  const [sanityConfig, setSanityConfig] = useState<SanityConfigResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [investigationsList, setInvestigationsList] = useState<InvestigationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [currentInvestigation, setCurrentInvestigation] = useState<InvestigationDetail | null>(null);
  const [evidenceGraph, setEvidenceGraph] = useState<EvidenceGraphResponse | null>(null);
  const [auditReport, setAuditReport] = useState<AuditReportResponse | null>(null);
  const [certificate, setCertificate] = useState<AtlasCertificateResponse | null>(null);

  const loadInitialData = useCallback(async () => {
    try {
      const [status, config, invRes] = await Promise.all([
        api.getSystemStatus(),
        api.getSanityConfig(),
        api.getInvestigations(),
      ]);
      setSystemStatus(status);
      setSanityConfig(config);
      setInvestigationsList(invRes.investigations ?? []);
      setLoadError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to ATLAS backend';
      console.error('[App] Load error:', err);
      setLoadError(msg);
    }
  }, []);

  const refreshInvestigations = useCallback(async () => {
    try {
      const invRes = await api.getInvestigations();
      setInvestigationsList(invRes.investigations ?? []);
    } catch (err) {
      console.error('[App] Refresh error:', err);
    }
  }, []);

  const loadInvestigationDetails = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const inv = await api.getInvestigation(id);
      setCurrentInvestigation(inv);

      const [ev, aud] = await Promise.all([
        api.getEvidence(id).catch(() => null),
        api.getAudit(id).catch(() => null),
      ]);
      setEvidenceGraph(ev);
      setAuditReport(aud);

      if (inv.certificateId) {
        const cert = await api.getCertificate(inv.certificateId).catch(() => null);
        setCertificate(cert);
      } else {
        setCertificate(null);
      }
    } catch (err) {
      console.error(`[App] Failed loading details for ${id}:`, err);
    }
  }, []);

  const [refreshTick, setRefreshTick] = useState(0);

  const handleSelectInvestigation = useCallback((id: string) => {
    setSelectedId(id);
    setRefreshTick(t => t + 1);
  }, []);

  const handleStagedQuery = useCallback((query: string) => {
    setStagedQuery(query);
    setActiveTab('console');
  }, []);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  useEffect(() => {
    if (selectedId) loadInvestigationDetails(selectedId);
  }, [selectedId, refreshTick, loadInvestigationDetails]);

  return (
    <div className="min-h-screen bg-[#1A3831] text-[#0E241E] flex flex-col font-sans selection:bg-[#DE4B39] selection:text-white">
      <Header
        systemStatus={systemStatus}
        sanityConfig={sanityConfig}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        investigationCount={investigationsList.length}
        onOpenAddTopic={() => setIsAddTopicOpen(true)}
      />

      <main className={`flex-1 w-full ${activeTab === 'landing' ? 'max-w-none px-0 py-0' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        {loadError && (
          <div className="max-w-7xl mx-auto mb-6 p-4 rounded-2xl border-2 border-[#0E241E] bg-[#DE4B39] text-white font-mono text-sm shadow-[4px_4px_0_#0E241E]">
            <strong>Backend connection error:</strong> {loadError}
          </div>
        )}

        {activeTab === 'landing' && (
          <LandingPage
            onNavigateTab={setActiveTab}
            onSelectQuery={handleStagedQuery}
            onOpenAddTopic={() => setIsAddTopicOpen(true)}
          />
        )}
        {activeTab === 'console' && (
          <InvestigationConsole
            currentInvestigation={currentInvestigation}
            investigationsList={investigationsList}
            onSelectInvestigation={handleSelectInvestigation}
            onRefreshInvestigations={refreshInvestigations}
            onNavigateTab={(tab) => setActiveTab(tab as TabId)}
            initialQuestion={stagedQuery}
          />
        )}
        {activeTab === 'graph' && (
          <EvidenceGraph evidence={evidenceGraph} investigationId={selectedId} />
        )}
        {activeTab === 'audit' && (
          <AuditMatrix auditReport={auditReport} investigationId={selectedId} />
        )}
        {activeTab === 'certificate' && (
          <CertificateVerifier certificate={certificate} investigationId={selectedId} />
        )}
        {activeTab === 'sanity' && (
          <SanityExplorer
            sanityConfig={sanityConfig}
            onOpenAddTopic={() => setIsAddTopicOpen(true)}
          />
        )}
        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}
      </main>

      <AddTopicModal
        isOpen={isAddTopicOpen}
        onClose={() => setIsAddTopicOpen(false)}
        onStartAudit={handleStagedQuery}
      />

      {activeTab !== 'landing' && (
        <footer className="border-t-2 border-[#0E241E] bg-[#FAF7F2] py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#0E241E]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DE4B39] border border-[#0E241E]" />
              <span className="font-black uppercase tracking-wider">ATLAS Knowledge Integrity Auditor</span>
              <span className="text-[#888888]">·</span>
              <span className="text-[#5B756E]">Sanity Context MCP · LangGraph · HMAC-SHA256 Merkle</span>
            </div>
            {sanityConfig?.projectId && sanityConfig.projectId !== '(not configured)' && (
              <span className="text-[#5B756E]">
                Sanity: <strong className="text-[#0E241E]">{sanityConfig.projectId}</strong>
                <span className="ml-1 text-[#888888]">/ {sanityConfig.dataset}</span>
              </span>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
