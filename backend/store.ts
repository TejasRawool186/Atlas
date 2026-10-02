/**
 * ATLAS — In-Memory Store & SSE Event Pub/Sub
 * Thread-safe storage for investigations and certificates, with real-time SSE subscriber streams.
 */

import { InvestigationState, InvestigationEvent } from './agent/langgraph.ts';
import { AtlasCertificate } from './agent/certificate.ts';

export class AtlasDataStore {
  private investigations = new Map<string, InvestigationState>();
  private certificates = new Map<string, AtlasCertificate>();
  private sseSubscribers = new Map<string, Set<(event: InvestigationEvent) => void>>();

  public saveInvestigation(state: InvestigationState): void {
    this.investigations.set(state.investigationId, state);
    if (state.certificate) {
      this.certificates.set(state.certificate.certificateId, state.certificate);
    }
  }

  public getInvestigation(id: string): InvestigationState | undefined {
    return this.investigations.get(id);
  }

  public getAllInvestigations(): InvestigationState[] {
    return Array.from(this.investigations.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public saveCertificate(cert: AtlasCertificate): void {
    this.certificates.set(cert.certificateId, cert);
  }

  public getCertificate(id: string): AtlasCertificate | undefined {
    return this.certificates.get(id);
  }

  public getCertificateByInvestigationId(invId: string): AtlasCertificate | undefined {
    for (const cert of this.certificates.values()) {
      if (cert.investigationId === invId) return cert;
    }
    return undefined;
  }

  public getUptime(): number { return process.uptime(); }
  public getInvestigationCount(): number { return this.investigations.size; }
  public getCertificateCount(): number { return this.certificates.size; }

  /**
   * Returns investigations created within the last N hours.
   */
  public getRecentInvestigations(hours = 24): InvestigationState[] {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return this.getAllInvestigations().filter(
      inv => new Date(inv.createdAt).getTime() > cutoff
    );
  }

  public subscribeToEvents(
    invId: string,
    listener: (event: InvestigationEvent) => void
  ): () => void {
    if (!this.sseSubscribers.has(invId)) {
      this.sseSubscribers.set(invId, new Set());
    }
    const subscribers = this.sseSubscribers.get(invId)!;
    subscribers.add(listener);
    return () => {
      subscribers.delete(listener);
      if (subscribers.size === 0) this.sseSubscribers.delete(invId);
    };
  }

  public broadcastEvent(invId: string, event: InvestigationEvent): void {
    const subscribers = this.sseSubscribers.get(invId);
    if (!subscribers) return;
    for (const listener of subscribers) {
      try { listener(event); } catch (err) {
        console.error('[Store] SSE subscriber error:', err);
      }
    }
  }
}

export const atlasStore = new AtlasDataStore();
