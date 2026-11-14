import { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { EXPORT_TEMPLATES, INITIAL_LAB_ARTIFACTS } from '../data/sentinelData';
import { ForensicInspectionTarget, LabEvidenceArtifact, SeverityLevel } from '../types/sentinel';
import { SeverityTag } from '../components/SeverityTag';
import { copyToClipboard, triggerFileDownload } from '../utils/exportHelpers';

interface EvidenceLabViewProps {
  artifacts: LabEvidenceArtifact[];
  onAddArtifact: (artifact: LabEvidenceArtifact) => void;
  onToggleHold: (artifactId: string) => void;
  onClearArtifacts: () => void;
  onResetArtifacts: () => void;
  onInspect: (target: ForensicInspectionTarget) => void;
  onRecordAudit: (eventType: string, surface: string, description: string) => void;
}

export function EvidenceLabView({
  artifacts,
  onAddArtifact,
  onToggleHold,
  onClearArtifacts,
  onResetArtifacts,
  onInspect,
  onRecordAudit,
}: EvidenceLabViewProps) {
  const [streamPaused, setStreamPaused] = useState(false);
  const [submitMode, setSubmitMode] = useState<'url' | 'sms' | 'tx'>('url');
  const [inputPayload, setInputPayload] = useState('https://n0rthstar-sec.link/auth?t=8841');
  const [severityFilter, setSeverityFilter] = useState<'all' | SeverityLevel>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'SMS' | 'Domains' | 'Telephony' | 'Transactions'>('all');
  const [expandedTraceId, setExpandedTraceId] = useState<string>('EVI-2024-9101');
  const [activeExportKey, setActiveExportKey] = useState<keyof typeof EXPORT_TEMPLATES | null>(null);
  const [copiedExport, setCopiedExport] = useState(false);

  const filteredArtifacts = useMemo(() => {
    return artifacts.filter((a) => {
      const sevOk = severityFilter === 'all' || a.severity === severityFilter;
      const typeOk = typeFilter === 'all' || a.sourceType === typeFilter;
      return sevOk && typeOk;
    });
  }, [artifacts, severityFilter, typeFilter]);

  const handleLoadSample = () => {
    if (submitMode === 'url') {
      setInputPayload('https://n0rthstar-verify.com/sso/login?redirect=mt103');
    } else if (submitMode === 'sms') {
      setInputPayload(
        'SENDER="N-STAR-ALERT" | "Urgent: Wire #WT-8841 ($348,200) pending freeze. Confirm via https://n0rthstar-sec.link/auth"'
      );
    } else {
      setInputPayload('MT103 :20:WT-8841 :32A:240417USD348200,00 :59:APEX HOLDINGS ZURICH CH9300762011623852931');
    }
  };

  const handleAnalyzeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputPayload.trim();
    if (!val) return;
    const isSuspicious = /n0rthstar|evil|348|8841|urgent|verify|exfil|ch93/i.test(val);
    const id = `EVI-2024-${Math.floor(9200 + Math.random() * 700)}`;
    const nowUtc = new Date().toISOString().slice(11, 19) + ' UTC';
    const sourceType: LabEvidenceArtifact['sourceType'] =
      submitMode === 'url' ? 'Domains' : submitMode === 'sms' ? 'SMS' : 'Transactions';

    const created: LabEvidenceArtifact = {
      id,
      timestamp: nowUtc,
      severity: isSuspicious ? 'critical' : 'medium',
      sourceType,
      channelLabel: submitMode === 'url' ? 'URL-SANDBOX' : submitMode === 'sms' ? 'SMS-SMPP' : 'SWIFT MT103',
      headline: val.slice(0, 88),
      subheadline: isSuspicious
        ? 'Automated Heuristics: Homoglyph / Financial Lure Correlation Match (Confidence 97.4%).'
        : 'Submitted via Lab Submission Engine — Baseline telemetry parsed in 168ms.',
      metrics: [
        { label: 'Parser Latency', value: '168ms', tone: 'neutral' },
        { label: 'Domain/NLP Risk', value: isSuspicious ? '97.4% Malicious' : '42% Review', tone: isSuspicious ? 'danger' : 'warn' },
        { label: 'Action', value: isSuspicious ? 'SINKHOLE RECOMMENDED' : 'ENRICHED', tone: isSuspicious ? 'danger' : 'neutral' },
      ],
      rawTraceTitle: 'PARSED LAB PAYLOAD TRACE',
      rawTraceLines: [
        `ingest_pipeline: ${sourceType.toUpperCase()}`,
        `raw_input: ${val}`,
        `deobfuscation: AUTO_HEX_URI_NORMALIZED`,
        `correlation_campaign: INC-2024-8841`,
      ],
      holdEnforced: submitMode === 'tx' ? true : undefined,
      iocCount: isSuspicious ? 3 : 1,
    };

    onAddArtifact(created);
    setExpandedTraceId(id);
    onRecordAudit('LAB INGESTION', 'Evidence Lab', `Analyzed & correlated ${sourceType} artifact ${id}.`);
  };

  const handleCopyTemplate = async (key: keyof typeof EXPORT_TEMPLATES) => {
    const ok = await copyToClipboard(EXPORT_TEMPLATES[key].content);
    if (ok) {
      setCopiedExport(true);
      setTimeout(() => setCopiedExport(false), 1500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stream Status Header */}
      <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#00236f]">STREAM://SENTINEL-INGEST-P09</span>
              <SeverityTag
                level={streamPaused ? 'medium' : 'low'}
                label={streamPaused ? 'STREAM PAUSED' : 'INGEST ACTIVE · 180MS LATENCY'}
                showIcon
              />
            </div>
            <h1 className="text-lg font-bold text-[#131b2e]">Evidence Ingestion &amp; Forensic Lab</h1>
            <p className="text-xs text-[#444651]">
              Supported Parsers: <span className="font-mono">SMS/SMPP · RFC 5322 EML · URL URI-HEX · SWIFT MT103 · ISO 20022 JSON</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStreamPaused((p) => !p)}
              className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-[#cbd5e1] bg-white px-3 text-xs font-semibold text-[#131b2e] hover:bg-[#f2f3ff]"
            >
              {streamPaused ? <Play className="h-3.5 w-3.5 text-[#047857]" /> : <Pause className="h-3.5 w-3.5 text-[#b45309]" />}
              <span>{streamPaused ? 'Resume' : 'Pause'}</span>
            </button>
            <button
              type="button"
              onClick={artifacts.length > 0 ? onClearArtifacts : onResetArtifacts}
              className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-[#cbd5e1] bg-white px-3 text-xs font-semibold text-[#131b2e] hover:bg-[#f2f3ff]"
            >
              {artifacts.length > 0 ? <Trash2 className="h-3.5 w-3.5 text-[#ba1a1a]" /> : <RotateCcw className="h-3.5 w-3.5 text-[#00236f]" />}
              <span>{artifacts.length > 0 ? 'Clear Ledger' : 'Restore Samples'}</span>
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Left 4 cols: Lab Submission Engine + Export */}
        <div className="xl:col-span-4 space-y-4">
          <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#131b2e]">Lab Submission Engine</h2>
              <span className="font-mono text-[11px] text-[#047857]">DEOBFUSCATE: ON</span>
            </div>

            <div className="grid grid-cols-3 gap-1 rounded-[4px] bg-[#f2f3ff] p-1">
              {(
                [
                  { id: 'url', label: 'URL Scanner' },
                  { id: 'sms', label: 'SMS / EML' },
                  { id: 'tx', label: 'Transaction' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSubmitMode(m.id)}
                  className={`rounded-[3px] px-2 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    submitMode === m.id ? 'bg-white text-[#00236f] shadow-xs' : 'text-[#444651] hover:text-[#131b2e]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleAnalyzeSubmit} className="space-y-2.5">
              <label className="block text-xs font-medium text-[#444651]">
                Target URL / Raw Telemetry Payload
                <textarea
                  rows={3}
                  value={inputPayload}
                  onChange={(e) => setInputPayload(e.target.value)}
                  className="mt-1 w-full rounded-[4px] border border-[#cbd5e1] bg-[#f8fafc] p-2.5 font-mono text-xs text-[#131b2e] focus:border-[#0051d5] focus:outline-none"
                  placeholder="Paste URL, SMPP header, or SWIFT MT103 block..."
                />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex h-8 flex-1 items-center justify-center rounded-[4px] border border-[#cbd5e1] bg-white px-2.5 text-xs font-semibold text-[#131b2e] hover:bg-[#f2f3ff] whitespace-nowrap"
                >
                  Load Northstar Sample
                </button>
                <button
                  type="submit"
                  className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[4px] bg-[#00236f] px-3 text-xs font-semibold text-white hover:bg-[#1e3a8a] whitespace-nowrap"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Analyze &amp; Correlate</span>
                </button>
              </div>
            </form>
          </section>

          {/* External Threat Sharing & Export */}
          <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#131b2e]">External Threat Sharing &amp; Export</h2>
              <span className="font-mono text-[11px] text-[#00236f]">TAXII 2.1</span>
            </div>
            <p className="text-xs text-[#444651]">
              Package validated telemetry tokens and network heuristics for FS-ISAC, CISA, or SIEM/EDR ingestion.
            </p>

            <div className="space-y-1.5">
              {(
                [
                  { key: 'stix', label: 'STIX 2.1 Bundle JSON (TAXII Ready)', icon: Download },
                  { key: 'cisa', label: 'CISA Incident Dossier Summary', icon: FileText },
                  { key: 'splunk', label: 'Splunk Query SPL Search String', icon: Code2 },
                  { key: 'snort', label: 'Snort / Suricata NIDS Rule Block', icon: Code2 },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                const isActive = activeExportKey === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveExportKey(isActive ? null : item.key)}
                    className={`flex w-full items-center justify-between rounded-[4px] border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                      isActive ? 'border-[#0051d5] bg-[#f2f3ff] text-[#00236f]' : 'border-[#cbd5e1] bg-white text-[#131b2e] hover:bg-[#faf8ff]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                  </button>
                );
              })}
            </div>

            {activeExportKey && (
              <div className="rounded-[4px] border border-[#cbd5e1] bg-[#131b2e] p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#b6c4ff]">
                  <span className="truncate font-mono">{EXPORT_TEMPLATES[activeExportKey].filename}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyTemplate(activeExportKey)}
                      className="inline-flex items-center gap-1 text-slate-200 hover:text-white"
                    >
                      {copiedExport ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedExport ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerFileDownload(
                          EXPORT_TEMPLATES[activeExportKey].filename,
                          EXPORT_TEMPLATES[activeExportKey].content
                        );
                        onRecordAudit('THREAT SHARE EXPORT', 'Evidence Lab', `Downloaded ${EXPORT_TEMPLATES[activeExportKey].filename}`);
                      }}
                      className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                <pre className="max-h-36 overflow-auto font-mono text-[11px] text-[#eef0ff] whitespace-pre-wrap">
                  {EXPORT_TEMPLATES[activeExportKey].content}
                </pre>
              </div>
            )}

            <div className="border-t border-[#e2e8f0] pt-2 font-mono text-[11px] text-[#444651]">
              FS-ISAC INTEL RELAY (NODE-US-EAST) · GPG: 0x9B41E1
            </div>
          </section>
        </div>

        {/* Right 8 cols: Ingested Evidence Ledger */}
        <section className="xl:col-span-8 rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0] pb-3">
            <div>
              <h2 className="text-sm font-semibold text-[#131b2e]">Ingested Evidence Ledger ({filteredArtifacts.length})</h2>
              <p className="text-xs text-[#444651]">Poll Rate: 1.2s · Click traces to inspect raw SMPP, DOM, or MT103 fields</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-[4px] bg-[#f2f3ff] p-1">
                {(['all', 'critical', 'high', 'medium'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverityFilter(sev)}
                    className={`rounded-[3px] px-2 py-1 text-xs font-medium capitalize transition-colors ${
                      severityFilter === sev ? 'bg-white text-[#00236f] shadow-xs' : 'text-[#444651] hover:text-[#131b2e]'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                aria-label="Filter evidence source type"
                className="h-8 rounded-[4px] border border-[#cbd5e1] bg-white px-2.5 text-xs font-medium text-[#131b2e]"
              >
                <option value="all">All Sources</option>
                <option value="SMS">SMS</option>
                <option value="Domains">Domains</option>
                <option value="Telephony">Telephony</option>
                <option value="Transactions">Transactions</option>
              </select>
            </div>
          </div>

          {filteredArtifacts.length === 0 ? (
            <div className="rounded-[6px] border border-dashed border-[#cbd5e1] bg-[#faf8ff] p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-[#131b2e]">No evidence artifacts match the active filter</p>
              <p className="text-xs text-[#444651]">Submit a payload in the Lab Submission Engine or restore the default Northstar forensic ledger.</p>
              <button
                type="button"
                onClick={() => {
                  setSeverityFilter('all');
                  setTypeFilter('all');
                  if (artifacts.length === 0) onResetArtifacts();
                }}
                className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-[4px] bg-[#00236f] px-3 text-xs font-semibold text-white hover:bg-[#1e3a8a]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restore Default Artifacts</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredArtifacts.map((art) => {
                const isExpanded = expandedTraceId === art.id;
                return (
                  <article key={art.id} className="rounded-[6px] border border-[#e2e8f0] bg-[#faf8ff] p-4 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityTag level={art.severity} showIcon />
                        <span className="font-mono text-xs font-bold text-[#00236f]">{art.id}</span>
                        <span className="font-mono text-xs text-[#757682]">{art.timestamp}</span>
                        <span className="rounded-[3px] border border-[#cbd5e1] bg-white px-1.5 py-0.5 font-mono text-[11px] font-medium text-[#131b2e]">
                          {art.channelLabel}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[#444651]">IoCs Extracted: {art.iocCount}</span>
                    </div>

                    <div>
                      <h3 className="font-mono text-xs font-semibold text-[#131b2e] break-all">{art.headline}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#444651]">{art.subheadline}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {art.metrics.map((m) => (
                        <div key={m.label} className="rounded-[4px] border border-[#e2e8f0] bg-white px-2.5 py-2">
                          <div className="text-[11px] text-[#757682]">{m.label}</div>
                          <div
                            className={`mt-0.5 font-mono text-xs font-semibold ${
                              m.tone === 'danger'
                                ? 'text-[#ba1a1a]'
                                : m.tone === 'warn'
                                ? 'text-[#b45309]'
                                : 'text-[#131b2e]'
                            }`}
                          >
                            {m.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setExpandedTraceId(isExpanded ? '' : art.id)}
                        className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-[#cbd5e1] bg-white px-2.5 text-xs font-semibold text-[#131b2e] hover:bg-[#f2f3ff]"
                      >
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        <span>{isExpanded ? 'Hide Raw Trace' : 'Inspect Raw Trace'}</span>
                      </button>

                      <div className="flex flex-wrap items-center gap-2">
                        {art.vtScore && (
                          <button
                            type="button"
                            onClick={() =>
                              onInspect({
                                id: art.id,
                                title: `VirusTotal Enrichment — ${art.vtScore} Malicious`,
                                subtitle: art.headline,
                                severity: art.severity,
                                category: 'THREAT INTEL PIVOT',
                                properties: {
                                  'VT Detection Ratio': art.vtScore ?? 'N/A',
                                  'Artifact ID': art.id,
                                  Channel: art.channelLabel,
                                },
                                rawJson: art,
                                recommendedAction: { label: 'Sinkhole Domain Globally', actionKey: 'block_domain' },
                              })
                            }
                            className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-[#cbd5e1] bg-white px-2.5 text-xs font-semibold text-[#0051d5] hover:bg-[#f2f3ff]"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Pivot VirusTotal ({art.vtScore})</span>
                          </button>
                        )}
                        {art.holdEnforced !== undefined && (
                          <button
                            type="button"
                            onClick={() => onToggleHold(art.id)}
                            className={`inline-flex h-8 items-center gap-1.5 rounded-[4px] px-3 text-xs font-semibold transition-colors ${
                              art.holdEnforced
                                ? 'border border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]'
                                : 'bg-[#ba1a1a] text-white hover:bg-[#93000a]'
                            }`}
                          >
                            <Lock className="h-3.5 w-3.5" />
                            <span>{art.holdEnforced ? 'Hard Freeze Active' : 'Enforce Hold'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="rounded-[4px] border border-[#e2e8f0] bg-[#131b2e] p-3">
                        <div className="mb-1.5 font-mono text-[11px] font-semibold text-[#b6c4ff]">{art.rawTraceTitle}</div>
                        <div className="space-y-0.5 font-mono text-[11px] text-[#eef0ff]">
                          {art.rawTraceLines.map((line, idx) => (
                            <div key={idx}>{line}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
