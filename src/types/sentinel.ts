export type ViewId = 'overview' | 'cases' | 'simulation' | 'graph' | 'lab' | 'audit';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'benign' | 'info';

export interface SecurityIncident {
  id: string;
  title: string;
  severity: SeverityLevel;
  status: 'CONTAINED / REVIEW' | 'RESOLVED' | 'FALSE POSITIVE' | 'ACTIVE TRIAGE';
  target: string;
  targetActor: string;
  domainIoc?: string;
  blockedIp?: string;
  signature?: string;
  timelineSpan: string;
  linkedArtifacts: number;
  atRiskAmount?: string;
  mitigationSummary?: string;
  leadAnalyst: string;
  forensicsHash: string;
  slaSecondsRemaining: number;
  confidence: number;
  narrative: string;
}

export interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
  description: string;
  mitigation: string;
}

export interface CaseEvidenceItem {
  id: string;
  title: string;
  category: string;
  tag: string;
  severity: SeverityLevel;
  timestamp: string;
  metadata: Record<string, string>;
  rawPayload: string;
}

export interface TelemetryStreamRow {
  id: string;
  timestamp: string;
  severity: SeverityLevel;
  message: string;
  actionTag: string;
  ioc?: string;
}

export interface SimulationStage {
  stage: number;
  timeLabel: string;
  offsetMinutes: number;
  title: string;
  badgeText: string;
  severity: SeverityLevel;
  headline: string;
  summary: string;
  riskScoreAtStage: number;
  metadata: Record<string, string>;
  rawPayload: string;
}

export interface SimulationEntity {
  id: string;
  identifier: string;
  role: string;
  category: 'THREAT ACTOR' | 'PHISHING HOST' | 'C2 PROXY' | 'FRAUD SINK' | 'IMPERSONATED' | 'COMPROMISED ASSET';
  severity: SeverityLevel;
  description: string;
}

export interface GraphNode {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  type: 'actor' | 'exec' | 'phone' | 'domain' | 'ip' | 'target' | 'finance' | 'benign';
  category: 'risk' | 'finance' | 'context' | 'benign';
  title: string;
  entityType: string;
  summary: string;
  score?: number;
  badge?: string;
  passiveDns?: string[];
  riskIndicators?: string[];
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  color: 'red' | 'amber' | 'blue' | 'muted';
  dashed?: boolean;
  category: 'risk' | 'finance' | 'context' | 'benign';
}

export interface LabEvidenceArtifact {
  id: string;
  timestamp: string;
  severity: SeverityLevel;
  sourceType: 'SMS' | 'Domains' | 'Telephony' | 'Transactions';
  channelLabel: string;
  headline: string;
  subheadline: string;
  metrics: { label: string; value: string; tone?: 'danger' | 'warn' | 'neutral' }[];
  rawTraceTitle: string;
  rawTraceLines: string[];
  vtScore?: string;
  holdEnforced?: boolean;
  iocCount: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  sigHash: string;
  actor: string;
  actorKey: 'sarah' | 'system' | 'daemon';
  surface: string;
  description: string;
  severity: SeverityLevel;
}

export interface ThreatIntegration {
  id: string;
  name: string;
  details: string;
  status: 'CONNECTED' | 'ACTIVE SYNC' | 'DEGRADED';
  lastSync: string;
}

export interface ForensicInspectionTarget {
  id: string;
  title: string;
  subtitle: string;
  severity: SeverityLevel;
  category: string;
  properties: Record<string, string>;
  rawJson: unknown;
  recommendedAction?: {
    label: string;
    actionKey: 'revoke_token' | 'block_domain' | 'enforce_hold' | 'isolate_host';
  };
}
