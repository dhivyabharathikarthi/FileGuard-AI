/**
 * @file BaselineView.tsx
 * @description Trusted Cryptographic Baseline Management.
 * Certifies known-good cryptographic hashes and records audit timestamps.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Download,
  Copy,
  Check,
  Search,
  Database,
  Calendar,
  HardDrive
} from 'lucide-react';
import { BaselineData, BaselineRecord } from '../types/fim';

interface BaselineViewProps {
  baseline: BaselineData | null;
  loading: boolean;
  onCreateBaseline: () => Promise<void>;
}

export const BaselineView: React.FC<BaselineViewProps> = ({
  baseline,
  loading,
  onCreateBaseline,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const baselineFiles: BaselineRecord[] = baseline?.files ? Object.values(baseline.files) : [];

  const filteredFiles = baselineFiles.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.sha256.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExportJson = () => {
    if (!baseline) return;
    const blob = new Blob([JSON.stringify(baseline, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fim_baseline_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* Baseline Overview Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                Gold Master Baseline
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Cryptographic Anchor
              </span>
            </div>
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>Trusted Baseline Management</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Maintains the verified, authorized cryptographic state against which all future modifications are evaluated.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              disabled={!baseline}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              id="btn-trigger-baseline-refresh"
              onClick={() => setShowConfirmModal(true)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-mono bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/50 transition-colors font-medium shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Calculating Hashes...' : 'Update Trusted Baseline'}</span>
            </button>
          </div>
        </div>

        {/* Explicit Digital Forensics Warning Notice */}
        <div className="mt-4 p-3.5 rounded-lg bg-amber-950/40 border border-amber-800/60 flex items-start gap-3 text-xs">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-300 uppercase tracking-wider font-mono">
              SECURITY WARNING: Baseline Establishment Certification
            </p>
            <p className="text-slate-300 leading-relaxed font-sans">
              Updating or refreshing the baseline accepts the <span className="text-white font-semibold">current state of all files and their current SHA-256 hashes as trusted</span>.
              If an unauthorized intruder or malicious script has altered a file, establishing a new baseline without thorough investigation will treat that altered artifact as legitimate.
            </p>
          </div>
        </div>

        {/* Metadata stats */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 block mb-1">Baseline Timestamp:</span>
            <span className="text-slate-200 font-semibold">
              {baseline ? new Date(baseline.createdAt).toLocaleString() : 'No baseline created yet'}
            </span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 block mb-1">Total Certified Files:</span>
            <span className="text-emerald-400 font-semibold">
              {baseline ? baseline.totalFiles : 0} artifacts
            </span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 block mb-1">Hashing Standard:</span>
            <span className="text-cyan-400 font-semibold">
              FIPS 180-4 SHA-256 (256-bit digest)
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Filter baseline records by file name, path, or hash..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Stored Baseline Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">File Name</th>
                <th className="px-5 py-3">Relative Path</th>
                <th className="px-5 py-3">Size</th>
                <th className="px-5 py-3">Certified SHA-256 Hash</th>
                <th className="px-5 py-3">Record Timestamp</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    {baseline ? 'No baseline records match the search filter.' : 'No baseline established yet. Click "Update Trusted Baseline" above.'}
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.path} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-200">
                      {file.name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 truncate max-w-xs" title={file.path}>
                      {file.path}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">
                      {(file.size / 1024).toFixed(1)} KB
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-cyan-300/90 text-[11px] select-all font-mono" title={file.sha256}>
                        {file.sha256.substring(0, 10)}...{file.sha256.substring(54)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(file.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleCopyHash(file.sha256)}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                      >
                        {copiedHash === file.sha256 ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedHash === file.sha256 ? 'Copied' : 'Copy'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2 rounded-lg bg-amber-950 border border-amber-700/50">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold font-mono text-white">
                Confirm Baseline Update
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to rescan and establish the current directory contents as the trusted baseline?
            </p>
            <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded border border-slate-800 font-mono">
              All modified, created, or deleted files will be reconciled, and their current SHA-256 hashes will be certified as the new authorized state.
            </p>

            <div className="flex justify-end gap-2 pt-2 text-xs font-mono">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-baseline"
                onClick={async () => {
                  setShowConfirmModal(false);
                  await onCreateBaseline();
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-md font-semibold transition-colors"
              >
                Yes, Update Baseline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
