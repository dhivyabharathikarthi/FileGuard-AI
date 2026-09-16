/**
 * @file EventsView.tsx
 * @description Comprehensive Searchable and Filterable Audit Event Log.
 */

import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  FilePlus,
  FileEdit,
  FileX
} from 'lucide-react';
import { FimEvent, EventType, SeverityLevel } from '../types/fim';

interface EventsViewProps {
  events: FimEvent[];
  onSelectEvent: (event: FimEvent) => void;
  onClearEvents: () => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  onSelectEvent,
  onClearEvents,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [suspiciousOnly, setSuspiciousOnly] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const filteredEvents = events.filter(e => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      e.fileName.toLowerCase().includes(term) ||
      e.filePath.toLowerCase().includes(term) ||
      e.reason.toLowerCase().includes(term) ||
      (e.currentHash && e.currentHash.toLowerCase().includes(term)) ||
      (e.previousHash && e.previousHash.toLowerCase().includes(term));

    const matchesType = eventTypeFilter === 'ALL' || e.eventType === eventTypeFilter;
    const matchesSeverity = severityFilter === 'ALL' || e.severity === severityFilter;
    const matchesSuspicious = !suspiciousOnly || e.isSuspicious;

    return matchesSearch && matchesType && matchesSeverity && matchesSuspicious;
  });

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <History className="h-5 w-5 text-cyan-400" />
              <span>Real-Time Audit Event Log</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Immutable journal recording file creations, modifications, deletions, and cryptographic delta evaluations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearEvents}
              disabled={events.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Audit Log</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by file name, path, reason, or SHA-256..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Event Type Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-500">Event:</span>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Types</option>
              <option value="CREATED">CREATED</option>
              <option value="MODIFIED">MODIFIED</option>
              <option value="DELETED">DELETED</option>
              <option value="RENAMED">RENAMED</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-500">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* Suspicious Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800">
            <input
              type="checkbox"
              checked={suspiciousOnly}
              onChange={(e) => setSuspiciousOnly(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-amber-400 font-medium">Suspicious Only</span>
          </label>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">File / Artifact</th>
                <th className="px-4 py-3">Path</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Previous SHA-256</th>
                <th className="px-4 py-3">Current SHA-256</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Forensic Reason</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    No events logged matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.eventType === 'CREATED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        evt.eventType === 'MODIFIED' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {evt.eventType}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-200 truncate max-w-[140px]" title={evt.fileName}>
                      {evt.fileName}
                    </td>

                    <td className="px-4 py-3.5 text-slate-400 truncate max-w-[160px]" title={evt.filePath}>
                      {evt.filePath}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.severity === 'CRITICAL' ? 'bg-rose-900/80 text-rose-200 border border-rose-700' :
                        evt.severity === 'HIGH' ? 'bg-orange-900/80 text-orange-200 border border-orange-700' :
                        evt.severity === 'MEDIUM' ? 'bg-amber-900/80 text-amber-200 border border-amber-700' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {evt.severity}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      {evt.previousHash ? (
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-[11px] truncate max-w-[90px]" title={evt.previousHash}>
                            {evt.previousHash.substring(0, 7)}...
                          </span>
                          <button
                            onClick={(e) => handleCopy(evt.previousHash!, e)}
                            className="text-slate-500 hover:text-slate-300 p-0.5"
                          >
                            {copiedHash === evt.previousHash ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-[11px] italic">None</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {evt.currentHash ? (
                        <div className="flex items-center gap-1">
                          <span className="text-cyan-300 text-[11px] truncate max-w-[90px]" title={evt.currentHash}>
                            {evt.currentHash.substring(0, 7)}...
                          </span>
                          <button
                            onClick={(e) => handleCopy(evt.currentHash!, e)}
                            className="text-slate-500 hover:text-slate-300 p-0.5"
                          >
                            {copiedHash === evt.currentHash ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-rose-500 text-[11px] italic">Deleted</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        evt.hashStatus === 'MATCH' ? 'text-emerald-400 bg-emerald-950/60' :
                        evt.hashStatus === 'CHANGED' ? 'text-amber-400 bg-amber-950/60' :
                        evt.hashStatus === 'NEW' ? 'text-cyan-400 bg-cyan-950/60' :
                        'text-rose-400 bg-rose-950/60'
                      }`}>
                        {evt.hashStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-300 truncate max-w-[200px] font-sans" title={evt.reason}>
                      {evt.reason}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px]">
                        Inspect &rarr;
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
