/**
 * @file DashboardView.tsx
 * @description Security Operations Center (SOC) style dashboard for FileGuard AI.
 */

import React from 'react';
import {
  FolderCheck,
  FileEdit,
  FilePlus,
  FileX,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Sparkles,
  Zap,
  Clock,
  ChevronRight
} from 'lucide-react';
import { SystemStats, FimEvent } from '../types/fim';

interface DashboardViewProps {
  stats: SystemStats;
  recentEvents: FimEvent[];
  onSelectEvent: (event: FimEvent) => void;
  onNavigateTab: (tab: any) => void;
  onRunSimulation: (action: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recentEvents,
  onSelectEvent,
  onNavigateTab,
  onRunSimulation,
}) => {
  // Severity counts from recent events
  const criticalCount = recentEvents.filter(e => e.severity === 'CRITICAL').length;
  const highCount = recentEvents.filter(e => e.severity === 'HIGH').length;
  const mediumCount = recentEvents.filter(e => e.severity === 'MEDIUM').length;
  const lowCount = recentEvents.filter(e => e.severity === 'LOW').length;
  const totalEvents = recentEvents.length || 1;

  // Integrity color
  const integrityColor = stats.integrityScore >= 90
    ? 'text-emerald-400'
    : stats.integrityScore >= 70
    ? 'text-amber-400'
    : 'text-rose-400';

  const integrityBg = stats.integrityScore >= 90
    ? 'bg-emerald-500'
    : stats.integrityScore >= 70
    ? 'bg-amber-500'
    : 'bg-rose-500';

  return (
    <div className="space-y-6">

      {/* Top Banner: Quick System Status & Demo Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                Academic DFIR Prototype
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {stats.isMonitoring ? 'Continuous Scanning Active' : 'Scanner Idle'}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight font-mono">
              SOC Integrity & Threat Telemetry
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              Monitors cryptographic SHA-256 digests in real-time, matching filesystem anomalies against heuristic detection rules.
            </p>
          </div>

          {/* Quick Simulation Trigger Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 px-1 flex items-center gap-1">
              <Zap className="h-3 w-3 text-cyan-400" />
              <span>Simulate:</span>
            </span>
            <button
              onClick={() => onRunSimulation('modify_config')}
              className="px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Appends unauthorized config line to sample_config.txt"
            >
              Config Tamper
            </button>
            <button
              onClick={() => onRunSimulation('create_executable')}
              className="px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
              title="Drops harmless suspicious_script.sh"
            >
              Script Injection
            </button>
            <button
              onClick={() => onRunSimulation('create_double_extension')}
              className="px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-rose-300 transition-colors"
              title="Creates urgent_invoice.pdf.exe"
            >
              Double Extension
            </button>
            <button
              onClick={() => onNavigateTab('demo')}
              className="px-2.5 py-1 rounded text-xs bg-cyan-950 border border-cyan-600/40 text-cyan-300 hover:bg-cyan-900 transition-colors font-medium flex items-center gap-1"
            >
              <span>Demo Lab</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        
        {/* Monitored Files */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Monitored</span>
            <FolderCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats.totalMonitoredFiles}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            {stats.baselineFileCount} in baseline
          </p>
        </div>

        {/* Modified Files */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Modified</span>
            <FileEdit className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {stats.modifiedFilesCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            Hash discrepancies
          </p>
        </div>

        {/* Created Files */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Created</span>
            <FilePlus className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {stats.createdFilesCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            New artifacts
          </p>
        </div>

        {/* Deleted Files */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Deleted</span>
            <FileX className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300">
            {stats.deletedFilesCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            Missing records
          </p>
        </div>

        {/* Suspicious Events */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Suspicious</span>
            <ShieldAlert className="h-4 w-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-orange-300">
            {stats.suspiciousEventsCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            Rules triggered
          </p>
        </div>

        {/* High/Critical Alerts */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">High/Critical</span>
            <AlertOctagon className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {stats.highCriticalAlertsCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            Urgent attention
          </p>
        </div>

        {/* Integrity Health Score */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Integrity</span>
            <ShieldCheck className={`h-4 w-4 ${integrityColor}`} />
          </div>
          <div className={`text-2xl font-bold font-mono ${integrityColor}`}>
            {stats.integrityScore}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${integrityBg} transition-all duration-500`}
              style={{ width: `${stats.integrityScore}%` }}
            />
          </div>
        </div>

      </div>

      {/* Middle Section: Visual Integrity Status & Threat Severity Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Threat Severity Distribution Chart Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <span>Threat Severity Profile</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {stats.totalEventsCount} Total Events
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Critical */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>CRITICAL</span>
                </span>
                <span className="font-semibold text-rose-400">{criticalCount}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all"
                  style={{ width: `${(criticalCount / totalEvents) * 100}%` }}
                />
              </div>
            </div>

            {/* High */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                  <span>HIGH</span>
                </span>
                <span className="font-semibold text-orange-400">{highCount}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all"
                  style={{ width: `${(highCount / totalEvents) * 100}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span>MEDIUM</span>
                </span>
                <span className="font-semibold text-amber-400">{mediumCount}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${(mediumCount / totalEvents) * 100}%` }}
                />
              </div>
            </div>

            {/* Low */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>LOW</span>
                </span>
                <span className="font-semibold text-emerald-400">{lowCount}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${(lowCount / totalEvents) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            <p>
              Automated heuristics prioritize rapid burst modifications, executable drops, and critical configuration changes.
            </p>
          </div>
        </div>

        {/* File Integrity Health Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Cryptographic Integrity Status</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">SHA-256</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 block mb-1">Baseline Established</span>
              <span className="font-mono text-slate-200 text-[11px]">
                {stats.baselineCreatedAt ? new Date(stats.baselineCreatedAt).toLocaleTimeString() : 'Not Set'}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 block mb-1">Last Detection</span>
              <span className="font-mono text-slate-200 text-[11px]">
                {stats.lastEventTimestamp ? new Date(stats.lastEventTimestamp).toLocaleTimeString() : 'None'}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Baseline Compliant Files:</span>
              <span className="font-mono font-bold text-emerald-400">
                {Math.max(0, stats.totalMonitoredFiles - stats.modifiedFilesCount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Integrity Breaches (Changed):</span>
              <span className="font-mono font-bold text-amber-400">
                {stats.modifiedFilesCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Unbaselined Additions (New):</span>
              <span className="font-mono font-bold text-cyan-400">
                {stats.createdFilesCount}
              </span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onNavigateTab('baseline')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium transition-colors font-mono"
            >
              Manage Baseline
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="w-full py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/40 rounded-md text-xs font-medium transition-colors font-mono"
            >
              Export Report
            </button>
          </div>
        </div>

        {/* Quick Guide for College Evaluation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1 rounded bg-indigo-950 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-semibold text-white font-mono">
                Cyber Forensics Architecture
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              FileGuard AI demonstrates core Digital Forensics and Incident Response (DFIR) principles:
            </p>
            <ul className="text-xs text-slate-400 space-y-2 font-mono list-disc list-inside">
              <li>
                <strong className="text-slate-200">Non-Destructive Hashing:</strong> SHA-256 calculation streams bytes read-only without modifying access timestamps.
              </li>
              <li>
                <strong className="text-slate-200">Rule-Based Triaging:</strong> Automatically categorizes risk without claiming certainty.
              </li>
              <li>
                <strong className="text-slate-200">AI Contextual Reasoning:</strong> Google Gemini formulates investigator checklists.
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigateTab('architecture')}
            className="mt-4 flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 text-xs text-cyan-400 font-mono transition-colors"
          >
            <span>View Architecture & Lab Notes</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* Recent Security Events Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>Real-Time Security Event Stream</span>
            </h3>
            <p className="text-xs text-slate-400">
              Latest file system occurrences detected by active watchers
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('events')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
          >
            <span>View Full Event Log</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-mono">
            No events detected yet. Try triggering a simulation above or creating/modifying a file in the monitored directory!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Event Type</th>
                  <th className="px-5 py-3">Artifact</th>
                  <th className="px-5 py-3">Severity</th>
                  <th className="px-5 py-3">Observed Reason</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {recentEvents.slice(0, 7).map((evt) => (
                  <tr
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.eventType === 'CREATED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        evt.eventType === 'MODIFIED' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {evt.eventType}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-200 truncate max-w-xs">
                      {evt.fileName}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.severity === 'CRITICAL' ? 'bg-rose-900/80 text-rose-200 border border-rose-700' :
                        evt.severity === 'HIGH' ? 'bg-orange-900/80 text-orange-200 border border-orange-700' :
                        evt.severity === 'MEDIUM' ? 'bg-amber-900/80 text-amber-200 border border-amber-700' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {evt.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 truncate max-w-sm font-sans">
                      {evt.reason}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px]">
                        Inspect &rarr;
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
