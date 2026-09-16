/**
 * @file FileMonitorView.tsx
 * @description Recursive File Explorer displaying real-time SHA-256 cryptographic digests & integrity status.
 */

import React, { useState } from 'react';
import {
  FolderLock,
  Search,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  FilePlus,
  FileX,
  FileText,
  FileCode,
  HardDrive
} from 'lucide-react';
import { FileRecord, HashStatus } from '../types/fim';

interface FileMonitorViewProps {
  files: FileRecord[];
  monitoredDirectory: string;
  loading: boolean;
  onRefresh: () => void;
  onSelectFile: (file: FileRecord) => void;
  onUpdateDirectory: (dir: string) => void;
}

export const FileMonitorView: React.FC<FileMonitorViewProps> = ({
  files,
  monitoredDirectory,
  loading,
  onRefresh,
  onSelectFile,
  onUpdateDirectory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [customPath, setCustomPath] = useState(monitoredDirectory);
  const [isEditingPath, setIsEditingPath] = useState(false);

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.sha256.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || f.hashStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyHash = (hash: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleSavePath = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPath.trim()) {
      onUpdateDirectory(customPath.trim());
      setIsEditingPath(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header & Monitored Directory Configuration */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <FolderLock className="h-5 w-5 text-cyan-400" />
              <span>Recursive File System Inventory</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active read-only cryptographic index calculated via streaming SHA-256 algorithm.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Scanning...' : 'Rescan Directory'}</span>
            </button>
          </div>
        </div>

        {/* Directory Target Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono w-full sm:w-auto">
            <span className="text-slate-500 shrink-0">Monitored Root:</span>
            {!isEditingPath ? (
              <span className="text-cyan-300 font-semibold bg-slate-950 px-2.5 py-1 rounded border border-slate-800 truncate max-w-lg">
                {monitoredDirectory}
              </span>
            ) : (
              <form onSubmit={handleSavePath} className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  className="bg-slate-950 text-cyan-300 px-2.5 py-1 rounded border border-cyan-500 text-xs font-mono outline-none w-full sm:w-80"
                  placeholder="Enter absolute or relative directory path"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-mono"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPath(false)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>

          {!isEditingPath && (
            <button
              onClick={() => setIsEditingPath(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline"
            >
              Change Target Path
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by file name, path, or SHA-256 hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All ({files.length})
          </button>
          <button
            onClick={() => setStatusFilter('MATCH')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'MATCH'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Match
          </button>
          <button
            onClick={() => setStatusFilter('CHANGED')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'CHANGED'
                ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Changed
          </button>
          <button
            onClick={() => setStatusFilter('NEW')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'NEW'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Unbaselined (New)
          </button>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">File Name</th>
                <th className="px-5 py-3">Relative Path</th>
                <th className="px-5 py-3">Size</th>
                <th className="px-5 py-3">Ext</th>
                <th className="px-5 py-3">Modified</th>
                <th className="px-5 py-3">SHA-256 Digest</th>
                <th className="px-5 py-3 text-center">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    No files found matching the current search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr
                    key={file.path}
                    onClick={() => onSelectFile(file)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-semibold text-slate-200 flex items-center gap-2">
                      {file.isConfiguration ? (
                        <FileCode className="h-4 w-4 text-cyan-400 shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate max-w-[180px]">{file.name}</span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-400 truncate max-w-xs" title={file.path}>
                      {file.path}
                    </td>

                    <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">
                      {(file.size / 1024).toFixed(1)} KB
                    </td>

                    <td className="px-5 py-3.5 text-slate-400 uppercase">
                      {file.extension || 'None'}
                    </td>

                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                      {new Date(file.modifiedAt).toLocaleTimeString()}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-cyan-300/90 text-[11px] truncate max-w-[140px]" title={file.sha256}>
                          {file.sha256 ? `${file.sha256.substring(0, 8)}...${file.sha256.substring(56)}` : 'N/A'}
                        </span>
                        <button
                          onClick={(e) => handleCopyHash(file.sha256, e)}
                          className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors"
                          title="Copy Full SHA-256 Digest"
                        >
                          {copiedHash === file.sha256 ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        file.hashStatus === 'MATCH'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : file.hashStatus === 'CHANGED'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : file.hashStatus === 'NEW'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {file.hashStatus === 'MATCH' && <ShieldCheck className="h-3 w-3" />}
                        {file.hashStatus === 'CHANGED' && <AlertTriangle className="h-3 w-3" />}
                        {file.hashStatus === 'NEW' && <FilePlus className="h-3 w-3" />}
                        {file.hashStatus === 'MISSING' && <FileX className="h-3 w-3" />}
                        <span>{file.hashStatus}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
