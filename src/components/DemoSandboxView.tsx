/**
 * @file DemoSandboxView.tsx
 * @description Educational Demonstration Sandbox & Attack Simulation Suite.
 * Allows college students to safely showcase live FIM detection in classroom presentations.
 */

import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Zap,
  RotateCcw,
  FileCode,
  FileWarning,
  FileX,
  FastForward,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  Info
} from 'lucide-react';
import { getDemoStatus, simulateDemoAction, setupDemo } from '../services/api';
import { DemoActionResponse } from '../types/fim';

interface DemoSandboxViewProps {
  onNavigateTab: (tab: any) => void;
  onRefreshAll: () => void;
}

export const DemoSandboxView: React.FC<DemoSandboxViewProps> = ({
  onNavigateTab,
  onRefreshAll,
}) => {
  const [sandboxPath, setSandboxPath] = useState('');
  const [sandboxFiles, setSandboxFiles] = useState<Array<{ name: string; size: number; modifiedAt: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [actionResult, setActionResult] = useState<DemoActionResponse | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await getDemoStatus();
      if (res.success) {
        setSandboxPath(res.status.path);
        setSandboxFiles(res.status.files);
      }
    } catch (err) {
      console.error('Error fetching demo status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSimulate = async (action: string) => {
    setLoading(true);
    setActionResult(null);
    try {
      const res = await simulateDemoAction(action);
      setActionResult(res);
      await fetchStatus();
      onRefreshAll();
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSandbox = async () => {
    setLoading(true);
    setActionResult(null);
    try {
      const res = await setupDemo();
      setActionResult({
        success: true,
        action: 'reset_sandbox',
        message: 'Sandbox successfully reset with clean sample files and baseline established.',
        details: res.message,
      });
      await fetchStatus();
      onRefreshAll();
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                Safe Academic Demonstration Lab
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Controlled File System Environment
              </span>
            </div>
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-emerald-400" />
              <span>Interactive Threat Simulation Suite</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Execute controlled, 100% harmless file system events to demonstrate how FileGuard AI evaluates cryptographic hash changes and heuristic alerts in real time.
            </p>
          </div>

          <button
            id="btn-reset-demo-sandbox"
            onClick={handleResetSandbox}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors font-semibold shadow-sm disabled:opacity-50"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reset Demo Sandbox</span>
          </button>
        </div>

        {/* Action result alert banner */}
        {actionResult && (
          <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-white font-mono">{actionResult.message}</span>
                {actionResult.details && (
                  <p className="text-slate-400 font-mono text-[11px] mt-0.5">{actionResult.details}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('events')}
                className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 text-xs font-mono flex items-center gap-1"
              >
                <span>View Event Log</span>
                <ArrowRight className="h-3 w-3" />
              </button>
              <button
                onClick={() => onNavigateTab('alerts')}
                className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 text-xs font-mono flex items-center gap-1"
              >
                <span>View Alert</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Current Sandbox Files Inventory */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2 text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <FolderOpen className="h-3.5 w-3.5 text-cyan-400" />
              <span>Current Sandbox Files ({sandboxPath}):</span>
            </span>
            <span className="text-slate-500">{sandboxFiles.length} files present</span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {sandboxFiles.map(f => (
              <span key={f.name} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                <span className="text-cyan-400">&bull;</span>
                <span>{f.name}</span>
                <span className="text-slate-500 text-[10px]">({(f.size / 1024).toFixed(1)} KB)</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Simulation Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* 1. Modify Config */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-400">
                <FileCode className="h-5 w-5" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                MODIFIED &bull; HIGH
              </span>
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              1. Modify Configuration File
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              <strong>Scenario:</strong> An adversary alters application configuration parameters to inject unauthorized settings.
            </p>
            <div className="mt-3 p-2.5 bg-slate-950 rounded border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
              <p><span className="text-slate-300">Action:</span> Appends simulated malicious flag to <code className="text-cyan-300">sample_config.txt</code></p>
              <p><span className="text-slate-300">Detection:</span> Cryptographic hash change + Critical Config Heuristic</p>
            </div>
          </div>

          <button
            onClick={() => handleSimulate('modify_config')}
            disabled={loading}
            className="w-full py-2 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 rounded-lg text-xs font-mono font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Simulate Config Tamper</span>
          </button>
        </div>

        {/* 2. Create Executable */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-orange-950/60 border border-orange-800/60 text-orange-400">
                <FileWarning className="h-5 w-5" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-950 text-orange-300 border border-orange-800">
                CREATED &bull; HIGH
              </span>
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              2. Inject Executable Script
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              <strong>Scenario:</strong> Malware or backdoor script placed in a non-binary document directory.
            </p>
            <div className="mt-3 p-2.5 bg-slate-950 rounded border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
              <p><span className="text-slate-300">Action:</span> Creates harmless shell script <code className="text-cyan-300">suspicious_script.sh</code></p>
              <p><span className="text-slate-300">Detection:</span> Executable file type heuristic in monitored folder</p>
            </div>
          </div>

          <button
            onClick={() => handleSimulate('create_executable')}
            disabled={loading}
            className="w-full py-2 bg-orange-950/80 hover:bg-orange-900 text-orange-300 border border-orange-700/60 rounded-lg text-xs font-mono font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Simulate Script Drop</span>
          </button>
        </div>

        {/* 3. Double Extension File */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                CREATED &bull; CRITICAL
              </span>
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              3. Double Extension Masquerade
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              <strong>Scenario:</strong> Phishing payload disguised as a document (e.g., PDF) but executing as binary.
            </p>
            <div className="mt-3 p-2.5 bg-slate-950 rounded border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
              <p><span className="text-slate-300">Action:</span> Drops dummy <code className="text-cyan-300">urgent_invoice.pdf.exe</code></p>
              <p><span className="text-slate-300">Detection:</span> Double extension masquerade signature rule</p>
            </div>
          </div>

          <button
            onClick={() => handleSimulate('create_double_extension')}
            disabled={loading}
            className="w-full py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 rounded-lg text-xs font-mono font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Simulate Double Ext</span>
          </button>
        </div>

        {/* 4. Delete Log File */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-400">
                <FileX className="h-5 w-5" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                DELETED &bull; MEDIUM
              </span>
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              4. Evidence Log Deletion
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              <strong>Scenario:</strong> An intruder deletes audit log files to cover tracks and impede forensic recovery.
            </p>
            <div className="mt-3 p-2.5 bg-slate-950 rounded border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
              <p><span className="text-slate-300">Action:</span> Removes <code className="text-cyan-300">sample_log.txt</code></p>
              <p><span className="text-slate-300">Detection:</span> Baseline missing record + Log Deletion Heuristic</p>
            </div>
          </div>

          <button
            onClick={() => handleSimulate('delete_log')}
            disabled={loading}
            className="w-full py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 rounded-lg text-xs font-mono font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Simulate Log Deletion</span>
          </button>
        </div>

        {/* 5. Rapid Changes Burst Attack */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-400">
                <FastForward className="h-5 w-5" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                BURST &bull; CRITICAL
              </span>
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              5. Rapid Changes (Burst Tamper)
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              <strong>Scenario:</strong> Ransomware encryptor or automated wiper altering multiple files in under 2 seconds.
            </p>
            <div className="mt-3 p-2.5 bg-slate-950 rounded border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
              <p><span className="text-slate-300">Action:</span> Modifies 3 files simultaneously with timestamp entropy</p>
              <p><span className="text-slate-300">Detection:</span> Sliding window burst frequency analyzer</p>
            </div>
          </div>

          <button
            onClick={() => handleSimulate('rapid_tamper')}
            disabled={loading}
            className="w-full py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 rounded-lg text-xs font-mono font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Simulate Burst Attack</span>
          </button>
        </div>

        {/* 6. Benign Modification */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                BENIGN &bull; LOW/MED
              </span>
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              6. Routine User Edit
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              <strong>Scenario:</strong> Standard authorized user workflow editing a regular document note.
            </p>
            <div className="mt-3 p-2.5 bg-slate-950 rounded border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
              <p><span className="text-slate-300">Action:</span> Edits <code className="text-cyan-300">sample_document.txt</code> with harmless notes</p>
              <p><span className="text-slate-300">Detection:</span> Hash deviation without suspicious rule triggers</p>
            </div>
          </div>

          <button
            onClick={() => handleSimulate('routine_edit')}
            disabled={loading}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Simulate Routine Edit</span>
          </button>
        </div>

      </div>

    </div>
  );
};
