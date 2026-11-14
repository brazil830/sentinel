import { useMemo, useState } from 'react';
import { CheckCircle2, Download, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
import { THREAT_INTEGRATIONS } from '../data/sentinelData';
import { AuditLogEntry } from '../types/sentinel';
import { SeverityTag } from '../components/SeverityTag';
import { triggerFileDownload } from '../utils/exportHelpers';

interface AuditComplianceViewProps {
  auditLogs: AuditLogEntry[];
  onRecordAudit: (eventType: string, surface: string, description: string) => void;
}

export function AuditComplianceView({ auditLogs, onRecordAudit }: AuditComplianceViewProps) {
  const [actorFilter, setActorFilter] = useState<'all' | 'sarah' | 'system' | 'daemon'>('all');
  const [piiMasking, setPiiMasking] = useState(true);
  const [containmentThreshold, setContainmentThreshold] = useState(92);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const filteredLogs = useMemo(() => {
    if (actorFilter === 'all') return auditLogs;
    return auditLogs.filter((l) => l.actorKey === actorFilter);
  }, [auditLogs, actorFilter]);

  const handleExportAudit = () => {
    const payload = JSON.stringify(
      {
        chain: 'ED25519-CHAIN',
        compliance: ['SOC 2 Type II', 'FedRAMP', 'SEC Rule 17a-4'],
        sha256: '8cf3a190de44b71e9012ff8802',
        exportedAt: new Date().toISOString(),
        totalSignatures24h: 1429 + auditLogs.length - 4,
        entries: auditLogs,
      },
      null,
      2
    );
    triggerFileDownload('sentinel-signed-audit-export.json', payload, 'application/json');
    setExportSuccess(true);
    onRecordAudit('AUDIT EXPORT', 'Compliance Settings', 'Generated SHA-256 signed compliance archive.');
    setTimeout(() => setExportSuccess(false), 4000);
  };

  const handleTestSync = (id: string, name: string) => {
    setSyncingId(id);
    onRecordAudit('INTEGRATION SYNC', name, `Verified mutual TLS & API health check for ${name}.`);
    setTimeout(() => setSyncingId(null), 900);
  };

  return (
    <div className="space-y-4">
      {/* Verified Compliance Banner */}
      <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityTag level="low" label="VERIFIED COMPLIANCE · ED25519-CHAIN" showIcon />
              <span className="text-xs font-medium text-[#444651]">SOC 2 Type II &amp; FedRAMP</span>
            </div>
            <h1 className="text-lg font-bold text-[#131b2e]">Audit &amp; Compliance Settings</h1>
            <p className="text-xs text-[#444651]">
              Cryptographically sealed operator ledger, external threat-intelligence integrations, and automated containment governance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-[6px] border border-[#e2e8f0] bg-[#faf8ff] px-3 py-2 text-right">
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#444651]">Audit Coverage</div>
              <div className="font-mono text-base font-bold text-[#047857] tabular-nums">100% COMPLIANT</div>
            </div>
            <div className="rounded-[6px] border border-[#e2e8f0] bg-[#faf8ff] px-3 py-2 text-right">
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#444651]">Immutable Ledger (24h)</div>
              <div className="font-mono text-base font-bold text-[#131b2e] tabular-nums">
                {(1425 + auditLogs.length).toLocaleString()} SIGS
              </div>
            </div>
            <button
              type="button"
              onClick={handleExportAudit}
              className="inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-[#00236f] px-3.5 text-xs font-semibold text-white hover:bg-[#1e3a8a] whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Audit</span>
            </button>
          </div>
        </div>

        {exportSuccess && (
          <div className="mt-3 flex items-center justify-between rounded-[4px] border border-[#a7f3d0] bg-[#ecfdf5] px-3 py-2 text-xs text-[#047857]">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>Audit Export Generated — SHA-256: 8cf3...90de (Signed JSON Archive)</span>
            </div>
            <span className="font-mono">Verified</span>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Left 7 cols: Live Audit Stream */}
        <section className="xl:col-span-7 rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0] pb-3">
            <div>
              <h2 className="text-sm font-semibold text-[#131b2e]">Live Audit Stream</h2>
              <p className="text-xs text-[#444651]">INGEST: REALTIME · Every containment action is appended with an Ed25519 signature</p>
            </div>

            <div className="flex flex-wrap items-center gap-1 rounded-[4px] bg-[#f2f3ff] p-1">
              {(
                [
                  { id: 'all', label: `All Actors (${auditLogs.length})` },
                  { id: 'sarah', label: 'Sarah Jensen' },
                  { id: 'system', label: 'System Defense' },
                  { id: 'daemon', label: 'Daemon / Admin' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActorFilter(tab.id)}
                  className={`rounded-[3px] px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    actorFilter === tab.id ? 'bg-white text-[#00236f] shadow-xs' : 'text-[#444651] hover:text-[#131b2e]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#e2e8f0]">
            {filteredLogs.map((entry) => (
              <div key={entry.id} className="py-3 first:pt-1 last:pb-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-[#757682] tabular-nums">{entry.timestamp}</span>
                    <SeverityTag level={entry.severity} label={entry.eventType} />
                    <span className="font-mono text-xs font-semibold text-[#00236f]">{entry.sigHash}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#444651]">
                    {entry.actor} · {entry.surface}
                  </span>
                </div>
                <p className="text-xs text-[#131b2e]">{entry.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Right 5 cols: Threat Intel Integrations + Governance */}
        <div className="xl:col-span-5 space-y-4">
          <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2.5">
              <h2 className="text-sm font-semibold text-[#131b2e]">Threat Intelligence &amp; Integrations</h2>
              <SeverityTag level="low" label="5/5 OPERATIONAL" showIcon />
            </div>

            <div className="divide-y divide-[#e2e8f0]">
              {THREAT_INTEGRATIONS.map((int) => (
                <div key={int.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#131b2e]">{int.name}</span>
                      <SeverityTag level="low" label={int.status} />
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#444651] truncate">{int.details}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTestSync(int.id, int.name)}
                    className="inline-flex h-7 items-center gap-1 rounded-[4px] border border-[#cbd5e1] bg-white px-2 text-[11px] font-semibold text-[#131b2e] hover:bg-[#f2f3ff] shrink-0"
                  >
                    <RefreshCw className={`h-3 w-3 ${syncingId === int.id ? 'animate-spin text-[#0051d5]' : ''}`} />
                    <span>{syncingId === int.id ? 'Syncing' : 'Verify'}</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#131b2e]">System Governance &amp; Controls</h2>
              <ShieldCheck className="h-4 w-4 text-[#00236f]" />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3 rounded-[4px] border border-[#e2e8f0] bg-[#faf8ff] p-3">
                <div>
                  <div className="text-xs font-semibold text-[#131b2e]">Zero-Knowledge PII Masking</div>
                  <p className="mt-0.5 text-[11px] text-[#444651]">
                    Customer account numbers, PANs, and tax IDs are SHA-256 salted and redacted prior to SOC ingestion.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !piiMasking;
                    setPiiMasking(next);
                    onRecordAudit('POLICY UPDATE', 'Governance', `Zero-Knowledge PII Masking set to ${next ? 'ACTIVE' : 'DISABLED'}.`);
                  }}
                  className={`rounded-[4px] px-2.5 py-1 text-[11px] font-semibold shrink-0 ${
                    piiMasking ? 'bg-[#047857] text-white' : 'border border-[#cbd5e1] bg-white text-[#444651]'
                  }`}
                >
                  {piiMasking ? 'ACTIVE' : 'PAUSED'}
                </button>
              </div>

              <div className="rounded-[4px] border border-[#e2e8f0] bg-[#faf8ff] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#131b2e]">Automated Containment Threshold</span>
                  <span className="font-mono text-xs font-bold text-[#00236f] tabular-nums">{containmentThreshold}%</span>
                </div>
                <input
                  type="range"
                  min={75}
                  max={99}
                  value={containmentThreshold}
                  onChange={(e) => setContainmentThreshold(Number(e.target.value))}
                  aria-label="Automated containment confidence threshold"
                  className="w-full accent-[#00236f]"
                />
                <p className="text-[11px] text-[#444651]">
                  Auto-executes host isolation and transaction escrow when correlation confidence exceeds {containmentThreshold}%.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-[4px] border border-[#e2e8f0] bg-[#faf8ff] p-3">
                <div>
                  <div className="text-xs font-semibold text-[#131b2e]">WORM Retention Policy</div>
                  <div className="text-[11px] text-[#444651]">90 Days Hot Search / 7 Years Cold Archive (SEC Rule 17a-4)</div>
                </div>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#00236f] shrink-0">
                  <Lock className="h-3 w-3" />
                  LOCKED
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
