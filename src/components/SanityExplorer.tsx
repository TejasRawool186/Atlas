import React, { useState, useEffect } from 'react';
import { BookOpen, Terminal, Play, RefreshCw, ExternalLink, Copy, Check, AlertTriangle, Plus } from 'lucide-react';
import { api } from '../api.ts';
import type { SanityConfigResponse } from '../types.ts';

interface Props {
  sanityConfig: SanityConfigResponse | null;
  onOpenAddTopic?: () => void;
}

type SubTab = 'schemas' | 'knowledge' | 'groq' | 'connection';

export const SanityExplorer: React.FC<Props> = ({ sanityConfig, onOpenAddTopic }) => {
  const [tab, setTab] = useState<SubTab>('schemas');
  const [schemas, setSchemas] = useState<any[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<any[]>([]);
  const [groqQuery, setGroqQuery] = useState('*[_type == "claim"]');
  const [groqResult, setGroqResult] = useState<unknown>(null);
  const [groqLoading, setGroqLoading] = useState(false);
  const [groqError, setGroqError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [s, k] = await Promise.all([api.getSanitySchemas(), api.getSanityKnowledge()]);
        setSchemas((s.schemas ?? []) as any[]);
        setKnowledgeDocs((k.docs ?? []) as any[]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load Sanity data';
        setDataError(msg);
      }
    })();
  }, []);

  const runGroq = async (q?: string) => {
    const query = q ?? groqQuery;
    setGroqLoading(true);
    setGroqError(null);
    try {
      const res = await api.runGroqQuery(query);
      setGroqResult(res.result);
    } catch (err) {
      setGroqError(err instanceof Error ? err.message : 'Query failed');
      setGroqResult(null);
    } finally {
      setGroqLoading(false);
    }
  };

  const copyConfig = () => {
    const text = [
      `SANITY_PROJECT_ID=${sanityConfig?.projectId ?? '(not configured)'}`,
      `SANITY_DATASET=${sanityConfig?.dataset ?? 'production'}`,
      `SANITY_CONTEXT_URL=${sanityConfig?.contextUrl ?? ''}`,
      sanityConfig?.publicDatasetUrl ? `PUBLIC_DATASET_URL=${sanityConfig.publicDatasetUrl}` : '',
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLive = sanityConfig?.mode === 'live';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="passport-card p-5 flex flex-wrap items-center justify-between gap-4 shadow-[6px_8px_0_#0E241E]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#DE4B39] text-white flex items-center justify-center shadow-[3px_3px_0_#0E241E] border-2 border-[#0E241E] shrink-0">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-tight text-[#0E241E] font-display">Sanity Content Lake</h2>
            <p className="text-xs text-[#5B756E] mt-0.5">
              Layer A (Structured Schemas) · Layer B (Knowledge Base)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenAddTopic && (
            <button
              onClick={onOpenAddTopic}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide bg-[#F5A623] text-[#0E241E] border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E] hover:-translate-y-px hover:shadow-[3px_3px_0_#0E241E] cursor-pointer font-display"
              title="Ingest new article URL or topic into Sanity"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Ingest Article / Topic</span>
            </button>
          )}

          {(['schemas', 'knowledge', 'groq', 'connection'] as SubTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border-2 border-[#0E241E] font-display ${
                tab === t
                  ? 'bg-[#DE4B39] text-white shadow-[3px_3px_0_#0E241E]'
                  : 'bg-white text-[#0E241E] shadow-[2px_2px_0_#0E241E] hover:bg-[#FAF7F2]'
              }`}
            >
              {t === 'schemas' ? 'Schemas' : t === 'knowledge' ? 'Knowledge' : t === 'groq' ? 'GROQ' : 'Connection'}
            </button>
          ))}
        </div>
      </div>

      {dataError && (
        <div className="passport-card p-4 bg-[#DE4B39] text-white border-2 border-[#0E241E] flex items-center gap-2 text-sm font-mono shadow-[3px_3px_0_#0E241E]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {dataError}
        </div>
      )}

      {/* Schemas */}
      {tab === 'schemas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schemas.map((s: any) => (
            <div key={s.typeName} className="passport-card p-5 shadow-[5px_6px_0_#0E241E]">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#0E241E] mb-3">
                <span className="text-sm font-black text-[#0E241E] font-display">{s.title}</span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#0E201B] text-[#FAF7F2] border border-[#0E241E]">
                  {s.typeName}
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                {s.fields?.map((f: any) => (
                  <div key={f.name} className="flex items-center justify-between py-1 border-b border-[#0E241E]/15 last:border-none">
                    <span className="font-bold text-[#0E241E]">{f.name}</span>
                    <span className="text-[10px] text-[#5B756E]">
                      {f.type}{f.referenceTo ? ` → [${f.referenceTo.join(', ')}]` : ''}
                      {f.required ? ' *' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Knowledge docs */}
      {tab === 'knowledge' && (
        <div className="space-y-5">
          {knowledgeDocs.length === 0 && !dataError && (
            <div className="passport-card p-12 text-center text-[#5B756E] italic shadow-[5px_6px_0_#0E241E]">
              No knowledge documents available.
            </div>
          )}
          {knowledgeDocs.map((doc: any) => (
            <div key={doc._id} className="passport-card p-6 space-y-3 shadow-[5px_6px_0_#0E241E]">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#0E241E]">
                <div>
                  <h3 className="text-base font-black text-[#0E241E] font-display">{doc.title}</h3>
                  <p className="text-xs text-[#5B756E] mt-0.5">
                    {doc.author} · <span className="font-mono font-bold text-[#0E241E] uppercase">{doc.docType}</span>
                  </p>
                </div>
                <a
                  href={doc.sourceUrl}
                  target="_blank" rel="noreferrer"
                  className="stamp-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  Source <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="text-sm leading-relaxed text-[#0E241E] bg-[#FAF7F2] p-4 rounded-xl border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E]">
                {doc.summary}
              </div>

              {doc.extractedClaims?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B756E] mb-2 font-display">Extracted Claims:</p>
                  <div className="flex flex-wrap gap-2">
                    {doc.extractedClaims.map((c: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-white border-2 border-[#0E241E] text-xs font-bold text-[#0E241E] shadow-[2px_2px_0_#0E241E]">
                        "{c}"
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* GROQ playground */}
      {tab === 'groq' && (
        <div className="passport-card p-6 shadow-[5px_6px_0_#0E241E] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#0E241E]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#DE4B39] stroke-[2.2]" />
              <h3 className="text-sm font-black uppercase tracking-tight text-[#0E241E] font-display">GROQ Query Executor</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#5B756E] font-display">Presets:</span>
              {['*[_type == "claim"]', '*[_type == "entity"]', '*[_type == "source"]', '*[_type == "conflict"]'].map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setGroqQuery(q); runGroq(q); }}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF7F2] border-2 border-[#0E241E] text-[#0E241E] text-[10px] font-mono font-bold transition-all cursor-pointer shadow-[2px_2px_0_#0E241E]"
                >
                  {q.match(/"([^"]+)"/)?.[1]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={groqQuery}
              onChange={e => setGroqQuery(e.target.value)}
              className="paper-input flex-1 px-4 py-3 text-xs font-mono"
              placeholder="*[_type == 'claim' && status == 'active']"
            />
            <button
              onClick={() => runGroq()}
              disabled={groqLoading}
              className="stamp-btn px-5 py-3 text-xs flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {groqLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              Execute
            </button>
          </div>

          {groqError && (
            <p className="text-xs font-mono text-white bg-[#DE4B39] border-2 border-[#0E241E] rounded-xl px-4 py-2 shadow-[2px_2px_0_#0E241E]">
              Error: {groqError}
            </p>
          )}

          {groqResult !== null && (
            <div className="bg-[#0E201B] p-4 rounded-xl border-2 border-[#0E241E] font-mono text-xs text-[#2EC4B6] max-h-96 overflow-y-auto shadow-[3px_3px_0_#0E241E]">
              <pre className="whitespace-pre-wrap">{JSON.stringify(groqResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Connection info */}
      {tab === 'connection' && (
        <div className="passport-card p-6 shadow-[5px_6px_0_#0E241E] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-[#0E241E]">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-[#0E241E] font-display">Connection Details</h3>
              <p className="text-xs text-[#5B756E] mt-0.5">Sanity Content Lake configuration</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-[#0E241E] text-xs font-bold shadow-[2px_2px_0_#0E241E] ${
                isLive ? 'bg-[#2EC4B6] text-[#0E241E]' : 'bg-[#FAF7F2] text-[#0E241E]'
              }`}>
                <span className={`w-2 h-2 rounded-full border border-[#0E241E] ${isLive ? 'bg-[#0E241E] animate-pulse' : 'bg-[#888]'}`} />
                {isLive ? 'Live Sanity' : 'Local Corpus'}
              </span>
              <button
                onClick={copyConfig}
                className="stamp-btn px-4 py-2 text-xs flex items-center gap-2 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Config'}
              </button>
            </div>
          </div>

          {!isLive && (
            <div className="p-4 bg-[#FAF7F2] rounded-xl border-2 border-[#0E241E] text-sm text-[#0E241E] shadow-[3px_3px_0_#0E241E]">
              <strong>Running in local-corpus mode.</strong> To query a live Sanity Content Lake, set{' '}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#0E241E]">SANITY_PROJECT_ID</code> and{' '}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#0E241E]">SANITY_API_TOKEN</code> in your{' '}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#0E241E]">.env</code> file.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Project ID',     value: sanityConfig?.projectId ?? '(not configured)' },
              { label: 'Dataset',        value: sanityConfig?.dataset ?? 'production' },
              { label: 'API Version',    value: sanityConfig?.apiVersion ?? '—' },
              { label: 'Mode',          value: sanityConfig?.mode ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#FAF7F2] p-4 rounded-xl border-2 border-[#0E241E] shadow-[3px_3px_0_#0E241E]">
                <p className="text-[10px] font-bold uppercase text-[#5B756E] font-display">{label}</p>
                <p className="text-sm font-mono font-bold text-[#0E241E] mt-1 break-all">{value}</p>
              </div>
            ))}

            {sanityConfig?.contextUrl && (
              <div className="md:col-span-2 bg-[#FAF7F2] p-4 rounded-xl border-2 border-[#0E241E] shadow-[3px_3px_0_#0E241E]">
                <p className="text-[10px] font-bold uppercase text-[#5B756E] mb-1 font-display">Context MCP Endpoint</p>
                <p className="text-xs font-mono font-bold text-[#0E241E] break-all bg-white p-2.5 rounded-lg border-2 border-[#0E241E]">
                  {sanityConfig.contextUrl}
                </p>
              </div>
            )}

            {sanityConfig?.publicDatasetUrl && (
              <div className="md:col-span-2 bg-[#FAF7F2] p-4 rounded-xl border-2 border-[#0E241E] shadow-[3px_3px_0_#0E241E]">
                <p className="text-[10px] font-bold uppercase text-[#5B756E] mb-1 font-display">Public Query URL</p>
                <p className="text-xs font-mono font-bold text-[#0E241E] break-all bg-white p-2.5 rounded-lg border-2 border-[#0E241E]">
                  {sanityConfig.publicDatasetUrl}
                </p>
                <p className="text-[10px] text-[#5B756E] italic mt-1.5">
                  Use this URL to verify the dataset independently without authentication.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
