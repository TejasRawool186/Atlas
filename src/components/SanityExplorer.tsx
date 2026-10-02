import React, { useState, useEffect } from 'react';
import { BookOpen, Terminal, Play, RefreshCw, ExternalLink, Copy, Check, AlertTriangle } from 'lucide-react';
import { api } from '../api.ts';
import type { SanityConfigResponse } from '../types.ts';

interface Props {
  sanityConfig: SanityConfigResponse | null;
}

type SubTab = 'schemas' | 'knowledge' | 'groq' | 'connection';

export const SanityExplorer: React.FC<Props> = ({ sanityConfig }) => {
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
      <div className="passport-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center shadow-[3px_3px_0_#000]">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-tight text-black">Sanity Content Lake</h2>
            <p className="text-xs text-[#555] italic mt-0.5">
              Layer A (Structured Schemas) · Layer B (Knowledge Base)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(['schemas', 'knowledge', 'groq', 'connection'] as SubTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border-2 border-black ${
                tab === t
                  ? 'bg-black text-white shadow-[3px_3px_0_#000]'
                  : 'bg-white text-black shadow-[2px_2px_0_#000] hover:bg-[#F4F4F4]'
              }`}
            >
              {t === 'schemas' ? 'Schemas' : t === 'knowledge' ? 'Knowledge' : t === 'groq' ? 'GROQ' : 'Connection'}
            </button>
          ))}
        </div>
      </div>

      {dataError && (
        <div className="passport-card p-4 bg-[#F4F4F4] border-2 border-black flex items-center gap-2 text-sm font-mono text-black">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {dataError}
        </div>
      )}

      {/* Schemas */}
      {tab === 'schemas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schemas.map((s: any) => (
            <div key={s.typeName} className="passport-card p-5">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-3">
                <span className="text-sm font-black text-black">{s.title}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black text-white">
                  {s.typeName}
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                {s.fields?.map((f: any) => (
                  <div key={f.name} className="flex items-center justify-between py-1 border-b border-black/10 last:border-none">
                    <span className="font-bold text-black">{f.name}</span>
                    <span className="text-[10px] text-[#555]">
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
            <div className="passport-card p-12 text-center text-[#555] italic font-serif">
              No knowledge documents available.
            </div>
          )}
          {knowledgeDocs.map((doc: any) => (
            <div key={doc._id} className="passport-card p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black">
                <div>
                  <h3 className="text-base font-black text-black">{doc.title}</h3>
                  <p className="text-xs text-[#555] italic mt-0.5">
                    {doc.author} · <span className="font-mono font-bold text-black not-italic uppercase">{doc.docType}</span>
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

              <div className="text-sm font-serif leading-relaxed text-black bg-[#F4F4F4] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0_#000]">
                {doc.summary}
              </div>

              {doc.extractedClaims?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#555] mb-2">Extracted Claims:</p>
                  <div className="flex flex-wrap gap-2">
                    {doc.extractedClaims.map((c: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-white border-2 border-black text-xs font-bold shadow-[2px_2px_0_#000]">
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
        <div className="passport-card p-6 shadow-[6px_8px_0_#000] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 stroke-[2.2]" />
              <h3 className="text-sm font-black uppercase tracking-tight">GROQ Query Executor</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#555]">Presets:</span>
              {['*[_type == "claim"]', '*[_type == "entity"]', '*[_type == "source"]', '*[_type == "conflict"]'].map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setGroqQuery(q); runGroq(q); }}
                  className="px-2.5 py-1 rounded-lg bg-[#F4F4F4] hover:bg-black hover:text-white border border-black text-black text-[10px] font-mono font-bold transition-all cursor-pointer shadow-[2px_2px_0_#000]"
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
            <p className="text-xs font-mono text-black bg-[#F4F4F4] border-2 border-black rounded-xl px-4 py-2">
              Error: {groqError}
            </p>
          )}

          {groqResult !== null && (
            <div className="bg-[#F4F4F4] p-4 rounded-xl border-2 border-black font-mono text-xs text-black max-h-96 overflow-y-auto shadow-[3px_3px_0_#000]">
              <pre className="whitespace-pre-wrap">{JSON.stringify(groqResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Connection info */}
      {tab === 'connection' && (
        <div className="passport-card p-6 shadow-[6px_8px_0_#000] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-black">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-black">Connection Details</h3>
              <p className="text-xs text-[#555] italic mt-0.5">Sanity Content Lake configuration</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-black text-xs font-bold shadow-[2px_2px_0_#000] ${isLive ? 'bg-[#FF5A1F] text-black' : 'bg-[#F4F4F4] text-black'}`}>
                <span className={`w-2 h-2 rounded-full border border-black ${isLive ? 'bg-black animate-pulse' : 'bg-[#888]'}`} />
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
            <div className="p-4 bg-[#F4F4F4] rounded-xl border-2 border-black text-sm font-serif text-black shadow-[2px_2px_0_#000]">
              <strong>Running in local-corpus mode.</strong> To query a live Sanity Content Lake, set{' '}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-black">SANITY_PROJECT_ID</code> and{' '}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-black">SANITY_API_TOKEN</code> in your{' '}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-black">.env</code> file.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Project ID',     value: sanityConfig?.projectId ?? '(not configured)' },
              { label: 'Dataset',        value: sanityConfig?.dataset ?? 'production' },
              { label: 'API Version',    value: sanityConfig?.apiVersion ?? '—' },
              { label: 'Mode',          value: sanityConfig?.mode ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F4F4F4] p-4 rounded-xl border-2 border-black shadow-[3px_3px_0_#000]">
                <p className="text-[10px] font-bold uppercase text-[#555]">{label}</p>
                <p className="text-sm font-mono font-bold text-black mt-1 break-all">{value}</p>
              </div>
            ))}

            {sanityConfig?.contextUrl && (
              <div className="md:col-span-2 bg-[#F4F4F4] p-4 rounded-xl border-2 border-black shadow-[3px_3px_0_#000]">
                <p className="text-[10px] font-bold uppercase text-[#555] mb-1">Context MCP Endpoint</p>
                <p className="text-xs font-mono font-bold text-black break-all bg-white p-2.5 rounded-lg border border-black">
                  {sanityConfig.contextUrl}
                </p>
              </div>
            )}

            {sanityConfig?.publicDatasetUrl && (
              <div className="md:col-span-2 bg-[#F4F4F4] p-4 rounded-xl border-2 border-black shadow-[3px_3px_0_#000]">
                <p className="text-[10px] font-bold uppercase text-[#555] mb-1">Public Query URL</p>
                <p className="text-xs font-mono font-bold text-black break-all bg-white p-2.5 rounded-lg border border-black">
                  {sanityConfig.publicDatasetUrl}
                </p>
                <p className="text-[10px] text-[#555] italic mt-1.5">
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
