/**
 * @file SettingsView.tsx
 * @description System Settings, Target Directory Configuration, and Heuristic Rule Policies.
 */

import React, { useState } from 'react';
import {
  Sliders,
  FolderCog,
  Shield,
  FileCheck,
  CheckCircle2,
  Info,
  Server,
  Play,
  Square
} from 'lucide-react';

interface SettingsViewProps {
  monitoredDirectory: string;
  isMonitoring: boolean;
  onUpdateDirectory: (dir: string) => void;
  onToggleMonitoring: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  monitoredDirectory,
  isMonitoring,
  onUpdateDirectory,
  onToggleMonitoring,
}) => {
  const [targetDir, setTargetDir] = useState(monitoredDirectory);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetDir.trim()) {
      onUpdateDirectory(targetDir.trim());
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
          <Sliders className="h-5 w-5 text-cyan-400" />
          <span>FIM System Configuration & Policy Engine</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure monitored directory perimeters, continuous background scanning parameters, and heuristic policy thresholds.
        </p>
      </div>

      {/* Target Directory Configuration Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-mono font-semibold text-sm">
          <FolderCog className="h-4 w-4 text-cyan-400" />
          <span>Monitored File System Perimeter</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">
              Target Directory Path (Absolute or Relative):
            </label>
            <input
              type="text"
              value={targetDir}
              onChange={(e) => setTargetDir(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
              placeholder="/absolute/path/or/relative/path"
            />
            <p className="text-[11px] text-slate-500 mt-1 font-sans">
              Default is the safe simulation sandbox: <code className="text-cyan-300">demo_sandbox</code>. System performs automated sanitization to prevent path traversal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-semibold transition-colors"
            >
              Update Target Scope
            </button>
            <button
              type="button"
              onClick={() => setTargetDir('demo_sandbox')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            >
              Reset to Demo Sandbox
            </button>
            {savedMsg && (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Scope updated!</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Engine Status & Execution Mode */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-mono font-semibold text-sm">
            <Server className="h-4 w-4 text-cyan-400" />
            <span>Continuous Monitoring Daemon</span>
          </div>

          <button
            onClick={onToggleMonitoring}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              isMonitoring
                ? 'bg-rose-950 text-rose-300 border border-rose-700 hover:bg-rose-900'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-700 hover:bg-emerald-900'
            }`}
          >
            {isMonitoring ? <Square className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            <span>{isMonitoring ? 'Deactivate Engine' : 'Activate Engine'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          The background daemon utilizes Node.js kernel watcher events (<code className="text-cyan-300 font-mono">inotify / FSEvents</code>) to capture creation, modification, and deletion events immediately upon I/O flush.
        </p>
      </div>

      {/* Active Threat Detection Heuristics Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-mono font-semibold text-sm">
          <Shield className="h-4 w-4 text-cyan-400" />
          <span>Active Threat Heuristic Policies</span>
        </div>

        <div className="overflow-x-auto text-xs font-mono">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-3 py-2">Rule Identifier</th>
                <th className="px-3 py-2">Target Match</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="px-3 py-2.5 font-bold text-slate-200">DOUBLE_EXTENSION</td>
                <td className="px-3 py-2.5 text-cyan-300">*.pdf.exe, *.doc.vbs, etc.</td>
                <td className="px-3 py-2.5 text-rose-400 font-bold">CRITICAL</td>
                <td className="px-3 py-2.5 text-slate-400 font-sans">Detects executable files disguised as documents.</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-bold text-slate-200">EXECUTABLE_DROP</td>
                <td className="px-3 py-2.5 text-cyan-300">.exe, .sh, .bat, .bin, .py</td>
                <td className="px-3 py-2.5 text-orange-400 font-bold">HIGH</td>
                <td className="px-3 py-2.5 text-slate-400 font-sans">Flags newly created scripts or binary files in user directories.</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-bold text-slate-200">BURST_ACTIVITY</td>
                <td className="px-3 py-2.5 text-cyan-300">&gt;=3 modifications / 2000ms</td>
                <td className="px-3 py-2.5 text-rose-400 font-bold">CRITICAL</td>
                <td className="px-3 py-2.5 text-slate-400 font-sans">Identifies rapid bulk modifications characteristic of ransomware.</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-bold text-slate-200">CONFIG_TAMPER</td>
                <td className="px-3 py-2.5 text-cyan-300">*.conf, *.env, *.json, *.yml</td>
                <td className="px-3 py-2.5 text-orange-400 font-bold">HIGH</td>
                <td className="px-3 py-2.5 text-slate-400 font-sans">Flags changes to critical operational configuration files.</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-bold text-slate-200">LOG_DELETION</td>
                <td className="px-3 py-2.5 text-cyan-300">*.log, *audit*, *event*</td>
                <td className="px-3 py-2.5 text-amber-400 font-bold">MEDIUM</td>
                <td className="px-3 py-2.5 text-slate-400 font-sans">Detects potential defense evasion through log file deletion.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
