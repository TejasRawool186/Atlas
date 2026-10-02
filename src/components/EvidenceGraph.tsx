import React, { useState, useMemo } from 'react';
import { Compass, Filter, ExternalLink, Clock, User, Info, MapPin } from 'lucide-react';
import type { EvidenceGraphResponse, GraphNode } from '../types.ts';

interface Props {
  evidence: EvidenceGraphResponse | null;
  investigationId: string;
}

type FilterType = 'all' | 'entity' | 'claim' | 'source' | 'conflict' | 'knowledge_doc';

const FILTER_OPTIONS: { id: FilterType; label: string }[] = [
  { id: 'all',           label: 'All' },
  { id: 'entity',        label: 'Entities' },
  { id: 'claim',         label: 'Claims' },
  { id: 'source',        label: 'Sources' },
  { id: 'conflict',      label: 'Conflicts' },
  { id: 'knowledge_doc', label: 'Docs' },
];

const NODE_STYLES: Record<string, { fill: string; stroke: string; textFill: string }> = {
  entity:        { fill: '#1E3A34', stroke: '#0E241E', textFill: '#FFFFFF' },
  claim:         { fill: '#FAF7F2', stroke: '#0E241E', textFill: '#0E241E' },
  source:        { fill: '#FFFFFF', stroke: '#0E241E', textFill: '#0E241E' },
  conflict:      { fill: '#DE4B39', stroke: '#0E241E', textFill: '#FFFFFF' },
  knowledge_doc: { fill: '#F5A623', stroke: '#0E241E', textFill: '#0E241E' },
};

export const EvidenceGraph: React.FC<Props> = ({ evidence, investigationId }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selected, setSelected] = useState<GraphNode | null>(null);

  const filteredNodes = useMemo(() => {
    if (!evidence?.nodes) return [];
    return filter === 'all' ? evidence.nodes : evidence.nodes.filter(n => n.type === filter);
  }, [evidence, filter]);

  const filteredIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    if (!evidence?.edges) return [];
    return evidence.edges.filter(e => filteredIds.has(e.source) && filteredIds.has(e.target));
  }, [evidence, filteredIds]);

  // Layout: group by type into horizontal tiers
  const positionedNodes = useMemo(() => {
    const groups: Record<string, GraphNode[]> = { entity: [], claim: [], conflict: [], source: [], knowledge_doc: [] };
    filteredNodes.forEach(n => (groups[n.type] ?? groups.entity).push(n));

    const tierY: Record<string, number> = { entity: 70, claim: 190, conflict: 190, source: 320, knowledge_doc: 420 };
    const W = 860;
    const out: (GraphNode & { x: number; y: number })[] = [];

    for (const [type, nodes] of Object.entries(groups)) {
      const y = tierY[type] ?? 250;
      nodes.forEach((node, i) => {
        const x = (W / (nodes.length + 1)) * (i + 1) + (type === 'conflict' ? 40 : 0);
        out.push({ ...node, x, y: y + (i % 2 === 0 ? -10 : 10) });
      });
    }
    return out;
  }, [filteredNodes]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, GraphNode & { x: number; y: number }>();
    positionedNodes.forEach(n => m.set(n.id, n));
    return m;
  }, [positionedNodes]);

  if (!evidence || evidence.nodes.length === 0) {
    return (
      <div className="passport-card p-16 text-center">
        <Compass className="w-10 h-10 mx-auto text-[#DE4B39] mb-3 stroke-[1.5]" />
        <p className="text-base font-black text-[#0E241E] font-display">No evidence graph available</p>
        <p className="text-xs text-[#5B756E] mt-1">
          Complete an investigation to build the evidence topology.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="passport-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DE4B39] text-white flex items-center justify-center shadow-[3px_3px_0_#0E241E] shrink-0">
            <Compass className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-tight text-[#0E241E] font-display">Evidence Graph</h2>
            <p className="text-xs text-[#5B756E]">
              {evidence.nodes.length} nodes · {evidence.edges.length} edges
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-[#5B756E] mr-1" />
          {FILTER_OPTIONS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border-2 border-[#0E241E] font-display ${
                filter === f.id
                  ? 'bg-[#DE4B39] text-white shadow-[3px_3px_0_#0E241E]'
                  : 'bg-white text-[#0E241E] shadow-[2px_2px_0_#0E241E] hover:bg-[#FAF7F2]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG canvas */}
        <div className="lg:col-span-8 passport-card p-5">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-[11px] font-bold uppercase pb-3 mb-3 border-b-2 border-[#0E241E] text-[#5B756E] font-display">
            {[
              { color: '#1E3A34', label: 'Entity', text: '#fff' },
              { color: '#FAF7F2', label: 'Active Claim', border: true },
              { color: '#FFFFFF', label: 'Source', border: true },
              { color: '#DE4B39', label: 'Conflict', text: '#fff' },
              { color: '#F5A623', label: 'Knowledge Doc' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full border-2 border-[#0E241E]"
                  style={{ background: l.color }}
                />
                <span className="text-[#0E241E]">{l.label}</span>
              </div>
            ))}
          </div>

          <div className="relative w-full overflow-auto border-2 border-[#0E241E] rounded-2xl bg-[#FAF7F2] bg-[radial-gradient(#0E241E15_1px,transparent_1px)] [background-size:20px_20px]" style={{ height: 500 }}>
            <svg width="860" height="480">
              <defs>
                <marker id="arrowhead" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#0E241E" />
                </marker>
              </defs>

              {/* Edges */}
              {filteredEdges.map(edge => {
                const s = nodeMap.get(edge.source);
                const t = nodeMap.get(edge.target);
                if (!s || !t) return null;
                const isConflict = edge.isConflict || edge.type === 'disputes';
                return (
                  <g key={edge.id}>
                    <line
                      x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                      stroke="#000"
                      strokeWidth={isConflict ? 2 : 1.5}
                      strokeDasharray={isConflict ? '6,3' : 'none'}
                      markerEnd="url(#arrowhead)"
                      opacity={0.7}
                    />
                    {edge.label && (
                      <text
                        x={(s.x + t.x) / 2} y={(s.y + t.y) / 2 - 6}
                        fill="#000" fontSize="9" fontFamily="Space Mono, monospace"
                        fontStyle="italic" textAnchor="middle"
                        className="pointer-events-none select-none"
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {positionedNodes.map(node => {
                const style = NODE_STYLES[node.type] ?? NODE_STYLES.source;
                const isSelected = selected?.id === node.id;
                const isSuperseded = node.status === 'superseded';

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x},${node.y})`}
                    onClick={() => setSelected(prev => prev?.id === node.id ? null : node)}
                    className="cursor-pointer"
                  >
                    {isSelected && (
                      <circle r={22} fill="none" stroke="#DE4B39" strokeWidth={3} strokeDasharray="4,2" />
                    )}
                    <circle
                      r={16}
                      fill={style.fill}
                      stroke={style.stroke}
                      strokeWidth={2}
                      strokeDasharray={isSuperseded ? '4,3' : 'none'}
                      className="transition-transform hover:scale-110"
                    />
                    <text
                      y={4} textAnchor="middle"
                      fill={style.textFill} fontSize={8}
                      fontFamily="Space Mono, monospace" fontWeight="bold"
                      className="pointer-events-none select-none"
                    >
                      {node.type.slice(0, 2).toUpperCase()}
                    </text>
                    <text
                      y={28} textAnchor="middle"
                      fill="#0E241E" fontSize={10}
                      fontFamily="Plus Jakarta Sans, sans-serif"
                      fontWeight={isSelected ? 'bold' : '600'}
                      className="pointer-events-none select-none"
                    >
                      {node.label.length > 22 ? `${node.label.slice(0, 20)}…` : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <p className="mt-2 text-[11px] text-[#5B756E] italic">
            Click any node to inspect its evidence dossier. Case: {investigationId || '—'}
          </p>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-4 passport-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#0E241E]">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#DE4B39] stroke-[2.2]" />
              <h3 className="text-sm font-black uppercase tracking-tight text-[#0E241E] font-display">Node Detail</h3>
            </div>
            {selected && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#0E241E] bg-[#DE4B39] text-white">
                {selected.type}
              </span>
            )}
          </div>

          {selected ? (
            <div className="space-y-4 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#5B756E] mb-0.5 font-display">Label</p>
                <p className="text-base font-black text-[#0E241E] font-display">{selected.label}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-3 rounded-xl border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E]">
                  <p className="text-[10px] text-[#5B756E] font-bold uppercase font-display">ID</p>
                  <p className="font-mono text-[#0E241E] font-bold text-[11px] truncate mt-0.5">{selected.id}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border-2 border-[#0E241E] shadow-[2px_2px_0_#0E241E]">
                  <p className="text-[10px] text-[#5B756E] font-bold uppercase font-display">Status</p>
                  <p className="font-bold text-[#0E241E] text-[11px] mt-0.5">{selected.status ?? selected.category ?? 'Active'}</p>
                </div>
              </div>

              {(() => {
                const url = selected.metadata.url as string | undefined;
                const publishedAt = selected.metadata.publishedAt as string | undefined;
                const author = selected.metadata.author as string | undefined;
                const excerpt = selected.metadata.excerpt as string | undefined;
                const resolutionReason = selected.metadata.resolutionReason as string | undefined;
                return (
                  <div className="bg-white p-4 rounded-xl border-2 border-[#0E241E] space-y-3 shadow-[2px_2px_0_#0E241E]">
                    {url && (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#5B756E] mb-1 font-display">Source URL</p>
                        <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-mono text-[11px] text-[#DE4B39] hover:underline truncate">
                          <span className="truncate">{url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    )}
                    {publishedAt && (
                      <div className="flex items-center gap-1.5 text-[#0E241E]">
                        <Clock className="w-3.5 h-3.5 text-[#5B756E] shrink-0" />
                        <span>Published: <strong>{new Date(publishedAt).toLocaleDateString()}</strong></span>
                      </div>
                    )}
                    {author && (
                      <div className="flex items-center gap-1.5 text-[#0E241E]">
                        <User className="w-3.5 h-3.5 text-[#5B756E] shrink-0" />
                        <span>Author: <strong>{author}</strong></span>
                      </div>
                    )}
                    {excerpt && (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#5B756E] mb-1 font-display">Excerpt</p>
                        <p className="text-[#0E241E] italic bg-[#FAF7F2] p-2.5 rounded-lg border border-[#0E241E] text-[11px]">"{excerpt}"</p>
                      </div>
                    )}
                    {resolutionReason && (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#0E241E] mb-1 font-display">Resolution</p>
                        <p className="text-[#0E241E] bg-[#FAF7F2] p-2.5 rounded-lg border-2 border-[#0E241E] text-[11px]">{resolutionReason}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-[#5B756E] py-8">
              <MapPin className="w-8 h-8 mb-2 text-[#DE4B39] stroke-[1.5]" />
              <p className="text-xs italic">Select a node to inspect its evidence provenance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
