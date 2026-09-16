/**
 * @file AlertsView.tsx
 * @description High-Priority File Integrity Alert Cards and Triage Center.
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { FimEvent } from '../types/fim';

interface AlertsViewProps {
  events: FimEvent[];
  onSelectEvent: (event: FimEvent) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ events, onSelectEvent }) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  // Filter only suspicious or elevated severity events
  const alertEvents = events.filter(e => 
    e.isSuspicious || e.severity === 'HIGH' || e.severity === 'CRITICAL' || e.severity === 'MEDIUM'
  );

  const displayedAlerts = alertEvents.filter(e =>
    filterSeverity === 'ALL' || e.severity === filterSeverity
  );

  const criticalCount = alertEvents.filter(e => e.severity === 'CRITICAL').length;
  const highCount = alertEvents.filter(e => e.severity === 'HIGH').length;
  const mediumCount = alertEvents.filter(e => e.severity === 'MEDIUM').length;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6">

      {/* Header & Severity Summary */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-rose-950 text-rose-400 border border-rose-500/30">
                Threat Alert Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Heuristic & Cryptographic Anomaly Triage
              </span>
            </div>
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-rose-400" />
              <span>Security Threat Alerts</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              High-priority events flagged for potential unauthorized tampering, executable drops, or integrity violations.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setFilterSeverity('ALL')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterSeverity === 'ALL'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Alerts ({alertEvents.length})
            </button>
            <button
              onClick={() => setFilterSeverity('CRITICAL')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterSeverity === 'CRITICAL'
                  ? 'bg-rose-950 text-rose-300 border border-rose-600/50'
                  : 'text-rose-400 hover:bg-rose-950/40'
              }`}
            >
              Critical ({criticalCount})
            </button>
            <button
              onClick={() => setFilterSeverity('HIGH')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterSeverity === 'HIGH'
                  ? 'bg-orange-950 text-orange-300 border border-orange-600/50'
                  : 'text-orange-400 hover:bg-orange-950/40'
              }`}
            >
              High ({highCount})
            </button>
            <button
              onClick={() => setFilterSeverity('MEDIUM')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterSeverity === 'MEDIUM'
                  ? 'bg-amber-950 text-amber-300 border border-amber-600/50'
                  : 'text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              Medium ({mediumCount})
            </button>
          </div>
        </div>
      </div>

      {/* Alert Cards List */}
      {displayedAlerts.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
          <div className="h-12 w-12 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold font-mono text-white">
            No Security Threat Alerts Active
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All files currently match baseline cryptographic specifications. You can trigger simulated file anomalies in the Demo Sandbox to view dynamic threat detection alerts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {displayedAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-xl p-5 shadow-sm space-y-4 transition-all ${
                alert.severity === 'CRITICAL'
                  ? 'bg-slate-900/95 border-rose-800/80 shadow-rose-950/20'
                  : alert.severity === 'HIGH'
                  ? 'bg-slate-900/95 border-orange-800/80 shadow-orange-950/20'
                  : 'bg-slate-900/95 border-amber-800/80 shadow-amber-950/20'
              }`}
            >
              {/* Card Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-400 border border-rose-700/60'
                      : alert.severity === 'HIGH'
                      ? 'bg-orange-950 text-orange-400 border border-orange-700/60'
                      : 'bg-amber-950 text-amber-400 border border-amber-700/60'
                  }`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider font-mono text-white">
                      FILE INTEGRITY ALERT
                    </span>
                    <span className="text-xs text-slate-400 ml-2 font-mono">
                      [ID: {alert.id}]
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400">{new Date(alert.timestamp).toLocaleString()}</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-900 text-rose-200 border border-rose-700'
                      : alert.severity === 'HIGH'
                      ? 'bg-orange-900 text-orange-200 border border-orange-700'
                      : 'bg-amber-900 text-amber-200 border border-amber-700'
                  }`}>
                    Severity: {alert.severity}
                  </span>
                </div>
              </div>

              {/* Core Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Target File:</span>
                  <span className="text-white font-bold text-sm truncate block" title={alert.fileName}>
                    {alert.fileName}
                  </span>
                  <span className="text-slate-400 text-[11px] truncate block mt-0.5" title={alert.filePath}>
                    {alert.filePath}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Observed Event:</span>
                  <span className={`font-bold text-sm uppercase ${
                    alert.eventType === 'CREATED' ? 'text-emerald-400' :
                    alert.eventType === 'MODIFIED' ? 'text-amber-400' :
                    'text-rose-400'
                  }`}>
                    {alert.eventType}
                  </span>
                  <span className="text-slate-400 text-[11px] block mt-0.5">
                    Hash Status: {alert.hashStatus}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Payload Size:</span>
                  <span className="text-slate-200 font-bold text-sm">
                    {alert.fileSize} bytes
                  </span>
                  <span className="text-slate-400 text-[11px] block mt-0.5">
                    Extension: {alert.extension || 'None'}
                  </span>
                </div>
              </div>

              {/* Reason Box */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <span className="font-semibold text-slate-300 font-mono block mb-1 uppercase tracking-wider text-[11px]">
                  Forensic Detection Reason:
                </span>
                <p className="text-slate-300 font-sans leading-relaxed">
                  {alert.reason}
                </p>
                {alert.threatRules && alert.threatRules.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-900 space-y-1">
                    {alert.threatRules.map((r, i) => (
                      <div key={i} className="text-[11px] font-mono text-cyan-300">
                        &bull; <span className="font-semibold">{r.ruleName}:</span> {r.evidence}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cryptographic SHA-256 Hashes Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                {/* Previous Hash */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="text-cyan-400 font-semibold">Previous SHA-256 Hash:</span>
                    {alert.previousHash && (
                      <button
                        onClick={() => handleCopy(alert.previousHash!)}
                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-300"
                      >
                        {copiedHash === alert.previousHash ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>Copy</span>
                      </button>
                    )}
                  </div>
                  <p className="text-slate-300 text-[11px] break-all select-all font-mono">
                    {alert.previousHash || 'None (New file artifact)'}
                  </p>
                </div>

                {/* Current Hash */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="text-rose-400 font-semibold">Current SHA-256 Hash:</span>
                    {alert.currentHash && (
                      <button
                        onClick={() => handleCopy(alert.currentHash!)}
                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-300"
                      >
                        {copiedHash === alert.currentHash ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>Copy</span>
                      </button>
                    )}
                  </div>
                  <p className="text-slate-300 text-[11px] break-all select-all font-mono">
                    {alert.currentHash || 'File Removed from Storage Media'}
                  </p>
                </div>
              </div>

              {/* Recommendation & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-400 font-mono">
                  <span className="text-amber-300 font-semibold">Investigator Action: </span>
                  <span className="font-sans text-slate-300">{alert.recommendation}</span>
                </div>

                <button
                  onClick={() => onSelectEvent(alert)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-medium bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-sm transition-all whitespace-nowrap"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Explain Threat & Dossier &rarr;</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
