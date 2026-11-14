import { useMemo, useState } from 'react';
import {
  Activity,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Network,
  PlayCircle,
  Search,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import {
  EXPORT_TEMPLATES,
  INCIDENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_LAB_ARTIFACTS,
  INITIAL_TELEMETRY_STREAM,
} from './data/sentinelData';
import {
  AuditLogEntry,
  ForensicInspectionTarget,
  LabEvidenceArtifact,
  ViewId,
} from './types/sentinel';
import { OverviewView } from './views/OverviewView';
import { CaseDossierView } from './views/CaseDossierView';
import { SimulationView } from './views/SimulationView';
import { ThreatGraphView } from './views/ThreatGraphView';
import { EvidenceLabView } from './views/EvidenceLabView';
import { AuditComplianceView } from './views/AuditComplianceView';
import { ForensicDrawer } from './components/ForensicDrawer';
import { triggerFileDownload } from './utils/exportHelpers';
import { LandingPage } from './views/LandingPage';
import { LoginPage } from './views/LoginPage';

type AppPage = 'landing' | 'login' | 'dashboard';

const NAV_ITEMS: { id: ViewId; label: string; shortLabel: string; breadcrumb: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Security Overview', shortLabel: 'Overview', breadcrumb: 'Security Overview', icon: LayoutDashboard },
  { id: 'cases', label: 'Case Dossier', shortLabel: 'Cases', breadcrumb: 'Investigation Management', icon: Shield },
  { id: 'simulation', label: 'Live Simulation', shortLabel: 'Simulation', breadcrumb: 'Live Simulation Centre', icon: PlayCircle },
  { id: 'graph', label: 'Threat Graph', shortLabel: 'Graph', breadcrumb: 'Threat Graph & Timeline', icon: Network },
  { id: 'lab', label: 'Evidence Lab', shortLabel: 'Lab', breadcrumb: 'Evidence Ingestion Lab', icon: FlaskConical },
  { id: 'audit', label: 'Audit & Compliance', shortLabel: 'Audit', breadcrumb: 'Audit & Compliance', icon: ShieldCheck },
];

export default function App() {
  const [appPage, setAppPage] = useState<AppPage>('landing');
  const [activeView, setActiveView] = useState<ViewId>('overview');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-2024-8841');
  const [labArtifacts, setLabArtifacts] = useState<LabEvidenceArtifact[]>(INITIAL_LAB_ARTIFACTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [inspectionTarget, setInspectionTarget] = useState<ForensicInspectionTarget | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [countermeasures, setCountermeasures] = useState({
    endpointsIsolated: false,
    tokensRevoked: false,
    firewallBlocked: true,
  });

  const activeIncident = useMemo(
    () => INCIDENTS.find((i) => i.id === selectedIncidentId) ?? INCIDENTS[0],
    [selectedIncidentId]
  );

  const activeNavMeta = useMemo(
    () => NAV_ITEMS.find((n) => n.id === activeView) ?? NAV_ITEMS[0],
    [activeView]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const recordAudit = (
    eventType: string,
    surface: string,
    description: string,
    severity: AuditLogEntry['severity'] = 'info'
  ) => {
    const nowUtc = new Date().toISOString().slice(11, 19) + ' UTC';
    const hash = Math.floor(0x1000 + Math.random() * 0xefff).toString(16);
    const entry: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: nowUtc,
      eventType,
      sigHash: `SIG#${hash}`,
      actor: 'S_JENSEN (Lead)',
      actorKey: 'sarah',
      surface,
      description,
      severity,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  const handleExecuteCountermeasure = (key: 'endpointsIsolated' | 'tokensRevoked' | 'firewallBlocked') => {
    setCountermeasures((prev) => {
      const nextVal = !prev[key];
      const labels: Record<typeof key, string> = {
        endpointsIsolated: nextVal ? 'Endpoint host isolation enforced via EDR.' : 'Endpoint isolation lifted.',
        tokensRevoked: nextVal ? 'All active Okta/Azure AD session tokens revoked.' : 'Session token revocation reset.',
        firewallBlocked: nextVal ? 'Palo Alto DNS Sinkhole pushed for n0rthstar-sec.link.' : 'DNS Sinkhole policy suspended.',
      };
      recordAudit('COUNTERMEASURE', 'Case Dossier', labels[key], nextVal ? 'low' : 'medium');
      showToast(labels[key]);
      return { ...prev, [key]: nextVal };
    });
  };

  const handleDrawerAction = (
    actionKey: 'revoke_token' | 'block_domain' | 'enforce_hold' | 'isolate_host',
    label: string
  ) => {
    if (actionKey === 'revoke_token') {
      setCountermeasures((p) => ({ ...p, tokensRevoked: true }));
    } else if (actionKey === 'block_domain') {
      setCountermeasures((p) => ({ ...p, firewallBlocked: true }));
    } else if (actionKey === 'isolate_host') {
      setCountermeasures((p) => ({ ...p, endpointsIsolated: true }));
    }
    recordAudit('INSPECTOR ACTION', 'Forensic Drawer', `Executed "${label}" on active indicator.`, 'high');
    showToast(`${label} executed and sealed to audit ledger.`);
  };

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = globalSearch.trim().toLowerCase();
    if (!q) return;

    const matchedInc = INCIDENTS.find(
      (i) => i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q) || (i.domainIoc?.toLowerCase().includes(q) ?? false)
    );
    if (matchedInc) {
      setSelectedIncidentId(matchedInc.id);
      setActiveView('cases');
      showToast(`Opened Case Dossier ${matchedInc.id}`);
      return;
    }

    const matchedArt = labArtifacts.find(
      (a) => a.id.toLowerCase().includes(q) || a.headline.toLowerCase().includes(q) || a.subheadline.toLowerCase().includes(q)
    );
    if (matchedArt) {
      setActiveView('lab');
      showToast(`Filtered Evidence Lab for "${globalSearch.trim()}"`);
      return;
    }

    if (q.includes('sim') || q.includes('stage')) {
      setActiveView('simulation');
      return;
    }
    if (q.includes('graph') || q.includes('apex') || q.includes('185.220')) {
      setActiveView('graph');
      return;
    }
    if (q.includes('audit') || q.includes('soc2') || q.includes('virustotal')) {
      setActiveView('audit');
      return;
    }

    setInspectionTarget({
      id: 'IOC-LOOKUP',
      title: globalSearch.trim(),
      subtitle: 'On-demand global telemetry lookup across SENTINEL active buffers',
      severity: 'info',
      category: 'GLOBAL IOC LOOKUP',
      properties: {
        Query: globalSearch.trim(),
        'Matched Scenario': 'SCENARIO: N-8841',
        'Campaign Scope': 'INC-2024-8841',
        Disposition: 'Correlated with Northstar Treasury Campaign',
      },
      rawJson: { query: globalSearch.trim(), scenario: 'N-8841', matched: true },
    });
  };

  const handleToggleHold = (artifactId: string) => {
    setLabArtifacts((prev) =>
      prev.map((art) => {
        if (art.id !== artifactId) return art;
        const nextHold = !art.holdEnforced;
        recordAudit(
          'WIRE HOLD TOGGLE',
          'Evidence Lab',
          `${nextHold ? 'Enforced hard freeze' : 'Released hold'} on ${artifactId}.`,
          nextHold ? 'critical' : 'medium'
        );
        showToast(nextHold ? `Hard freeze enforced on ${artifactId}` : `Hold released on ${artifactId}`);
        return { ...art, holdEnforced: nextHold };
      })
    );
  };

  if (appPage === 'landing') return <LandingPage onGetStarted={() => setAppPage('login')} />;
  if (appPage === 'login') return <LoginPage onLoginSuccess={() => setAppPage('dashboard')} onBackToHome={() => setAppPage('landing')} />;

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col lg:flex-row">
      {/* Desktop Left Navigation Sidebar (240px) */}
      <aside className="hidden lg:flex lg:w-[240px] lg:shrink-0 lg:flex-col lg:border-r lg:border-[#e2e8f0] lg:bg-white lg:sticky lg:top-0 lg:h-screen">
        <div className="flex h-14 items-center border-b border-[#e2e8f0] px-5">
          <button
            type="button"
            onClick={() => setActiveView('overview')}
            className="text-base font-bold tracking-tight text-[#00236f] whitespace-nowrap"
          >
            SENTINEL
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3" aria-label="Primary SOC navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-[4px] px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#00236f] text-white'
                    : 'text-[#444651] hover:bg-[#f2f3ff] hover:text-[#131b2e]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[#e2e8f0] p-3 space-y-2.5">
          <div className="rounded-[6px] border border-[#e2e8f0] bg-[#faf8ff] p-3 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#00236f]">
              <span>ACTIVE SCENARIO</span>
              <span className="font-mono">N-8841</span>
            </div>
            <div className="font-mono text-xs font-bold text-[#131b2e]">{activeIncident.id}</div>
            <div className="text-[11px] text-[#444651]">Northstar Treasury BEC</div>
          </div>

          <div className="flex items-center justify-between px-1 text-xs">
            <div className="min-w-0">
              <div className="font-semibold text-[#131b2e] truncate">Sarah Jensen</div>
              <div className="text-[11px] text-[#444651]">CTI Lead · Alpha Team</div>
            </div>
            <Activity className="h-4 w-4 text-[#047857] shrink-0" aria-hidden="true" />
          </div>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        {/* Top Bar (3 zones, clean single row) */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-[#e2e8f0] bg-white/95 px-4 backdrop-blur-sm lg:px-6">
          {/* Zone 1: Brand on mobile + Breadcrumb on desktop */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setActiveView('overview')}
              className="lg:hidden text-base font-bold tracking-tight text-[#00236f] whitespace-nowrap shrink-0"
            >
              SENTINEL
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#444651] truncate">
              <span className="font-mono text-[#757682]">SOC</span>
              <span aria-hidden="true">/</span>
              <span className="font-mono text-[#757682]">N-8841</span>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-[#131b2e] truncate">{activeNavMeta.breadcrumb}</span>
            </div>
          </div>

          {/* Zone 2: Global Search */}
          <form onSubmit={handleGlobalSearchSubmit} className="hidden md:flex flex-1 max-w-md items-center gap-2 rounded-[4px] border border-[#cbd5e1] bg-[#f8fafc] px-2.5 py-1 focus-within:border-[#0051d5]">
            <Search className="h-3.5 w-3.5 text-[#757682] shrink-0" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search INC-2024-8841, n0rthstar-sec.link, 185.220.101.5..."
              aria-label="Global threat search"
              className="w-full bg-transparent font-mono text-xs text-[#131b2e] placeholder:text-[#757682] focus:outline-none"
            />
          </form>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveView('audit')}
              className="lg:hidden inline-flex h-8 items-center gap-1 rounded-[4px] border border-[#cbd5e1] bg-white px-2.5 text-xs font-semibold text-[#131b2e]"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#00236f]" />
              <span>Audit</span>
            </button>
            {activeView === 'simulation' ? (
              <button
                type="button"
                onClick={() => {
                  triggerFileDownload(EXPORT_TEMPLATES.stix.filename, EXPORT_TEMPLATES.stix.content, 'application/json');
                  recordAudit('STIX EXPORT', 'Simulation Centre', 'Exported Scenario N-8841 STIX 2.1 bundle.');
                  showToast('Exported Scenario N-8841 STIX 2.1 bundle.');
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-[4px] bg-[#00236f] px-3 text-xs font-semibold text-white hover:bg-[#1e3a8a] whitespace-nowrap shrink-0"
              >
                <span>Export STIX 2.1</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveView('simulation')}
                className="inline-flex h-8 items-center gap-1.5 rounded-[4px] bg-[#00236f] px-3 text-xs font-semibold text-white hover:bg-[#1e3a8a] whitespace-nowrap shrink-0"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                <span>Launch Simulation</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setAppPage('landing')}
              className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-[#cbd5e1] bg-transparent px-2.5 text-xs font-semibold text-[#444651] hover:bg-[#f2f3ff] whitespace-nowrap shrink-0"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Active Workspace Viewport */}
        <main className="mx-auto w-full max-w-[1440px] flex-1 p-4 lg:p-6">
          {activeView === 'overview' && (
            <OverviewView
              incidents={INCIDENTS}
              telemetryStream={INITIAL_TELEMETRY_STREAM}
              onNavigate={setActiveView}
              onSelectIncident={setSelectedIncidentId}
              onInspect={setInspectionTarget}
              onRecordAudit={(ev, surf, desc) => recordAudit(ev, surf, desc)}
            />
          )}

          {activeView === 'cases' && (
            <CaseDossierView
              incident={activeIncident}
              auditLogs={auditLogs}
              countermeasures={countermeasures}
              onExecuteCountermeasure={handleExecuteCountermeasure}
              onInspect={setInspectionTarget}
              onNavigate={setActiveView}
              onRecordAudit={(ev, surf, desc) => recordAudit(ev, surf, desc)}
            />
          )}

          {activeView === 'simulation' && (
            <SimulationView
              onInspect={setInspectionTarget}
              onRecordAudit={(ev, surf, desc) => recordAudit(ev, surf, desc)}
            />
          )}

          {activeView === 'graph' && (
            <ThreatGraphView
              tokensRevoked={countermeasures.tokensRevoked}
              firewallBlocked={countermeasures.firewallBlocked}
              onRevokeToken={() => handleExecuteCountermeasure('tokensRevoked')}
              onBlockDomain={() => handleExecuteCountermeasure('firewallBlocked')}
            />
          )}

          {activeView === 'lab' && (
            <EvidenceLabView
              artifacts={labArtifacts}
              onAddArtifact={(art) => {
                setLabArtifacts((prev) => [art, ...prev]);
                showToast(`Ingested & correlated ${art.id}`);
              }}
              onToggleHold={handleToggleHold}
              onClearArtifacts={() => {
                setLabArtifacts([]);
                showToast('Evidence ledger cleared.');
              }}
              onResetArtifacts={() => {
                setLabArtifacts(INITIAL_LAB_ARTIFACTS);
                showToast('Restored Northstar forensic sample ledger.');
              }}
              onInspect={setInspectionTarget}
              onRecordAudit={(ev, surf, desc) => recordAudit(ev, surf, desc)}
            />
          )}

          {activeView === 'audit' && (
            <AuditComplianceView
              auditLogs={auditLogs}
              onRecordAudit={(ev, surf, desc) => recordAudit(ev, surf, desc)}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (<lg, <= 64px height) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-[#e2e8f0] bg-white/95 backdrop-blur-md lg:hidden"
        aria-label="Mobile SOC navigation"
      >
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-[11px] font-semibold transition-colors ${
                active ? 'text-[#00236f]' : 'text-[#444651]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Collapsible Forensic Inspector Drawer */}
      <ForensicDrawer
        target={inspectionTarget}
        onClose={() => setInspectionTarget(null)}
        onExecuteAction={handleDrawerAction}
      />

      {/* Action Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-18 right-4 z-50 rounded-[4px] border border-[#00236f] bg-[#131b2e] px-3.5 py-2 text-xs font-medium text-white shadow-lg lg:bottom-4"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
