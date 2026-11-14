import { useMemo, useState } from 'react';
import {
  Ban,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Lock,
  Maximize2,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { GRAPH_EDGES, GRAPH_NODES } from '../data/sentinelData';
import { GraphNode } from '../types/sentinel';
import { SeverityTag } from '../components/SeverityTag';

interface ThreatGraphViewProps {
  tokensRevoked: boolean;
  firewallBlocked: boolean;
  onRevokeToken: () => void;
  onBlockDomain: () => void;
}

const TIMELINE_EVENTS = [
  {
    time: '10:02:00 UTC',
    step: 'Step 1',
    severity: 'high' as const,
    title: 'Initial SMS dispatched to 14 Treasury employees',
    detail: 'Campaign weaponized urgent wire-review pretense using spoofed UK sender ID (+44 7700 900142).',
  },
  {
    time: '10:04:12 UTC',
    step: 'Step 2',
    severity: 'high' as const,
    title: 'First victim clicks link, landing on reverse-proxy n0rthstar-sec.link',
    detail: 'Homoglyph SSL portal rendered EvilProxy session relay in Frankfurt (185.220.101.5).',
  },
  {
    time: '10:11:30 UTC',
    step: 'Step 3',
    severity: 'medium' as const,
    title: 'Voice/SMS MFA bypass prompt injected',
    detail: 'Man-in-the-Middle token capture executed; session cookie cloned by Frankfurt proxy.',
  },
  {
    time: '10:15:00 UTC',
    step: 'CRITICAL',
    severity: 'critical' as const,
    title: 'Rogue $348.2k wire request submitted via compromised session',
    detail: 'Target beneficiary: Apex Holdings Int (CH93-0000-0000-3482). SENTINEL automated killswitch triggered.',
  },
];

export function ThreatGraphView({
  tokensRevoked,
  firewallBlocked,
  onRevokeToken,
  onBlockDomain,
}: ThreatGraphViewProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'risk' | 'finance'>('all');
  const [showFilteredNoise, setShowFilteredNoise] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-domain');

  const visibleNodes = useMemo(() => {
    return GRAPH_NODES.filter((n) => {
      if (n.category === 'benign') return showFilteredNoise;
      if (filterMode === 'all') return true;
      if (filterMode === 'risk') return n.category === 'risk' || n.id === 'node-target';
      return n.category === 'finance' || n.id === 'node-target' || n.id === 'node-domain';
    });
  }, [filterMode, showFilteredNoise]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  const visibleEdges = useMemo(
    () => GRAPH_EDGES.filter((e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to)),
    [visibleNodeIds]
  );

  const selectedNode: GraphNode =
    GRAPH_NODES.find((n) => n.id === selectedNodeId) ?? GRAPH_NODES.find((n) => n.id === 'node-domain')!;

  const nodeStroke = (node: GraphNode) => {
    if (node.type === 'domain' || node.type === 'finance') return '#ba1a1a';
    if (node.type === 'actor' || node.type === 'phone') return '#f59e0b';
    if (node.type === 'benign') return '#757682';
    return '#316bf3';
  };

  const edgeStroke = (color: 'red' | 'amber' | 'blue' | 'muted') => {
    if (color === 'red') return '#ef4444';
    if (color === 'amber') return '#f59e0b';
    if (color === 'blue') return '#60a5fa';
    return '#64748b';
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#131b2e]">Threat Relationship Graph &amp; Timeline</h1>
              <SeverityTag level="low" label="ATTACK GRAPH SYNCED" showIcon />
            </div>
            <p className="text-xs text-[#444651]">
              Interactive entity correlation canvas for <span className="font-mono font-semibold text-[#00236f]">INC-2024-8841</span>. Click any node to inspect passive DNS and execute containment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-[4px] bg-[#f2f3ff] p-1">
              {(
                [
                  { id: 'all', label: 'All (7)' },
                  { id: 'risk', label: 'High Risk' },
                  { id: 'finance', label: 'Financial' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterMode(f.id)}
                  className={`rounded-[3px] px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                    filterMode === f.id ? 'bg-white text-[#00236f] shadow-xs' : 'text-[#444651] hover:text-[#131b2e]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowFilteredNoise((s) => !s)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-[4px] border px-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                showFilteredNoise
                  ? 'border-[#0051d5] bg-[#f2f3ff] text-[#00236f]'
                  : 'border-[#cbd5e1] bg-white text-[#444651] hover:bg-[#f8fafc]'
              }`}
            >
              {showFilteredNoise ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span>{showFilteredNoise ? 'Hide AI-Filtered Noise' : 'Show Pruned MSG-9921'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Split: Graph Canvas + Node Inspector */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* SVG Canvas */}
        <section className="xl:col-span-8 rounded-[8px] border border-[#cbd5e1] overflow-hidden bg-[#131b2e]">
          <div className="flex items-center justify-between border-b border-slate-700/80 bg-[#1b243b] px-4 py-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-4">
              <span className="font-mono text-[#b6c4ff]">CANVAS: N-8841-CORRELATION</span>
              <span className="hidden sm:inline text-slate-400">Red: Malicious Entity · Amber: Actor/SMS · Blue: Infra</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.75, Number((z - 0.15).toFixed(2))))}
                className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-slate-600 bg-[#283044] text-slate-200 hover:bg-slate-700"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="w-11 text-center font-mono text-[11px] tabular-nums">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.45, Number((z + 0.15).toFixed(2))))}
                className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-slate-600 bg-[#283044] text-slate-200 hover:bg-slate-700"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="inline-flex h-7 items-center gap-1 rounded-[4px] border border-slate-600 bg-[#283044] px-2 text-[11px] font-medium text-slate-200 hover:bg-slate-700"
              >
                <Maximize2 className="h-3 w-3" />
                <span>Fit</span>
              </button>
            </div>
          </div>

          <div className="graph-dot-grid relative h-[430px] w-full overflow-auto flex items-center justify-center p-4">
            <svg
              viewBox="0 0 580 420"
              className="h-full w-full max-w-[720px] transition-transform duration-150 origin-center"
              style={{ transform: `scale(${zoom})` }}
            >
              <defs>
                <marker id="arrow-red" viewBox="0 0 10 10" refX="26" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                </marker>
                <marker id="arrow-amber" viewBox="0 0 10 10" refX="26" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
                </marker>
                <marker id="arrow-blue" viewBox="0 0 10 10" refX="26" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#60a5fa" />
                </marker>
              </defs>

              {/* Edges */}
              {visibleEdges.map((edge) => {
                const from = GRAPH_NODES.find((n) => n.id === edge.from);
                const to = GRAPH_NODES.find((n) => n.id === edge.to);
                if (!from || !to) return null;
                const mx = (from.x + to.x) / 2;
                const my = (from.y + to.y) / 2;
                const marker =
                  edge.color === 'red'
                    ? 'url(#arrow-red)'
                    : edge.color === 'amber'
                    ? 'url(#arrow-amber)'
                    : edge.color === 'blue'
                    ? 'url(#arrow-blue)'
                    : undefined;
                return (
                  <g key={edge.id}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={edgeStroke(edge.color)}
                      strokeWidth={edge.color === 'red' ? 2.2 : 1.6}
                      strokeDasharray={edge.dashed ? '4 4' : undefined}
                      markerEnd={marker}
                    />
                    <rect
                      x={mx - 52}
                      y={my - 9}
                      width="104"
                      height="17"
                      rx="3"
                      fill={edge.color === 'red' ? '#7f1d1d' : '#1e293b'}
                      stroke={edge.color === 'red' ? '#ef4444' : '#334155'}
                      strokeWidth="0.8"
                    />
                    <text
                      x={mx}
                      y={my + 3}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontFamily="JetBrains Mono, monospace"
                      fontSize="8.5"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {visibleNodes.map((node) => {
                const isSelected = node.id === selectedNode.id;
                const stroke = nodeStroke(node);
                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    {isSelected && (
                      <circle cx={node.x} cy={node.y} r={34} fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />
                    )}
                    {node.type === 'target' ? (
                      <>
                        <rect
                          x={node.x - 62}
                          y={node.y - 20}
                          width="124"
                          height="40"
                          rx="4"
                          fill="#00236f"
                          stroke={isSelected ? '#93c5fd' : '#316bf3'}
                          strokeWidth={isSelected ? 2.5 : 2}
                        />
                        <text x={node.x} y={node.y - 3} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="700">
                          {node.label}
                        </text>
                        <text x={node.x} y={node.y + 10} textAnchor="middle" fill="#b6c4ff" fontFamily="JetBrains Mono" fontSize="8">
                          {node.sublabel}
                        </text>
                      </>
                    ) : (
                      <>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.type === 'domain' || node.type === 'finance' ? 27 : 24}
                          fill="#1e293b"
                          stroke={stroke}
                          strokeWidth={isSelected ? 3 : 2}
                          strokeDasharray={node.type === 'benign' ? '3 3' : undefined}
                        />
                        <text x={node.x} y={node.y - 2} textAnchor="middle" fill="#ffffff" fontFamily="JetBrains Mono" fontSize="9.5" fontWeight="700">
                          {node.label}
                        </text>
                        <text x={node.x} y={node.y + 10} textAnchor="middle" fill="#cbd5e1" fontSize="7.5">
                          {node.sublabel}
                        </text>
                        {node.badge && (
                          <>
                            <rect
                              x={node.x - 36}
                              y={node.y + 30}
                              width="72"
                              height="15"
                              rx="3"
                              fill={node.type === 'benign' ? '#334155' : '#991b1b'}
                            />
                            <text
                              x={node.x}
                              y={node.y + 40.5}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontFamily="JetBrains Mono"
                              fontSize="8"
                              fontWeight="700"
                            >
                              {node.badge}
                            </text>
                          </>
                        )}
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </section>

        {/* Right 4 cols: Selected Entity Inspector + AI Guardrail */}
        <aside className="xl:col-span-4 flex flex-col gap-4">
          <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-3">
            <div className="flex items-start justify-between gap-2 border-b border-[#e2e8f0] pb-2.5">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#0051d5]">
                  {selectedNode.entityType}
                </div>
                <h2 className="mt-0.5 font-mono text-sm font-bold text-[#131b2e]">{selectedNode.title}</h2>
              </div>
              {selectedNode.id === 'node-domain' && (
                <SeverityTag
                  level={firewallBlocked ? 'low' : 'critical'}
                  label={firewallBlocked ? 'SINKHOLED' : 'BLOCKLIST ACTIVE'}
                  showIcon
                />
              )}
            </div>

            <p className="text-xs leading-relaxed text-[#444651]">{selectedNode.summary}</p>

            {selectedNode.passiveDns && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#444651]">
                  Enrichment &amp; Passive Telemetry
                </div>
                <ul className="space-y-1 rounded-[4px] border border-[#e2e8f0] bg-[#faf8ff] p-2.5 font-mono text-[11px] text-[#131b2e]">
                  {selectedNode.passiveDns.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedNode.riskIndicators && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#ba1a1a]">
                  High Risk Indicators
                </div>
                <ul className="space-y-1 rounded-[4px] border border-[#fca5a5] bg-[#fef2f2] p-2.5 text-xs text-[#93000a]">
                  {selectedNode.riskIndicators.map((ind) => (
                    <li key={ind}>• {ind}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onRevokeToken}
                className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-[4px] border px-2.5 text-xs font-semibold transition-colors ${
                  tokensRevoked
                    ? 'border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]'
                    : 'border-[#cbd5e1] bg-white text-[#131b2e] hover:bg-[#f2f3ff]'
                }`}
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>{tokensRevoked ? 'Tokens Revoked' : 'Revoke Token'}</span>
              </button>
              <button
                type="button"
                onClick={onBlockDomain}
                className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-[4px] px-2.5 text-xs font-semibold transition-colors ${
                  firewallBlocked
                    ? 'border border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]'
                    : 'bg-[#00236f] text-white hover:bg-[#1e3a8a]'
                }`}
              >
                <Ban className="h-3.5 w-3.5" />
                <span>{firewallBlocked ? 'Domain Blocked' : 'Sinkhole Domain'}</span>
              </button>
            </div>
          </section>

          <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#00236f]">
              <ShieldCheck className="h-4 w-4 text-[#0051d5]" />
              <span>Correlation Guardrail</span>
            </div>
            <p className="text-xs leading-relaxed text-[#444651]">
              SENTINEL automatically parsed and pruned unrelated telemetry (<span className="font-mono">MSG-9921 Internal HR blast</span>), eliminating alert noise to preserve investigation velocity.
            </p>
          </section>
        </aside>
      </div>

      {/* Temporal Attack Reconstruction */}
      <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0] pb-3">
          <div>
            <h2 className="text-sm font-semibold text-[#131b2e]">Temporal Attack Reconstruction</h2>
            <p className="text-xs text-[#444651]">Chronological sequence locked across 4 synchronized vectors</p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#444651]">
            <Fingerprint className="h-3.5 w-3.5 text-[#00236f]" />
            <span>HASH: 8e91c784...a9f2</span>
            <span className="inline-flex items-center gap-1 rounded-[4px] border border-[#cbd5e1] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-semibold text-[#131b2e]">
              <Lock className="h-3 w-3" />
              RECONSTRUCTION LOCKED
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {TIMELINE_EVENTS.map((ev) => (
            <div key={ev.time} className="rounded-[6px] border border-[#e2e8f0] bg-[#faf8ff] p-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-[#00236f] tabular-nums">{ev.time}</span>
                <SeverityTag level={ev.severity} label={ev.step.toUpperCase()} />
              </div>
              <h3 className="text-xs font-semibold text-[#131b2e]">{ev.title}</h3>
              <p className="text-xs leading-relaxed text-[#444651]">{ev.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
