import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronRight,
  CircleDot,
  Command,
  Crosshair,
  FileSearch,
  Fingerprint,
  FlaskConical,
  GitBranch,
  LockKeyhole,
  Network,
  Play,
  Radio,
  Shield,
  ShieldCheck,
  Workflow,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const CAPABILITIES = [
  {
    icon: Crosshair,
    number: '01',
    title: 'Security overview',
    description: 'Bring critical incidents, live telemetry, and response priorities into one clear operating picture.',
    tag: 'DETECT',
  },
  {
    icon: FileSearch,
    number: '02',
    title: 'Case dossier',
    description: 'Build a defensible investigation with linked indicators, response actions, and a complete audit trail.',
    tag: 'INVESTIGATE',
  },
  {
    icon: Play,
    number: '03',
    title: 'Live simulation',
    description: 'Walk through realistic incident scenarios and export intelligence in the STIX 2.1 format.',
    tag: 'PREPARE',
  },
  {
    icon: Network,
    number: '04',
    title: 'Threat graph',
    description: 'Explore how infrastructure, identities, and events connect across the attack timeline.',
    tag: 'CORRELATE',
  },
  {
    icon: FlaskConical,
    number: '05',
    title: 'Evidence lab',
    description: 'Ingest forensic artifacts, manage preservation holds, and maintain chain-of-custody context.',
    tag: 'PRESERVE',
  },
  {
    icon: ShieldCheck,
    number: '06',
    title: 'Audit & compliance',
    description: 'Review signed operator activity and monitor evidence against common control frameworks.',
    tag: 'GOVERN',
  },
];

const INCIDENTS = [
  { severity: 'critical', code: 'INC-2024-8841', title: 'Northstar Treasury · BEC', source: 'Identity / Mail', time: '02m ago' },
  { severity: 'high', code: 'INC-2024-8838', title: 'Unusual admin token activity', source: 'Cloud / IAM', time: '14m ago' },
  { severity: 'medium', code: 'INC-2024-8829', title: 'Suspicious DNS beaconing', source: 'Endpoint / DNS', time: '38m ago' },
];

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="sentinel-landing">
      <header className="landing-header">
        <a className="landing-brand" href="#home" aria-label="Sentinel home">
          <span className="landing-brand-mark"><Shield size={17} strokeWidth={2.2} /></span>
          <span>SENTINEL<span className="landing-brand-enterprise"> / ENTERPRISE</span></span>
        </a>
        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#platform">Platform</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#trust">Trust</a>
        </nav>
        <div className="landing-header-actions">
          <button type="button" className="landing-signin" onClick={onGetStarted}>Sign in</button>
          <button type="button" className="landing-header-cta" onClick={onGetStarted}>
            Open workspace <ArrowRight size={15} />
          </button>
        </div>
      </header>

      <main>
        <section className="landing-hero" id="home">
          <div className="landing-hero-glow" aria-hidden="true" />
          <div className="landing-hero-copy">
            <div className="landing-eyebrow"><span className="landing-live-dot" /> SECURITY OPERATIONS, IN FOCUS</div>
            <h1>Clarity in the<br /><span>critical moment.</span></h1>
            <p className="landing-hero-description">
              One command center for threat intelligence, incident response, and digital evidence — built for the people who protect what matters.
            </p>
            <div className="landing-hero-actions">
              <button type="button" className="landing-primary-cta" onClick={onGetStarted}>
                Enter the workspace <ArrowRight size={16} />
              </button>
              <a className="landing-secondary-cta" href="#platform">
                <span className="landing-play-icon"><Play size={12} fill="currentColor" /></span>
                Explore the platform
              </a>
            </div>
            <div className="landing-hero-note">
              <LockKeyhole size={13} />
              <span>Built for secure, auditable operations</span>
              <span className="landing-note-separator">·</span>
              <span>STIX 2.1 ready</span>
            </div>
          </div>

          <div className="landing-product-wrap" id="platform">
            <div className="landing-product-orbit landing-product-orbit-one" aria-hidden="true" />
            <div className="landing-product-orbit landing-product-orbit-two" aria-hidden="true" />
            <div className="landing-product-window">
              <div className="product-topbar">
                <div className="product-window-brand"><span className="product-mini-mark"><Shield size={12} /></span> SENTINEL <span>/ SOC</span></div>
                <div className="product-live"><span /> LIVE TELEMETRY</div>
                <button type="button" aria-label="Notifications" className="product-bell"><Bell size={14} /></button>
                <span className="product-avatar">SJ</span>
              </div>
              <div className="product-content">
                <div className="product-heading">
                  <div>
                    <div className="product-overline">NOVEMBER 14, 2026 <span>·</span> 09:41:08 UTC</div>
                    <h2>Security overview</h2>
                    <p>Your environment, at a glance.</p>
                  </div>
                  <span className="product-period"><CircleDot size={11} /> Last 24 hours <ChevronRight size={12} /></span>
                </div>
                <div className="product-metrics">
                  <div className="product-metric"><span>OPEN INCIDENTS</span><strong>12</strong><small className="metric-warn"><ArrowUpRight size={12} /> 3 need attention</small></div>
                  <div className="product-metric"><span>HIGH PRIORITY</span><strong className="metric-red">03</strong><small>Across 2 investigations</small></div>
                  <div className="product-metric"><span>EVENTS ANALYZED</span><strong>28.4k</strong><small className="metric-good"><Activity size={12} /> Stream healthy</small></div>
                </div>
                <div className="product-lower">
                  <div className="product-incident-panel">
                    <div className="product-panel-title"><span>Priority incidents</span><button type="button" onClick={onGetStarted}>View queue <ArrowRight size={11} /></button></div>
                    <div className="product-incident-head"><span>CASE / SIGNAL</span><span>SOURCE</span><span>UPDATED</span></div>
                    {INCIDENTS.map((incident) => (
                      <div className="product-incident-row" key={incident.code}>
                        <div className="product-incident-name">
                          <span className={`incident-indicator incident-${incident.severity}`} />
                          <span><b>{incident.code}</b><small>{incident.title}</small></span>
                        </div>
                        <span className="product-incident-source">{incident.source}</span>
                        <span className="product-incident-time">{incident.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="product-signal-panel">
                    <div className="product-panel-title"><span>Response posture</span><ArrowUpRight size={13} /></div>
                    <div className="signal-ring"><div><strong>84</strong><small>POSTURE</small></div></div>
                    <div className="signal-legend"><span><i className="legend-blue" />Controls active</span><b>18 / 21</b></div>
                    <div className="signal-legend"><span><i className="legend-amber" />Needs review</span><b>03</b></div>
                  </div>
                </div>
                <div className="product-statusbar">
                  <span><Radio size={12} /> All ingestion pipelines operational</span>
                  <span><Fingerprint size={12} /> Audit ledger synchronized</span>
                  <span>ENV: PRODUCTION</span>
                </div>
              </div>
            </div>
            <div className="product-float-card">
              <span className="float-icon"><GitBranch size={15} /></span>
              <span><b>Threat correlated</b><small>3 signals · Case N-8841</small></span>
              <Check size={14} className="float-check" />
            </div>
          </div>
        </section>

        <section className="landing-trust-strip" id="trust" aria-label="Platform principles">
          <div className="trust-intro">DESIGNED FOR THE<br />ENTIRE RESPONSE LIFECYCLE</div>
          <div className="trust-item"><Crosshair size={16} /><span>Detect with context</span></div>
          <div className="trust-item"><Workflow size={16} /><span>Respond in one place</span></div>
          <div className="trust-item"><Fingerprint size={16} /><span>Preserve every action</span></div>
          <div className="trust-item"><Command size={16} /><span>Export open intelligence</span></div>
        </section>

        <section className="landing-capabilities" id="capabilities">
          <div className="capabilities-heading">
            <div>
              <div className="landing-eyebrow">THE SENTINEL PLATFORM</div>
              <h2>Every signal. One response.</h2>
            </div>
            <p>Move from first alert to defensible resolution without losing the context, evidence, or people behind the work.</p>
          </div>
          <div className="capability-grid">
            {CAPABILITIES.map(({ icon: Icon, number, title, description, tag }) => (
              <article className="capability-card" key={title}>
                <div className="capability-card-top"><span className="capability-icon"><Icon size={18} /></span><span className="capability-number">{number}</span></div>
                <div className="capability-tag">{tag}</div>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="capability-link" aria-hidden="true"><ArrowDownRight size={15} /></span>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-bottom-cta">
          <div className="bottom-cta-icon"><ShieldCheck size={22} /></div>
          <div>
            <div className="landing-eyebrow">YOUR OPERATIONS, CONNECTED</div>
            <h2>Bring your team into focus.</h2>
            <p>Open the Sentinel workspace and explore the full security operations toolkit.</p>
          </div>
          <button type="button" className="landing-primary-cta" onClick={onGetStarted}>
            Get started <ArrowRight size={16} />
          </button>
          <span className="cta-decoration" aria-hidden="true"><ArrowUpRight size={120} /></span>
        </section>
      </main>

      <footer className="landing-footer">
        <a className="landing-brand" href="#home">
          <span className="landing-brand-mark"><Shield size={16} /></span>
          <span>SENTINEL<span className="landing-brand-enterprise"> / ENTERPRISE</span></span>
        </a>
        <span>Threat intelligence. Evidence. Response.</span>
        <span>© 2026 Sentinel Enterprise</span>
      </footer>
    </div>
  );
}
