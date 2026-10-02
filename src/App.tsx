/**
 * ATLAS — Application Root
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { InvestigationConsole } from './components/InvestigationConsole.tsx';
import { EvidenceGraph } from './components/EvidenceGraph.tsx';
import { AuditMatrix } from './components/AuditMatrix.tsx';
import { CertificateVerifier } from './components/CertificateVerifier.tsx';
import { SanityExplorer } from './components/SanityExplorer.tsx';
import { ArchitectureView } from './components/ArchitectureView.tsx';
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

export type TabId = 'console' | 'graph' | 'audit' | 'certificate' | 'sanity' | 'architecture';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('console');
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

  // Track selectedId separately so we can force a refresh on the same ID
  const [refreshTick, setRefreshTick] = useState(0);

  const handleSelectInvestigation = useCallback((id: string) => {
    setSelectedId(id);
    setRefreshTick(t => t + 1);
  }, []);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  useEffect(() => {
    if (selectedId) loadInvestigationDetails(selectedId);
  }, [selectedId, refreshTick, loadInvestigationDetails]);

  return (
    <div className="min-h-screen bg-[#FF5A1F] text-black flex flex-col font-serif selection:bg-black selection:text-white">
      <Header
        systemStatus={systemStatus}
        sanityConfig={sanityConfig}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        investigationCount={investigationsList.length}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {loadError && (
          <div className="mb-6 p-4 rounded-2xl border-2 border-black bg-black text-white font-mono text-sm">
            <strong>Backend connection error:</strong> {loadError}
          </div>
        )}

        {activeTab === 'console' && (
          <InvestigationConsole
            currentInvestigation={currentInvestigation}
            investigationsList={investigationsList}
            onSelectInvestigation={handleSelectInvestigation}
            onRefreshInvestigations={refreshInvestigations}
            onNavigateTab={(tab) => setActiveTab(tab as TabId)}
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
          <SanityExplorer sanityConfig={sanityConfig} />
        )}
        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}
      </main>

      <footer className="border-t-2 border-black bg-white py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5A1F] border border-black" />
            <span className="font-black uppercase tracking-wider">ATLAS Knowledge Integrity Auditor</span>
            <span className="text-[#888888]">·</span>
            <span className="italic text-[#555555]">Sanity Context MCP · LangGraph · HMAC-SHA256 Merkle</span>
          </div>
          {sanityConfig?.projectId && sanityConfig.projectId !== '(not configured)' && (
            <span className="text-[#555555]">
              Sanity: <strong className="text-black">{sanityConfig.projectId}</strong>
              <span className="ml-1 text-[#888888]">/ {sanityConfig.dataset}</span>
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}
