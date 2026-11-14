import { useState } from 'react';
import { Check, Copy, Maximize2, Minimize2, ShieldBan, X } from 'lucide-react';
import { ForensicInspectionTarget } from '../types/sentinel';
import { SeverityTag } from './SeverityTag';
import { copyToClipboard } from '../utils/exportHelpers';

interface ForensicDrawerProps {
  target: ForensicInspectionTarget | null;
  onClose: () => void;
  onExecuteAction: (actionKey: 'revoke_token' | 'block_domain' | 'enforce_hold' | 'isolate_host', label: string) => void;
}

export function ForensicDrawer({ target, onClose, onExecuteAction }: ForensicDrawerProps) {
  const [activeTab, setActiveTab] = useState<'properties' | 'json'>('properties');
  const [wide, setWide] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [executed, setExecuted] = useState(false);

  if (!target) return null;

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#131b2e]/30 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Forensic Inspector">
      <div className="flex-1" onClick={onClose} />
      <aside
        className={`flex h-full flex-col border-l border-[#cbd5e1] bg-white shadow-xl transition-all duration-150 ${
          wide ? 'w-full max-w-[680px]' : 'w-full max-w-[480px]'
        }`}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#e2e8f0] px-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-mono text-xs font-medium text-[#00236f] truncate">{target.id}</span>
            <SeverityTag level={target.severity} showIcon />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setWide((w) => !w)}
              className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-[4px] text-[#444651] hover:bg-[#f2f3ff] hover:text-[#131b2e]"
              title={wide ? 'Default width' : 'Expand width'}
              aria-label="Toggle inspector width"
            >
              {wide ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] text-[#444651] hover:bg-[#f2f3ff] hover:text-[#131b2e]"
              aria-label="Close forensic inspector"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="border-b border-[#e2e8f0] bg-[#faf8ff] px-4 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#444651]">{target.category}</div>
          <h2 className="mt-0.5 text-base font-semibold text-[#131b2e] break-words">{target.title}</h2>
          <p className="mt-1 text-xs text-[#444651] leading-relaxed">{target.subtitle}</p>
        </div>

        <div className="flex border-b border-[#e2e8f0] bg-white px-4">
          <button
            type="button"
            onClick={() => setActiveTab('properties')}
            className={`border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'properties'
                ? 'border-[#00236f] text-[#00236f]'
                : 'border-transparent text-[#444651] hover:text-[#131b2e]'
            }`}
          >
            Entity Properties
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'json'
                ? 'border-[#00236f] text-[#00236f]'
                : 'border-transparent text-[#444651] hover:text-[#131b2e]'
            }`}
          >
            Raw Telemetry JSON
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'properties' ? (
            <div className="divide-y divide-[#e2e8f0] rounded-[8px] border border-[#e2e8f0] bg-white">
              {Object.entries(target.properties).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-3 px-3 py-2.5">
                  <span className="text-xs font-medium text-[#444651] shrink-0">{key}</span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono text-xs text-[#131b2e] text-right break-all">{value}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(key, value)}
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] text-[#757682] hover:bg-[#f2f3ff] hover:text-[#00236f]"
                      title="Copy value"
                      aria-label={`Copy ${key}`}
                    >
                      {copiedKey === key ? <Check className="h-3.5 w-3.5 text-[#047857]" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative rounded-[8px] border border-[#e2e8f0] bg-[#131b2e] p-3">
              <button
                type="button"
                onClick={() => handleCopy('raw_json', JSON.stringify(target.rawJson, null, 2))}
                className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-[4px] border border-slate-700 bg-[#283044] px-2 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700"
              >
                {copiedKey === 'raw_json' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedKey === 'raw_json' ? 'Copied' : 'Copy'}</span>
              </button>
              <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-[#dce1ff]">
                {JSON.stringify(target.rawJson, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {target.recommendedAction && (
          <div className="border-t border-[#e2e8f0] bg-[#faf8ff] p-4">
            <button
              type="button"
              disabled={executed}
              onClick={() => {
                onExecuteAction(target.recommendedAction!.actionKey, target.recommendedAction!.label);
                setExecuted(true);
              }}
              className={`flex w-full items-center justify-center gap-2 rounded-[4px] px-4 py-2 text-xs font-semibold transition-colors ${
                executed
                  ? 'border border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]'
                  : 'bg-[#00236f] text-white hover:bg-[#1e3a8a]'
              }`}
            >
              {executed ? <Check className="h-4 w-4" /> : <ShieldBan className="h-4 w-4" />}
              <span>{executed ? `${target.recommendedAction.label} — Executed` : target.recommendedAction.label}</span>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
