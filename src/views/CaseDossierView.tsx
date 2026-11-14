import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Ban,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileJson,
  Fingerprint,
  KeyRound,
  Laptop,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import { CASE_EVIDENCE_CHAIN, EXPORT_TEMPLATES, MITRE_TECHNIQUES } from '../data/sentinelData';
import { AuditLogEntry, ForensicInspectionTarget, SecurityIncident, ViewId } from '../types/sentinel';
import { SeverityTag } from '../components/SeverityTag';
import { copyToClipboard, triggerFileDownload } from '../utils/exportHelpers';

interface CaseDossierViewProps {
  incident: SecurityIncident;
  auditLogs: AuditLogEntry[];
  countermeasures: {
    endpointsIsolated: boolean;
    tokensRevoked: boolean;
    firewallBlocked: boolean;
  };
  onExecuteCountermeasure: (key: 'endpointsIsolated' | 'tokensRevoked' | 'firewallBlocked') => void;
  onInspect: (target: ForensicInspectionTarget) => void;
  onNavigate: (view: ViewId) => void;
  onRecordAudit: (eventType: string, surface: string, description: string) => void;
}

export function CaseDossierView({
  incident,
  auditLogs,
  countermeasures,
  onExecuteCountermeasure,
  onInspect,
  onNavigate,
  onRecordAudit,
}: CaseDossierViewProps) {
  const [subTab, setSubTab] = useState<'summary' | 'evidence' | 'correlation' | 'audit' | 'playbook'>('summary');
  const [slaSeconds, setSlaSeconds] = useState(incident.slaSecondsRemaining || 540);
  const [hashCopied, setHashCopied] = useState(false);

  useEffect(() => {
    setSlaSeconds(incident.slaSecondsRemaining || 540);
  }, [incident.id, incident.slaSecondsRemaining]);

  useEffect(() => {
    if (slaSeconds <= 0) return;
    const id = setInterval(() => setSlaSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [slaSeconds]);

  const formatSla = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  };

  const handleCopyHash = async () => {
    const ok = await copyToClipboard(incident.forensicsHash);
    if (ok) {
      setHashCopied(true);
      setTimeout(() => setHashCopied(false), 1500);
    }
  };

  const handleExportDossier = () => {
    triggerFileDownload(EXPORT_TEMPLATES.stix.filename, EXPORT_TEMPLATES.stix.content, 'application/json');
    onRecordAudit('EXPORT DOSSIER', 'Case Dossier', `Exported STIX 2.1 bundle for ${incident.id}`);
  };

  return (
    <div className="space-y-4">
      {/* Case Header Card */}
      <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-sm font-bold text-[#00236f]">{incident.id}</span>
              <SeverityTag level={incident.severity} showIcon />
              <span className="inline-flex items-center gap-1 rounded-[4px] border border-[#a7f3d0] bg-[#ecfdf5] px-2 py-0.5 text-[11px] font-semibold text-[#047857]">
                <ShieldCheck className="h-3 w-3" />
                <span>{incident.status}</span>
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-xs text-[#b45309] tabular-nums">
                <Timer className="h-3.5 w-3.5" />
                <span>SLA: {slaSeconds > 0 ? `${formatSla(slaSeconds)} Remaining` : 'Met (Contained)'}</span>
              </span>
            </div>
            <h1 className="text-lg font-bold text-[#131b2e]">{incident.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#444651]">
              <span>
                Target: <strong className="font-semibold text-[#131b2e]">{incident.target}</strong>
              </span>
              <span>
                CTI Lead: <strong className="font-semibold text-[#131b2e]">{incident.leadAnalyst}</strong>
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="inline-flex items-center gap-1 font-mono text-xs text-[#00236f] hover:underline"
                title="Copy Forensics SHA-256"
              >
                <Fingerprint className="h-3.5 w-3.5" />
                <span>Hash: {incident.forensicsHash.slice(0, 8)}...{incident.forensicsHash.slice(-4)}</span>
                {hashCopied ? <Check className="h-3 w-3 text-[#047857]" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('graph')}
              className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-[#cbd5e1] bg-white px-3 text-xs font-semibold text-[#131b2e] hover:bg-[#f2f3ff] whitespace-nowrap"
            >
              <span>Inspect Attack Graph</span>
            </button>
            <button
              type="button"
              onClick={handleExportDossier}
              className="inline-flex h-8 items-center gap-1.5 rounded-[4px] bg-[#00236f] px-3 text-xs font-semibold text-white hover:bg-[#1e3a8a] whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export STIX 2.1</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="mt-4 flex flex-wrap gap-1 border-t border-[#e2e8f0] pt-3">
          {(
            [
              { id: 'summary', label: 'Overview & Summary' },
              { id: 'evidence', label: `Evidence Chain (${CASE_EVIDENCE_CHAIN.length})` },
              { id: 'correlation', label: 'Attack Path & MITRE' },
              { id: 'audit', label: `Case Audit Log (${auditLogs.length})` },
              { id: 'playbook', label: 'Containment Playbook' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`rounded-[4px] px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                subTab === t.id
                  ? 'bg-[#00236f] text-white'
                  : 'bg-[#f2f3ff] text-[#444651] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8 space-y-4">
          {(subTab === 'summary' || subTab === 'correlation') && (
            <>
              {/* Automated Incident Narrative */}
              <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.04em] text-[#00236f]">
                    Neural Attribution Narrative
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#047857] tabular-nums">
                    Attribution Confidence: {incident.confidence}%
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#131b2e]">{incident.narrative}</p>

                {/* Attack Path Reconstruction */}
                <div className="mt-4 rounded-[6px] border border-[#e2e8f0] bg-[#faf8ff] p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#131b2e]">Attack Path Reconstruction</span>
                    <span className="font-mono text-[#444651]">13m Kill Chain Window · Phase 6 Contained</span>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded-[4px] border border-[#e2e8f0] bg-white p-2.5">
                      <div className="font-mono text-[11px] text-[#ba1a1a]">14:02 UTC · Stage 1</div>
                      <div className="mt-0.5 text-xs font-semibold text-[#131b2e]">Smish Lure Dispatched</div>
                      <div className="mt-0.5 text-[11px] text-[#444651]">Twilio UK +44 7700 900142</div>
                    </div>
                    <div className="rounded-[4px] border border-[#e2e8f0] bg-white p-2.5">
                      <div className="font-mono text-[11px] text-[#c2410c]">14:08 UTC · Stage 2</div>
                      <div className="mt-0.5 text-xs font-semibold text-[#131b2e]">Portal Clone & MFA Relay</div>
                      <div className="mt-0.5 text-[11px] text-[#444651]">n0rthstar-sec.link EvilProxy</div>
                    </div>
                    <div className="rounded-[4px] border border-[#a7f3d0] bg-[#ecfdf5] p-2.5">
                      <div className="font-mono text-[11px] text-[#047857]">14:15 UTC · Stage 3</div>
                      <div className="mt-0.5 text-xs font-semibold text-[#131b2e]">Wire Redirect Frozen</div>
                      <div className="mt-0.5 text-[11px] text-[#047857]">$348,200.00 Held at Clearing</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Mapped MITRE ATT&CK Techniques */}
              <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#131b2e]">Mapped MITRE ATT&CK Techniques</h2>
                  <span className="text-xs text-[#444651]">Click any technique for defensive guidance</span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {MITRE_TECHNIQUES.map((tech) => (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() =>
                        onInspect({
                          id: tech.id,
                          title: `${tech.id} — ${tech.name}`,
                          subtitle: tech.description,
                          severity: 'high',
                          category: `MITRE ATT&CK · ${tech.tactic.toUpperCase()}`,
                          properties: {
                            'Technique ID': tech.id,
                            Tactic: tech.tactic,
                            'Observed Campaign': incident.id,
                            'Recommended Mitigation': tech.mitigation,
                          },
                          rawJson: tech,
                        })
                      }
                      className="flex items-start justify-between gap-2 rounded-[4px] border border-[#e2e8f0] bg-[#faf8ff] p-3 text-left transition-colors hover:border-[#0051d5] hover:bg-[#f2f3ff]"
                    >
                      <div>
                        <div className="font-mono text-xs font-semibold text-[#00236f]">{tech.id}</div>
                        <div className="mt-0.5 text-xs font-semibold text-[#131b2e]">{tech.name}</div>
                        <div className="mt-0.5 text-[11px] text-[#444651]">{tech.tactic}</div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#757682] mt-1" />
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {(subTab === 'summary' || subTab === 'evidence') && (
            <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#131b2e]">Ingested Telemetry Chain</h2>
                  <p className="text-xs text-[#444651]">4 cryptographically verified forensic artifacts</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('lab')}
                  className="text-xs font-semibold text-[#0051d5] hover:underline"
                >
                  Open in Evidence Lab →
                </button>
              </div>
              <div className="divide-y divide-[#e2e8f0]">
                {CASE_EVIDENCE_CHAIN.map((evi) => (
                  <div key={evi.id} className="py-3 flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#00236f]">{evi.id}</span>
                        <SeverityTag level={evi.severity} label={evi.tag} />
                        <span className="text-[11px] font-medium text-[#444651]">{evi.category}</span>
                        <span className="font-mono text-[11px] text-[#757682]">{evi.timestamp}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#131b2e]">{evi.title}</h3>
                      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 text-xs text-[#444651] pt-1">
                        {Object.entries(evi.metadata).map(([k, v]) => (
                          <div key={k} className="truncate">
                            <span className="text-[#757682]">{k}:</span>{' '}
                            <span className="font-mono text-[#131b2e]">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onInspect({
                          id: evi.id,
                          title: evi.title,
                          subtitle: evi.rawPayload,
                          severity: evi.severity,
                          category: evi.category,
                          properties: evi.metadata,
                          rawJson: evi,
                          recommendedAction: { label: 'Isolate & Quarantine Indicator', actionKey: 'block_domain' },
                        })
                      }
                      className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-[#cbd5e1] bg-white px-2.5 text-xs font-semibold text-[#131b2e] hover:bg-[#f2f3ff] shrink-0"
                    >
                      <FileJson className="h-3.5 w-3.5 text-[#0051d5]" />
                      <span>Inspect Payload</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {subTab === 'audit' && (
            <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4">
              <h2 className="text-sm font-semibold text-[#131b2e]">Case Audit Trail</h2>
              <div className="mt-3 divide-y divide-[#e2e8f0]">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#757682]">{log.timestamp}</span>
                        <SeverityTag level={log.severity} label={log.eventType} />
                        <span className="font-mono text-[#00236f]">{log.sigHash}</span>
                      </div>
                      <p className="text-[#131b2e]">{log.description}</p>
                    </div>
                    <span className="font-mono text-[11px] text-[#444651]">{log.actor} · {log.surface}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {subTab === 'playbook' && (
            <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-3">
              <h2 className="text-sm font-semibold text-[#131b2e]">SOC Playbook: Multi-Vector Wire Fraud Containment</h2>
              <ol className="space-y-2 text-xs text-[#131b2e]">
                <li className="flex items-center justify-between rounded-[4px] border border-[#e2e8f0] bg-[#faf8ff] p-3">
                  <span>1. Freeze outbound SWIFT MT103 clearing queue #WT-8841 ($348,200.00 USD)</span>
                  <SeverityTag level="low" label="AUTO-COMPLETED" showIcon />
                </li>
                <li className="flex items-center justify-between rounded-[4px] border border-[#e2e8f0] bg-[#faf8ff] p-3">
                  <span>2. Revoke replayed Okta SSO session tokens for treasury-desk-04</span>
                  <SeverityTag
                    level={countermeasures.tokensRevoked ? 'low' : 'high'}
                    label={countermeasures.tokensRevoked ? 'REVOKED' : 'PENDING'}
                    showIcon
                  />
                </li>
                <li className="flex items-center justify-between rounded-[4px] border border-[#e2e8f0] bg-[#faf8ff] p-3">
                  <span>3. Push DNS sinkhole & firewall block for n0rthstar-sec.link and 185.220.101.5</span>
                  <SeverityTag
                    level={countermeasures.firewallBlocked ? 'low' : 'high'}
                    label={countermeasures.firewallBlocked ? 'ACTIVE' : 'PENDING'}
                    showIcon
                  />
                </li>
                <li className="flex items-center justify-between rounded-[4px] border border-[#e2e8f0] bg-[#faf8ff] p-3">
                  <span>4. Isolate compromised workstation endpoint via EDR containment policy</span>
                  <SeverityTag
                    level={countermeasures.endpointsIsolated ? 'low' : 'medium'}
                    label={countermeasures.endpointsIsolated ? 'ISOLATED' : 'READY'}
                    showIcon
                  />
                </li>
              </ol>
            </section>
          )}
        </div>

        {/* Right 4 cols: Active Countermeasures Panel */}
        <aside className="xl:col-span-4 space-y-4">
          <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2.5">
              <h2 className="text-sm font-semibold text-[#131b2e]">Active Countermeasures</h2>
              <SeverityTag level="low" label="READY" showIcon />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onExecuteCountermeasure('endpointsIsolated')}
                className={`flex w-full items-center justify-between rounded-[4px] border px-3 py-2.5 text-left transition-colors ${
                  countermeasures.endpointsIsolated
                    ? 'border-[#a7f3d0] bg-[#ecfdf5]'
                    : 'border-[#cbd5e1] bg-white hover:border-[#0051d5] hover:bg-[#f2f3ff]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Laptop className={`h-4 w-4 ${countermeasures.endpointsIsolated ? 'text-[#047857]' : 'text-[#00236f]'}`} />
                  <div>
                    <div className="text-xs font-semibold text-[#131b2e]">Isolate Endpoints</div>
                    <div className="text-[11px] text-[#444651]">Host isolation via CrowdStrike EDR</div>
                  </div>
                </div>
                {countermeasures.endpointsIsolated ? (
                  <CheckCircle2 className="h-4 w-4 text-[#047857]" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-[#757682]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onExecuteCountermeasure('tokensRevoked')}
                className={`flex w-full items-center justify-between rounded-[4px] border px-3 py-2.5 text-left transition-colors ${
                  countermeasures.tokensRevoked
                    ? 'border-[#a7f3d0] bg-[#ecfdf5]'
                    : 'border-[#cbd5e1] bg-white hover:border-[#0051d5] hover:bg-[#f2f3ff]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className={`h-4 w-4 ${countermeasures.tokensRevoked ? 'text-[#047857]' : 'text-[#ba1a1a]'}`} />
                  <div>
                    <div className="text-xs font-semibold text-[#131b2e]">Revoke Active Tokens</div>
                    <div className="text-[11px] text-[#444651]">Expire Okta/Azure AD sessions</div>
                  </div>
                </div>
                {countermeasures.tokensRevoked ? (
                  <CheckCircle2 className="h-4 w-4 text-[#047857]" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-[#757682]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onExecuteCountermeasure('firewallBlocked')}
                className={`flex w-full items-center justify-between rounded-[4px] border px-3 py-2.5 text-left transition-colors ${
                  countermeasures.firewallBlocked
                    ? 'border-[#a7f3d0] bg-[#ecfdf5]'
                    : 'border-[#cbd5e1] bg-white hover:border-[#0051d5] hover:bg-[#f2f3ff]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Ban className={`h-4 w-4 ${countermeasures.firewallBlocked ? 'text-[#047857]' : 'text-[#c2410c]'}`} />
                  <div>
                    <div className="text-xs font-semibold text-[#131b2e]">Push Firewall Block</div>
                    <div className="text-[11px] text-[#444651]">Palo Alto DNS Sinkhole + IP Drop</div>
                  </div>
                </div>
                {countermeasures.firewallBlocked ? (
                  <CheckCircle2 className="h-4 w-4 text-[#047857]" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-[#757682]" />
                )}
              </button>
            </div>
          </section>

          <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.04em] text-[#444651]">Financial Exposure</h3>
            <div className="font-mono text-2xl font-bold text-[#131b2e] tabular-nums">
              {incident.atRiskAmount ?? '$0.00 USD'}
            </div>
            <p className="text-xs text-[#047857] font-medium">
              Clearing house hold enforced in 184ms. Net realized loss: $0.00 USD.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
