import React, { useState } from 'react';
import {
  X,
  Link,
  BookOpen,
  Code,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Trash2,
  RefreshCw,
  Globe,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { api } from '../api.ts';

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAudit: (question: string) => void;
}

type TabMode = 'url' | 'form' | 'json';

export const AddTopicModal: React.FC<AddTopicModalProps> = ({ isOpen, onClose, onStartAudit }) => {
  const [activeTab, setActiveTab] = useState<TabMode>('url');

  // URL Tab State
  const [url, setUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState('technical_rfc');
  const [customAuthor, setCustomAuthor] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Extracted preview state
  const [extractedPreview, setExtractedPreview] = useState<{
    title: string;
    docType: string;
    author: string;
    summary: string;
    content: string;
    extractedClaims: string[];
    suggestedQuestions: string[];
  } | null>(null);

  // Manual Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDocType, setFormDocType] = useState('technical_rfc');
  const [formAuthor, setFormAuthor] = useState('');
  const [formSourceUrl, setFormSourceUrl] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formClaims, setFormClaims] = useState<string[]>([]);
  const [newClaimInput, setNewClaimInput] = useState('');

  // JSON Tab State
  const [jsonInput, setJsonInput] = useState(`{
  "title": "OAuth 2.1 PKCE Enforcement Policy",
  "docType": "security_advisory",
  "author": "Security Architecture Team",
  "sourceUrl": "https://specs.atlas.dev/rfc/oauth-21",
  "summary": "Starting with v5.0, legacy implicit grant flow is completely deprecated. All client applications must use authorization code flow with PKCE.",
  "extractedClaims": [
    "Implicit grant flow is deprecated in v5.0",
    "PKCE is mandatory for all public and confidential clients"
  ]
}`);

  // Submission / Ingestion State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedResult, setPublishedResult] = useState<{
    docId: string;
    title: string;
    claimsCount: number;
    liveSanityCreated: boolean;
    liveSanityError?: string | null;
    suggestedQuestions: string[];
  } | null>(null);

  if (!isOpen) return null;

  // Handle URL extraction preview
  const handleFetchUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setIsFetchingUrl(true);
    setFetchError(null);
    setExtractedPreview(null);
    setPublishedResult(null);

    try {
      const res = await api.extractFromUrl({
        url: url.trim(),
        title: customTitle.trim() || undefined,
        docType: customCategory || undefined,
        author: customAuthor.trim() || undefined,
      });

      if (res.success && res.article) {
        setExtractedPreview({
          title: res.article.title,
          docType: res.article.docType,
          author: res.article.author,
          summary: res.article.summary,
          content: res.article.content,
          extractedClaims: res.article.extractedClaims,
          suggestedQuestions: res.article.suggestedQuestions,
        });
      }
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Failed to fetch and analyze article');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // Publish from Extracted URL Preview
  const handlePublishExtracted = async () => {
    if (!extractedPreview || !url) return;
    setIsPublishing(true);
    setPublishError(null);

    try {
      const res = await api.ingestFromUrl({
        url: url.trim(),
        title: extractedPreview.title,
        docType: extractedPreview.docType,
        author: extractedPreview.author,
        summary: extractedPreview.summary,
        content: extractedPreview.content,
        extractedClaims: extractedPreview.extractedClaims,
      });

      if (res.success) {
        setPublishedResult({
          docId: res.document._id,
          title: res.document.title,
          claimsCount: res.claims.length,
          liveSanityCreated: res.liveSanityCreated,
          liveSanityError: res.liveSanityError,
          suggestedQuestions: res.suggestedQuestions,
        });
      }
    } catch (err: unknown) {
      setPublishError(err instanceof Error ? err.message : 'Publishing to Sanity failed');
    } finally {
      setIsPublishing(false);
    }
  };

  // Publish from Manual Form
  const handlePublishForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSummary.trim()) {
      setPublishError('Topic Title and Summary are required');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);

    try {
      const res = await api.createTopic({
        title: formTitle.trim(),
        docType: formDocType,
        author: formAuthor.trim() || 'Internal Contributor',
        summary: formSummary.trim(),
        extractedClaims: formClaims.length > 0 ? formClaims : [formSummary.trim()],
        sourceUrl: formSourceUrl.trim() || undefined,
      });

      if (res.success) {
        setPublishedResult({
          docId: res.document._id,
          title: res.document.title,
          claimsCount: res.claims.length,
          liveSanityCreated: res.liveSanityCreated,
          liveSanityError: res.liveSanityError,
          suggestedQuestions: res.suggestedQuestions,
        });
      }
    } catch (err: unknown) {
      setPublishError(err instanceof Error ? err.message : 'Publishing to Sanity failed');
    } finally {
      setIsPublishing(false);
    }
  };

  // Publish from JSON
  const handlePublishJson = async () => {
    setIsPublishing(true);
    setPublishError(null);

    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.title || !parsed.summary) {
        throw new Error('JSON must include "title" and "summary" fields');
      }

      const res = await api.createTopic({
        title: parsed.title,
        docType: parsed.docType || 'technical_rfc',
        author: parsed.author || 'JSON Ingestion',
        summary: parsed.summary,
        content: parsed.content || parsed.summary,
        extractedClaims: Array.isArray(parsed.extractedClaims) ? parsed.extractedClaims : [parsed.summary],
        sourceUrl: parsed.sourceUrl || undefined,
      });

      if (res.success) {
        setPublishedResult({
          docId: res.document._id,
          title: res.document.title,
          claimsCount: res.claims.length,
          liveSanityCreated: res.liveSanityCreated,
          liveSanityError: res.liveSanityError,
          suggestedQuestions: res.suggestedQuestions,
        });
      }
    } catch (err: unknown) {
      setPublishError(err instanceof Error ? err.message : 'Invalid JSON format');
    } finally {
      setIsPublishing(false);
    }
  };

  // Helper to add claim in Form
  const handleAddClaim = () => {
    if (newClaimInput.trim()) {
      setFormClaims([...formClaims, newClaimInput.trim()]);
      setNewClaimInput('');
    }
  };

  const handleRemoveClaim = (idx: number) => {
    setFormClaims(formClaims.filter((_, i) => i !== idx));
  };

  // Helper to remove claim from Preview
  const handleRemovePreviewClaim = (idx: number) => {
    if (!extractedPreview) return;
    setExtractedPreview({
      ...extractedPreview,
      extractedClaims: extractedPreview.extractedClaims.filter((_, i) => i !== idx),
    });
  };

  // Start Audit from Suggested Question
  const handleStartAuditQuestion = (q: string) => {
    onClose();
    onStartAudit(q);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-3xl my-8 bg-[#FAF7F2] rounded-3xl border-2 border-[#0E241E] shadow-[8px_10px_0_#0E241E] overflow-hidden flex flex-col text-[#0E241E]">
        {/* Modal Header */}
        <div className="bg-[#142C26] p-5 border-b-2 border-[#0E241E] flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DE4B39] border-2 border-[#0E241E] flex items-center justify-center text-white shadow-[2px_2px_0_#0E241E]">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-display tracking-tight text-[#FAF7F2]">
                Ingest Topic into Sanity Content Lake
              </h2>
              <p className="text-[11px] text-[#A3C2B8] font-sans">
                Populates Layer B knowledge doc and Layer A verifiable claims for auditing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#0E241E] border-2 border-[#0E241E] flex items-center justify-center hover:bg-white transition-all shadow-[2px_2px_0_#0E241E] cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* SUCCESS SCREEN */}
          {publishedResult ? (
            <div className="space-y-6 animate-fadeIn">
              <div className={`p-5 rounded-2xl border-2 border-[#0E241E] shadow-[4px_4px_0_#0E241E] space-y-2.5 ${publishedResult.liveSanityCreated ? 'bg-[#2EC4B6]/25' : 'bg-[#FAF7F2]'}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-black font-display text-[#0E241E]">
                    <CheckCircle2 className={`w-5 h-5 stroke-[3] ${publishedResult.liveSanityCreated ? 'text-[#0E241E]' : 'text-[#DE4B39]'}`} />
                    <span>
                      {publishedResult.liveSanityCreated
                        ? 'Successfully Published to Sanity Content Lake!'
                        : 'Topic Ingested into Knowledge Engine'}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border border-[#0E241E] ${publishedResult.liveSanityCreated ? 'bg-[#2EC4B6] text-[#0E241E]' : 'bg-[#FAF0CA] text-[#7A4B17]'}`}>
                    {publishedResult.liveSanityCreated ? 'Live Sanity Cloud' : 'Local Engine'}
                  </span>
                </div>
                <div className="text-xs font-mono space-y-1 text-[#0E241E]/90 pt-1">
                  <p>Document ID: <strong className="bg-white px-1.5 py-0.5 rounded border border-[#0E241E]">{publishedResult.docId}</strong></p>
                  <p>Title: <strong>{publishedResult.title}</strong></p>
                  <p>Active Verified Claims: <strong>{publishedResult.claimsCount}</strong></p>
                  <p className="text-[11px] text-[#5B756E]">
                    Mode: {publishedResult.liveSanityCreated ? 'Live Sanity Lake API (Committed)' : 'Local Corpus Engine (Indexed & Queryable)'}
                  </p>
                </div>
              </div>

              {/* Suggested Questions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#DE4B39]" />
                  <h3 className="text-sm font-black uppercase tracking-tight text-[#0E241E] font-display">
                    Audit This Topic with ATLAS (Click to launch investigation)
                  </h3>
                </div>

                <div className="space-y-2">
                  {publishedResult.suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleStartAuditQuestion(q)}
                      className="w-full text-left p-3.5 rounded-xl bg-white hover:bg-[#F5EFE6] border-2 border-[#0E241E] shadow-[3px_3px_0_#0E241E] text-xs font-sans font-bold flex items-center justify-between gap-3 group transition-all cursor-pointer"
                    >
                      <span className="text-[#0E241E]">{q}</span>
                      <ArrowRight className="w-4 h-4 text-[#DE4B39] stroke-[2.5] shrink-0 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setPublishedResult(null);
                    setExtractedPreview(null);
                    setUrl('');
                  }}
                  className="stamp-btn-secondary px-4 py-2.5 text-xs font-display cursor-pointer"
                >
                  Ingest Another Topic
                </button>
                <button
                  onClick={() => handleStartAuditQuestion(publishedResult.suggestedQuestions[0] || `Verify ${publishedResult.title}`)}
                  className="stamp-btn px-5 py-2.5 text-xs font-display flex items-center gap-2 cursor-pointer shadow-[3px_3px_0_#0E241E]"
                >
                  <span>Run Audit Console</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* TAB SELECTOR */}
              <div className="flex items-center gap-2 border-b-2 border-[#0E241E] pb-3">
                {[
                  { id: 'url', label: 'Ingest by URL', Icon: Link },
                  { id: 'form', label: 'Guided Form', Icon: BookOpen },
                  { id: 'json', label: 'Raw JSON', Icon: Code },
                ].map(({ id, label, Icon }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setActiveTab(id as TabMode);
                        setFetchError(null);
                        setPublishError(null);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide border-2 border-[#0E241E] transition-all cursor-pointer font-display ${
                        active
                          ? 'bg-[#DE4B39] text-white shadow-[3px_3px_0_#0E241E]'
                          : 'bg-white text-[#0E241E] shadow-[2px_2px_0_#0E241E] hover:bg-[#F5EFE6]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ERROR ALERT */}
              {(fetchError || publishError) && (
                <div className="p-3.5 rounded-xl bg-[#DE4B39] text-white border-2 border-[#0E241E] shadow-[3px_3px_0_#0E241E] flex items-center gap-2.5 text-xs font-mono">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{fetchError || publishError}</span>
                </div>
              )}

              {/* TAB 1: URL INGESTION */}
              {activeTab === 'url' && (
                <div className="space-y-5">
                  <form onSubmit={handleFetchUrl} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase font-display text-[#0E241E] mb-1.5">
                        Article / Documentation URL *
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="url"
                          required
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://docs.github.com/... or blog/release/policy link"
                          className="paper-input flex-1 px-3.5 py-2.5 text-xs font-mono"
                        />
                        <button
                          type="submit"
                          disabled={isFetchingUrl || !url.trim()}
                          className="stamp-btn px-5 py-2.5 text-xs font-display flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 whitespace-nowrap"
                        >
                          {isFetchingUrl ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Analyzing Page...</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-4 h-4" />
                              <span>Fetch & Extract</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-[#5B756E] mt-1.5">
                        Paste any public URL. ATLAS automatically extracts the title, author, summary, and atomic verifiable claims.
                      </p>
                    </div>

                    {/* Optional Overrides */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#F5EFE6] border-2 border-[#0E241E]">
                      <div>
                        <label className="block text-[10px] font-bold uppercase font-display text-[#5B756E] mb-1">
                          Custom Title (Optional)
                        </label>
                        <input
                          type="text"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          placeholder="Auto-detected if blank"
                          className="w-full bg-white px-2.5 py-1.5 text-xs rounded-lg border border-[#0E241E]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase font-display text-[#5B756E] mb-1">
                          Category
                        </label>
                        <select
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="w-full bg-white px-2.5 py-1.5 text-xs rounded-lg border border-[#0E241E]"
                        >
                          <option value="technical_rfc">Technical RFC</option>
                          <option value="architecture_spec">Architecture Spec</option>
                          <option value="release_notes">Release Notes</option>
                          <option value="security_advisory">Security Advisory</option>
                          <option value="changelog">Changelog</option>
                          <option value="policy_document">Policy Document</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase font-display text-[#5B756E] mb-1">
                          Author (Optional)
                        </label>
                        <input
                          type="text"
                          value={customAuthor}
                          onChange={(e) => setCustomAuthor(e.target.value)}
                          placeholder="Auto-detected if blank"
                          className="w-full bg-white px-2.5 py-1.5 text-xs rounded-lg border border-[#0E241E]"
                        />
                      </div>
                    </div>
                  </form>

                  {/* EXTRACTED PREVIEW CARD */}
                  {extractedPreview && (
                    <div className="p-5 rounded-2xl bg-white border-2 border-[#0E241E] shadow-[4px_4px_0_#0E241E] space-y-4 animate-fadeIn">
                      <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-[#0E241E]">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#0E201B] text-[#FAF7F2]">
                            {extractedPreview.docType}
                          </span>
                          <h4 className="text-base font-black font-display text-[#0E241E] mt-1.5">
                            {extractedPreview.title}
                          </h4>
                          <p className="text-xs text-[#5B756E] font-sans">
                            Publisher / Author: <strong className="text-[#0E241E]">{extractedPreview.author}</strong>
                          </p>
                        </div>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-[#DE4B39] font-bold flex items-center gap-1 hover:underline"
                        >
                          Source <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase text-[#5B756E] font-display">
                          Epistemic Summary:
                        </p>
                        <p className="text-xs leading-relaxed text-[#0E241E] bg-[#FAF7F2] p-3 rounded-xl border border-[#0E241E]/30">
                          {extractedPreview.summary}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase text-[#5B756E] font-display">
                          Extracted Claims ({extractedPreview.extractedClaims.length}):
                        </p>
                        <div className="space-y-1.5">
                          {extractedPreview.extractedClaims.map((claim, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#FAF7F2] border border-[#0E241E] text-xs font-sans"
                            >
                              <span>• {claim}</span>
                              <button
                                onClick={() => handleRemovePreviewClaim(idx)}
                                className="text-[#888] hover:text-[#DE4B39] cursor-pointer"
                                title="Remove claim"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                          onClick={handlePublishExtracted}
                          disabled={isPublishing}
                          className="stamp-btn px-6 py-2.5 text-xs font-display flex items-center gap-2 cursor-pointer disabled:opacity-40 shadow-[3px_3px_0_#0E241E]"
                        >
                          {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          <span>Publish to Sanity Lake & Generate Claims</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: GUIDED FORM */}
              {activeTab === 'form' && (
                <form onSubmit={handlePublishForm} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase font-display text-[#0E241E] mb-1">
                        Topic Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Enterprise Cache Invalidation Protocol"
                        className="paper-input w-full px-3.5 py-2 text-xs font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase font-display text-[#0E241E] mb-1">
                        Document Type
                      </label>
                      <select
                        value={formDocType}
                        onChange={(e) => setFormDocType(e.target.value)}
                        className="paper-input w-full px-3.5 py-2 text-xs font-sans"
                      >
                        <option value="technical_rfc">Technical RFC</option>
                        <option value="architecture_spec">Architecture Spec</option>
                        <option value="release_notes">Release Notes</option>
                        <option value="security_advisory">Security Advisory</option>
                        <option value="changelog">Changelog</option>
                        <option value="policy_document">Policy Document</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase font-display text-[#0E241E] mb-1">
                        Author / Team
                      </label>
                      <input
                        type="text"
                        value={formAuthor}
                        onChange={(e) => setFormAuthor(e.target.value)}
                        placeholder="e.g. Platform Architecture Team"
                        className="paper-input w-full px-3.5 py-2 text-xs font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase font-display text-[#0E241E] mb-1">
                        Source URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formSourceUrl}
                        onChange={(e) => setFormSourceUrl(e.target.value)}
                        placeholder="https://..."
                        className="paper-input w-full px-3.5 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase font-display text-[#0E241E] mb-1">
                      Summary & Ground Truth Body *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formSummary}
                      onChange={(e) => setFormSummary(e.target.value)}
                      placeholder="State the core rules, policies, or facts that ATLAS should ground its reasoning on..."
                      className="paper-input w-full px-3.5 py-2 text-xs font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase font-display text-[#0E241E] mb-1">
                      Atomic Verifiable Claims (Facts for Lethe Probes)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newClaimInput}
                        onChange={(e) => setNewClaimInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddClaim();
                          }
                        }}
                        placeholder="Type a concrete statement and click Add Claim..."
                        className="paper-input flex-1 px-3 py-1.5 text-xs font-sans"
                      />
                      <button
                        type="button"
                        onClick={handleAddClaim}
                        className="stamp-btn-secondary px-3.5 py-1.5 text-xs font-display flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {formClaims.length > 0 && (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {formClaims.map((claim, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-[#0E241E] text-xs"
                          >
                            <span>• {claim}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveClaim(idx)}
                              className="text-[#888] hover:text-[#DE4B39] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={isPublishing}
                      className="stamp-btn px-6 py-2.5 text-xs font-display flex items-center gap-2 cursor-pointer disabled:opacity-40 shadow-[3px_3px_0_#0E241E]"
                    >
                      {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>Publish to Sanity Lake</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: RAW JSON */}
              {activeTab === 'json' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase font-display text-[#0E241E] mb-1.5">
                      Sanity Knowledge Document JSON
                    </label>
                    <textarea
                      rows={10}
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      className="paper-input w-full p-3 text-xs font-mono bg-[#0E201B] text-[#2EC4B6]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={handlePublishJson}
                      disabled={isPublishing}
                      className="stamp-btn px-6 py-2.5 text-xs font-display flex items-center gap-2 cursor-pointer disabled:opacity-40 shadow-[3px_3px_0_#0E241E]"
                    >
                      {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>Publish JSON to Sanity Lake</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
