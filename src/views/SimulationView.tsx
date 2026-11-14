import { useEffect, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Square,
} from 'lucide-react';
import { SIMULATION_ENTITIES, SIMULATION_STAGES } from '../data/sentinelData';
import { ForensicInspectionTarget } from '../types/sentinel';
import { SeverityTag } from '../components/SeverityTag';
import { copyToClipboard } from '../utils/exportHelpers';

interface SimulationViewProps {
  onInspect: (target: ForensicInspectionTarget) => void;
  onRecordAudit: (eventType: string, surface: string, description: string) => void;
}

export function SimulationView({ onInspect, onRecordAudit }: SimulationViewProps) {
  const [activeStageCount, setActiveStageCount] = useState<number>(4);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<1 | 2 | 5>(1);
  const [expandedStage, setExpandedStage] = useState<number>(1);
  const [subTab, setSubTab] = useState<'stream' | 'iocs' | 'heuristics'>('stream');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = speed === 5 ? 600 : speed === 2 ? 1100 : 1800;
    const timer = setInterval(() => {
      setActiveStageCount((prev) => {
        if (prev >= 4) {
          setIsPlaying(false);
          return 4;
        }
        const next = prev + 1;
        setExpandedStage(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  const currentStage = SIMULATION_STAGES[Math.max(0, activeStageCount - 1)];
  const currentRisk = activeStageCount === 0 ? 0 : currentStage.riskScoreAtStage;

  const handlePlay = () => {
    if (activeStageCount >= 4) {
      setActiveStageCount(1);
      setExpandedStage(1);
    }
    setIsPlaying(true);
    onRecordAudit('SIMULATION RUN', 'Simulation Centre', `Started Scenario N-8841 playback at ${speed}x speed.`);
  };

  const handleReplay = () => {
    setActiveStageCount(1);
    setExpandedStage(1);
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setActiveStageCount(4);
  };

  const handleCopy = async (id: string, value: string) => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sandbox Banner + Playback Transport */}
      <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#00236f]">SCENARIO: N-8841</span>
              <SeverityTag level="low" label="CONTAINED · ISOLATED SANDBOX" showIcon />
              <span className="font-mono text-xs text-[#444651]">TTP: FIN-4820</span>
            </div>
            <h1 className="text-lg font-bold text-[#131b2e]">Live Attack Simulation Centre</h1>
            <p className="text-xs text-[#444651]">
              All network payloads, SMS triggers, and SWIFT wire telemetry in this sandbox are synthetic and isolated from production routing.
            </p>
          </div>

          {/* KPI Summary Strip */}
          <div className="flex items-center gap-4 rounded-[6px] border border-[#e2e8f0] bg-[#faf8ff] px-3 py-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#444651]">Risk Score</div>
              <div className="font-mono text-lg font-bold text-[#ba1a1a] tabular-nums">{currentRisk}/100</div>
            </div>
            <div className="h-8 w-px bg-[#e2e8f0]" />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#444651]">Synthesized</div>
              <div className="font-mono text-lg font-bold text-[#131b2e] tabular-nums">{activeStageCount}/4</div>
            </div>
            <div className="h-8 w-px bg-[#e2e8f0]" />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#444651]">IoC Nodes</div>
              <div className="font-mono text-lg font-bold text-[#00236f] tabular-nums">{SIMULATION_ENTITIES.length}</div>
            </div>
          </div>
        </div>

        {/* Playback Controls + Timeline Scrubber */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-[#cbd5e1] bg-[#f8fafc] p-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={isPlaying ? () => setIsPlaying(false) : handlePlay}
              className="inline-flex h-8 items-center gap-1.5 rounded-[4px] bg-[#00236f] px-3 text-xs font-semibold text-white hover:bg-[#1e3a8a]"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-[#cbd5e1] bg-white px-2.5 text-xs font-semibold text-[#131b2e] hover:bg-[#f2f3ff]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Replay</span>
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-[#cbd5e1] bg-white px-2.5 text-xs font-semibold text-[#131b2e] hover:bg-[#f2f3ff]"
            >
              <Square className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Interactive Timeline Stepper */}
          <div className="flex flex-1 items-center gap-2 min-w-[220px] max-w-md px-2">
            <span className="font-mono text-[11px] text-[#444651] shrink-0">T+00:00</span>
            <input
              type="range"
              min={1}
              max={4}
              value={activeStageCount}
              onChange={(e) => {
                const val = Number(e.target.value);
                setIsPlaying(false);
                setActiveStageCount(val);
                setExpandedStage(val);
              }}
              aria-label="Simulation timeline stage"
              className="w-full accent-[#00236f] cursor-pointer"
            />
            <span className="font-mono text-[11px] text-[#047857] shrink-0">T+13:00 (Blocked)</span>
          </div>

          <div className="flex items-center gap-1 rounded-[4px] border border-[#cbd5e1] bg-white p-0.5">
            {([1, 2, 5] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={`rounded-[3px] px-2 py-1 font-mono text-xs font-semibold transition-colors ${
                  speed === s ? 'bg-[#00236f] text-white' : 'text-[#444651] hover:bg-[#f2f3ff]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="mt-3 flex flex-wrap gap-1">
          {(
            [
              { id: 'stream', label: `Event Stream (${activeStageCount})` },
              { id: 'iocs', label: `Synthetic IoCs (${SIMULATION_ENTITIES.length})` },
              { id: 'heuristics', label: 'Active Heuristics' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`rounded-[4px] px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                subTab === t.id
                  ? 'bg-[#00236f] text-white'
                  : 'bg-[#f2f3ff] text-[#444651] hover:bg-[#e2e7ff]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Simulation Content */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8 space-y-3">
          {subTab === 'stream' &&
            SIMULATION_STAGES.slice(0, activeStageCount).map((stage) => {
              const isOpen = expandedStage === stage.stage;
              return (
                <article
                  key={stage.stage}
                  className={`rounded-[8px] border bg-white transition-colors ${
                    isOpen ? 'border-[#0051d5]' : 'border-[#e2e8f0]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedStage(isOpen ? 0 : stage.stage)}
                    className="flex w-full items-start justify-between gap-3 p-4 text-left"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#00236f]">STAGE {stage.stage}</span>
                        <span className="font-mono text-xs text-[#757682] tabular-nums">{stage.timeLabel}</span>
                        <SeverityTag level={stage.severity} label={stage.badgeText} showIcon />
                      </div>
                      <h3 className="text-sm font-semibold text-[#131b2e]">{stage.title}</h3>
                      <p className="font-mono text-xs text-[#444651] break-words">{stage.headline}</p>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-[#444651] shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#444651] shrink-0 mt-1" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t border-[#e2e8f0] bg-[#faf8ff] p-4 space-y-3">
                      <div className="text-xs font-semibold text-[#444651]">{stage.summary}</div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {Object.entries(stage.metadata).map(([k, v]) => (
                          <div key={k} className="rounded-[4px] border border-[#e2e8f0] bg-white px-3 py-2">
                            <div className="text-[11px] font-medium text-[#757682]">{k}</div>
                            <div className="mt-0.5 font-mono text-xs font-medium text-[#131b2e] break-all">{v}</div>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-[4px] border border-[#e2e8f0] bg-[#131b2e] p-3">
                        <div className="flex items-center justify-between text-[11px] text-[#b6c4ff] mb-1.5">
                          <span>RAW SYNTHESIZED PACKET PAYLOAD</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(`stage-${stage.stage}`, stage.rawPayload)}
                            className="inline-flex items-center gap-1 text-slate-300 hover:text-white"
                          >
                            {copiedId === `stage-${stage.stage}` ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            <span>{copiedId === `stage-${stage.stage}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="overflow-x-auto font-mono text-[11px] text-[#eef0ff] whitespace-pre-wrap">
                          {stage.rawPayload}
                        </pre>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}

          {subTab === 'iocs' && (
            <div className="rounded-[8px] border border-[#e2e8f0] bg-white divide-y divide-[#e2e8f0]">
              {SIMULATION_ENTITIES.map((ent) => (
                <div key={ent.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <SeverityTag level={ent.severity} label={ent.category} />
                      <span className="font-mono text-xs font-bold text-[#131b2e]">{ent.identifier}</span>
                    </div>
                    <div className="text-xs text-[#444651]">{ent.role} — {ent.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(ent.id, ent.identifier)}
                      className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-[#cbd5e1] px-2.5 text-xs font-medium text-[#131b2e] hover:bg-[#f2f3ff]"
                    >
                      {copiedId === ent.id ? <Check className="h-3.5 w-3.5 text-[#047857]" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedId === ent.id ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onInspect({
                          id: ent.id,
                          title: ent.identifier,
                          subtitle: ent.description,
                          severity: ent.severity,
                          category: ent.category,
                          properties: {
                            Identifier: ent.identifier,
                            Role: ent.role,
                            Classification: ent.category,
                          },
                          rawJson: ent,
                          recommendedAction: { label: 'Quarantine Entity', actionKey: 'block_domain' },
                        })
                      }
                      className="inline-flex h-8 items-center rounded-[4px] bg-[#00236f] px-3 text-xs font-semibold text-white hover:bg-[#1e3a8a]"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {subTab === 'heuristics' && (
            <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-3">
              <h2 className="text-sm font-semibold text-[#131b2e]">Active Correlation Heuristics</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { name: 'Levenshtein Homoglyph Engine', status: 'Triggered (Dist = 1)', level: 'critical' as const },
                  { name: 'STIR/SHAKEN SIP Attestation', status: 'Validation Failed', level: 'high' as const },
                  { name: 'Okta Session Cookie Replay Guard', status: 'IP Mismatch Detected', level: 'high' as const },
                  { name: 'SWIFT Velocity Rule FRAUD-09', status: '+480% Anomaly · Held', level: 'low' as const },
                ].map((h) => (
                  <div key={h.name} className="rounded-[4px] border border-[#e2e8f0] bg-[#faf8ff] p-3">
                    <div className="text-xs font-semibold text-[#131b2e]">{h.name}</div>
                    <div className="mt-1.5">
                      <SeverityTag level={h.level} label={h.status} showIcon />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 4 cols: Extracted Entities Summary */}
        <aside className="xl:col-span-4 space-y-4">
          <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#131b2e]">Multi-Vector Correlation Engine</h2>
              <ShieldCheck className="h-4 w-4 text-[#047857]" />
            </div>
            <p className="text-xs leading-relaxed text-[#444651]">
              Chains an SMS smishing lure, a typosquatted EvilProxy domain, and an executive persona spoof to isolate dual-custody wire bypass attempts in 184ms.
            </p>
          </section>

          <section className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-2.5">
            <h2 className="text-sm font-semibold text-[#131b2e]">Extracted Simulation Entities (6)</h2>
            <div className="space-y-2">
              {SIMULATION_ENTITIES.map((ent) => (
                <button
                  key={ent.id}
                  type="button"
                  onClick={() =>
                    onInspect({
                      id: ent.id,
                      title: ent.identifier,
                      subtitle: ent.description,
                      severity: ent.severity,
                      category: ent.category,
                      properties: {
                        Identifier: ent.identifier,
                        Role: ent.role,
                        Category: ent.category,
                      },
                      rawJson: ent,
                    })
                  }
                  className="flex w-full items-start justify-between gap-2 rounded-[4px] border border-[#e2e8f0] bg-[#faf8ff] p-2.5 text-left transition-colors hover:border-[#0051d5] hover:bg-[#f2f3ff]"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-semibold text-[#131b2e] truncate">{ent.identifier}</div>
                    <div className="text-[11px] text-[#444651] truncate">{ent.role}</div>
                  </div>
                  <SeverityTag level={ent.severity} label={ent.category} />
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
