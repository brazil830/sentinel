import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Download,
  FileText,
  Play,
  PlusCircle,
  Search,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { ATTACK_VECTOR_BREAKDOWN } from '../data/sentinelData';
import { ForensicInspectionTarget, SecurityIncident, TelemetryStreamRow, ViewId } from '../types/sentinel';
import { SeverityTag } from '../components/SeverityTag';
import { triggerFileDownload } from '../utils/exportHelpers';

interface OverviewViewProps {
  incidents: SecurityIncident[];
  telemetryStream: TelemetryStreamRow[];
  onNavigate: (view: ViewId) => void;
  onSelectIncident: (incidentId: string) => void;
  onInspect: (target: ForensicInspectionTarget) => void;
  onRecordAudit: (eventType: string, surface: string, description: string) => void;
}

export function OverviewView({
  incidents,
  telemetryStream,
  onNavigate,
  onSelectIncident,
  onInspect,
  onRecordAudit,
}: OverviewViewProps) {
  const [queueFilter, setQueueFilter] = useState<'all' | 'critical' | 'resolved' | 'benign'>('all');
  const [cliQuery, setCliQuery] = useState(`sentinel query --filter="incident.id eq 'INC-8841'"`);
  const [activeVector, setActiveVector] = useState<string | null>(null);
  const [cliNotice, setCliNotice] = useState<string | null>(null);

  const filteredIncidents = useMemo(() => {
    if (queueFilter === 'all') return incidents;
    if (queueFilter === 'critical') return incidents.filter((i) => i.severity === 'critical');
    if (queueFilter === 'resolved') return incidents.filter((i) => i.status === 'RESOLVED');
    return incidents.filter((i) => i.severity === 'benign');
  }, [incidents, queueFilter]);

  const filteredTelemetry = useMemo(() => {
    const q = cliQuery.toLowerCase();
    if (!q || q.includes('inc-8841') || q.includes('all')) return telemetryStream;
    const termMatch = q.match(/filter="([^"]+)"/)?.[1] ?? q.replace('sentinel query', '').trim();
    if (!termMatch) return telemetryStream;
    const matches = telemetryStream.filter(
      (row) =>
        row.message.toLowerCase().includes(termMatch) ||
        row.actionTag.toLowerCase().includes(termMatch) ||
        (row.ioc && row.ioc.toLowerCase().includes(termMatch))
    );
    return matches.length > 0 ? matches : telemetryStream;
  }, [telemetryStream, cliQuery]);

  const handleRunCli = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cliQuery.trim();
    if (!cleaned) return;
    if (cleaned.toLowerCase().includes('inc-8841') || cleaned.toLowerCase().includes('8841')) {
      setCliNotice('Matched 4 correlated artifacts for INC-2024-8841.');
    } else {
      setCliNotice(`Executed query across 2,410 EPS buffer: "${cleaned}"`);
    }
    onRecordAudit('CLI QUERY', 'SOC Overview', `Executed telemetry filter: ${cleaned}`);
    setTimeout(() => setCliNotice(null), 3000);
  };

  const handleExportOverview = () => {
    const report = [
      'SENTINEL ENTERPRISE SOC — EXECUTIVE THREAT SUMMARY',
      'Scenario: N-8841 | Threat Level: DEFCON 2 | Composite Risk: 87/100',
      'Primary Incident: INC-2024-8841 (Coordinated Northstar Bank Phishing & Wire Divert Campaign)',
      'At-Risk Capital Protected: $348,200.00 USD (Frozen at Clearing House)',
      'Detector Accuracy: 99.4% | Average MTTC: 4.2 min',
    ].join('\n');
    triggerFileDownload('sentinel-soc-executive-summary.txt', report);
    onRecordAudit('EXPORT REPORT', 'SOC Overview', 'Exported executive threat overview dossier.');
  };

  return (
    <div className="space-y-4">
      {/* Top Threat Banner + Quick Actions */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="xl:col-span-8 rounded-[8px] border border-[#fca5a5] bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#444651]">
                <SeverityTag level="critical" label="DEFCON 2 · THREAT ALERT" showIcon />
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">10:16:42 UTC</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono font-medium text-[#ba1a1a] tabular-nums">Composite Risk 87/100</span>
              </div>
              <h1 className="text-lg font-bold tracking-tight text-[#131b2e]">
                Active Social Engineering Campaign
              </h1>
              <p className="text-xs text-[#444651]">
                Critical Triage <span className="font-mono font-semibold text-[#131b2e]">INC-2024-8841</span> — Multi-vector smishing lure, homoglyph AiTM proxy, and unauthorized SWIFT MT103 wire redirect targeting Northstar Bank Treasury.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectIncident('INC-2024-8841');
                onNavigate('cases');
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-[4px] bg-[#00236f] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#1e3a8a] whitespace-nowrap shrink-0"
            >
              <span>View Case Dossier</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        <section className="xl:col-span-4 rounded-[8px] border border-[#e2e8f0] bg-white p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.04em] text-[#444651]">Rapid Response Actions</span>
            <span className="font-mono text-[11px] text-[#757682]">SCENARIO N-8841</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onNavigate('simulation')}
              className="flex flex-col items-center justify-center gap-1.5 rounded-[4px] border border-[#cbd5e1] bg-[#faf8ff] px-2 py-2.5 text-xs font-semibold text-[#00236f] transition-colors hover:border-[#0051d5] hover:bg-[#f2f3ff]"
            >
              <Play className="h-4 w-4 text-[#0051d5]" />
              <span className="whitespace-nowrap">Launch Sim</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('lab')}
              className="flex flex-col items-center justify-center gap-1.5 rounded-[4px] border border-[#cbd5e1] bg-[#faf8ff] px-2 py-2.5 text-xs font-semibold text-[#131b2e] transition-colors hover:border-[#0051d5] hover:bg-[#f2f3ff]"
            >
              <PlusCircle className="h-4 w-4 text-[#00236f]" />
              <span className="whitespace-nowrap">Ingest Feed</span>
            </button>
            <button
              type="button"
              onClick={handleExportOverview}
              className="flex flex-col items-center justify-center gap-1.5 rounded-[4px] border border-[#cbd5e1] bg-[#faf8ff] px-2 py-2.5 text-xs font-semibold text-[#131b2e] transition-colors hover:border-[#0051d5] hover:bg-[#f2f3ff]"
            >
              <Download className="h-4 w-4 text-[#444651]" />
              <span className="whitespace-nowrap">Export Summary</span>
            </button>
          </div>
        </section>
      </div>

      {/* 4-Column KPI Strip */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-4">
          <div className="flex items-center justify-between text-xs font-medium text-[#444651]">
            <span>Active Threats</span>
            <ShieldAlert className="h-4 w-4 text-[#ba1a1a]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#131b2e] tabular-nums">14</span>
            <span className="font-mono text-xs font-semibold text-[#ba1a1a] tabular-nums">+3 / 15m</span>
          </div>
          <p className="mt-1 text-xs text-[#444651]">7 vectors under automated block</p>
        </div>

        <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-4">
          <div className="flex items-center justify-between text-xs font-medium text-[#444651]">
            <span>Correlated At-Risk</span>
            <ShieldCheck className="h-4 w-4 text-[#00236f]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#131b2e] tabular-nums">$348.2K</span>
            <span className="font-mono text-xs font-semibold text-[#444651]">USD</span>
          </div>
          <p className="mt-1 text-xs text-[#444651]">Northstar Escrow Reserve (Frozen)</p>
        </div>

        <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-4">
          <div className="flex items-center justify-between text-xs font-medium text-[#444651]">
            <span>Detector Accuracy</span>
            <TrendingUp className="h-4 w-4 text-[#047857]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#131b2e] tabular-nums">99.4%</span>
            <span className="font-mono text-xs font-semibold text-[#047857] tabular-nums">+0.3% 7d</span>
          </div>
          <p className="mt-1 text-xs text-[#444651]">NLP V5.2 Ensemble Active</p>
        </div>

        <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-4">
          <div className="flex items-center justify-between text-xs font-medium text-[#444651]">
            <span>Avg. MTTC</span>
            <Timer className="h-4 w-4 text-[#0051d5]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#131b2e] tabular-nums">4.2</span>
            <span className="font-mono text-xs font-semibold text-[#444651]">min</span>
          </div>
          <p className="mt-1 text-xs text-[#047857]">-38s below 5m SLA target</p>
        </div>
      </section>

      {/* Main 12-Column Analytics Workspace */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Left 7 cols: Correlated Security Incidents Queue */}
        <section className="xl:col-span-7 rounded-[8px] border border-[#e2e8f0] bg-white p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0] pb-3">
            <div>
              <h2 className="text-sm font-semibold text-[#131b2e]">Correlated Security Incidents</h2>
              <p className="text-xs text-[#444651]">Prioritized triage queue across multi-modal feeds</p>
            </div>
            <div className="flex items-center gap-1 rounded-[4px] bg-[#f2f3ff] p-1">
              {(
                [
                  { id: 'all', label: `All (${incidents.length})` },
                  { id: 'critical', label: 'Critical' },
                  { id: 'resolved', label: 'Resolved' },
                  { id: 'benign', label: 'Benign' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setQueueFilter(tab.id)}
                  className={`rounded-[3px] px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    queueFilter === tab.id
                      ? 'bg-white text-[#00236f] shadow-xs'
                      : 'text-[#444651] hover:text-[#131b2e]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#e2e8f0]">
            {filteredIncidents.map((inc) => (
              <article key={inc.id} className="py-3 first:pt-1 last:pb-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityTag level={inc.severity} showIcon />
                      <span className="font-mono text-xs font-semibold text-[#00236f]">{inc.id}</span>
                      <span aria-hidden="true" className="text-[#cbd5e1]">·</span>
                      <span className="text-xs font-medium text-[#444651]">{inc.status}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#131b2e]">{inc.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#444651]">
                      <span>
                        Target: <span className="font-medium text-[#131b2e]">{inc.targetActor}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{inc.timelineSpan}</span>
                      {inc.domainIoc && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono rounded-[3px] border border-[#e2e8f0] bg-[#f1f5f9] px-1.5 py-0.5 text-[11px] text-[#131b2e]">
                            {inc.domainIoc}
                          </span>
                        </>
                      )}
                      {inc.blockedIp && !inc.domainIoc && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono rounded-[3px] border border-[#e2e8f0] bg-[#f1f5f9] px-1.5 py-0.5 text-[11px] text-[#131b2e]">
                            Blocked IP: {inc.blockedIp}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-[#444651]">
                    {inc.linkedArtifacts} Linked Artifacts · Confidence <span className="font-mono tabular-nums font-medium">{inc.confidence}%</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectIncident(inc.id);
                        onNavigate('cases');
                      }}
                      className="inline-flex h-8 items-center gap-1.5 rounded-[4px] bg-[#00236f] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#1e3a8a] whitespace-nowrap"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Inspect Case</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('simulation')}
                      className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-[#cbd5e1] bg-white px-3 text-xs font-semibold text-[#131b2e] transition-colors hover:bg-[#f2f3ff] whitespace-nowrap"
                    >
                      <Play className="h-3.5 w-3.5 text-[#0051d5]" />
                      <span>Open Simulation</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Right 5 cols: Observed Attack Vectors + Live Ingestion Telemetry */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#131b2e]">Observed Attack Vectors</h2>
              <span className="font-mono text-[11px] text-[#444651]">TELEMETRY: 24H</span>
            </div>

            {/* Segmented proportion bar */}
            <div className="mt-3 flex h-3 w-full overflow-hidden rounded-[4px] bg-[#f1f5f9]">
              {ATTACK_VECTOR_BREAKDOWN.map((vec) => (
                <button
                  key={vec.label}
                  type="button"
                  onMouseEnter={() => setActiveVector(vec.label)}
                  onMouseLeave={() => setActiveVector(null)}
                  onClick={() => setActiveVector(activeVector === vec.label ? null : vec.label)}
                  style={{ width: `${vec.percentage}%`, backgroundColor: vec.color }}
                  className="h-full transition-opacity hover:opacity-85"
                  title={`${vec.label}: ${vec.percentage}%`}
                  aria-label={`${vec.label}: ${vec.percentage}%`}
                />
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {ATTACK_VECTOR_BREAKDOWN.map((vec) => (
                <div
                  key={vec.label}
                  className={`flex items-center justify-between rounded-[4px] border px-2.5 py-2 text-xs transition-colors ${
                    activeVector === vec.label ? 'border-[#0051d5] bg-[#f2f3ff]' : 'border-[#e2e8f0] bg-[#faf8ff]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: vec.color }} />
                    <span className="truncate font-medium text-[#131b2e]">{vec.label}</span>
                  </div>
                  <span className="ml-2 font-mono font-semibold text-[#131b2e] tabular-nums">{vec.percentage}%</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#047857]" />
                <h2 className="text-sm font-semibold text-[#131b2e]">Live Ingestion Telemetry</h2>
              </div>
              <span className="font-mono text-[11px] font-medium text-[#444651] tabular-nums">BUFFER: 2,410 EPS</span>
            </div>

            <div className="divide-y divide-[#e2e8f0] rounded-[4px] border border-[#e2e8f0]">
              {filteredTelemetry.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() =>
                    onInspect({
                      id: row.id,
                      title: row.message,
                      subtitle: `Captured at ${row.timestamp} UTC via SENTINEL Streaming Buffer`,
                      severity: row.severity,
                      category: 'LIVE TELEMETRY EVENT',
                      properties: {
                        'Event ID': row.id,
                        Timestamp: `${row.timestamp} UTC`,
                        'Disposition': row.actionTag,
                        'Primary IoC': row.ioc ?? 'N/A',
                      },
                      rawJson: row,
                      recommendedAction: { label: 'Block Indicator Globally', actionKey: 'block_domain' },
                    })
                  }
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-[#f8fafc]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[11px] text-[#757682] shrink-0 tabular-nums">{row.timestamp}</span>
                    <span className="truncate font-mono text-xs text-[#131b2e]">{row.message}</span>
                  </div>
                  <SeverityTag level={row.severity} label={row.actionTag.toUpperCase()} />
                </button>
              ))}
            </div>

            <form onSubmit={handleRunCli} className="mt-auto space-y-1.5">
              <div className="flex items-center gap-2 rounded-[4px] border border-[#cbd5e1] bg-[#f8fafc] px-2.5 py-1.5 focus-within:border-[#0051d5]">
                <Terminal className="h-3.5 w-3.5 text-[#00236f] shrink-0" />
                <input
                  type="text"
                  value={cliQuery}
                  onChange={(e) => setCliQuery(e.target.value)}
                  aria-label="Sentinel telemetry query"
                  className="w-full bg-transparent font-mono text-xs text-[#131b2e] focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex h-6 items-center gap-1 rounded-[3px] bg-[#00236f] px-2 text-[11px] font-semibold text-white hover:bg-[#1e3a8a] shrink-0"
                >
                  <Search className="h-3 w-3" />
                  <span>Query</span>
                </button>
              </div>
              {cliNotice && <p className="font-mono text-[11px] text-[#047857]">{cliNotice}</p>}
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
