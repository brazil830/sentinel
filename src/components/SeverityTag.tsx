import { AlertTriangle, CheckCircle2, Info, ShieldAlert, ShieldCheck } from 'lucide-react';
import { SeverityLevel } from '../types/sentinel';

interface SeverityTagProps {
  level: SeverityLevel;
  label?: string;
  showIcon?: boolean;
}

const STYLE_MAP: Record<SeverityLevel, { bg: string; border: string; text: string; defaultLabel: string }> = {
  critical: {
    bg: 'bg-[#fef2f2]',
    border: 'border-[#fca5a5]',
    text: 'text-[#ba1a1a]',
    defaultLabel: 'CRITICAL',
  },
  high: {
    bg: 'bg-[#fff7ed]',
    border: 'border-[#fdba74]',
    text: 'text-[#c2410c]',
    defaultLabel: 'HIGH',
  },
  medium: {
    bg: 'bg-[#fffbeb]',
    border: 'border-[#fcd34d]',
    text: 'text-[#b45309]',
    defaultLabel: 'MEDIUM',
  },
  low: {
    bg: 'bg-[#ecfdf5]',
    border: 'border-[#a7f3d0]',
    text: 'text-[#047857]',
    defaultLabel: 'VERIFIED',
  },
  benign: {
    bg: 'bg-[#f1f5f9]',
    border: 'border-[#cbd5e1]',
    text: 'text-[#475569]',
    defaultLabel: 'BENIGN',
  },
  info: {
    bg: 'bg-[#f0f9ff]',
    border: 'border-[#bae6fd]',
    text: 'text-[#0369a1]',
    defaultLabel: 'INFO',
  },
};

export function SeverityTag({ level, label, showIcon = false }: SeverityTagProps) {
  const cfg = STYLE_MAP[level];
  const Icon =
    level === 'critical'
      ? ShieldAlert
      : level === 'high' || level === 'medium'
      ? AlertTriangle
      : level === 'low'
      ? ShieldCheck
      : level === 'benign'
      ? CheckCircle2
      : Info;

  return (
    <span
      className={`inline-flex h-5 items-center gap-1 rounded-[4px] border px-1.5 text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap shrink-0 ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      {showIcon && <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
      <span>{label ?? cfg.defaultLabel}</span>
    </span>
  );
}
