/**
 * @file ReportsView.tsx
 * @description Formal Digital Forensics Investigation Report Generator.
 * Formats evidence, cryptographic verification tables, and recommendations
 * for college cybersecurity grading and forensic demonstration.
 */

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  HardDrive,
  Calendar,
  User,
  Hash,
  ExternalLink
} from 'lucide-react';
import { ForensicReport } from '../types/fim';
import { getReport } from '../services/api';

export const ReportsView: React.FC = () => {
  const [investigatorName, setInvestigatorName] = useState('Cadet Forensic Examiner');
  const [caseTitle, setCaseTitle] = useState('CFS-2026-FIM-AUDIT-01');
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res = await getReport(investigatorName, caseTitle);
      if (res.success) {
        setReport(res.report);
      }
    } catch (err) {
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    if (!report) return;
    const md = `
# DIGITAL FORENSICS INVESTIGATION REPORT
**Report ID:** ${report.reportId}
**Case Title:** ${report.caseTitle}
**Investigator:** ${report.investigator}
**Generated:** ${report.generatedAt}
**Monitored Directory:** ${report.monitoredDirectory}

## 1. Executive Summary & Integrity Score
- Total Files Monitored: ${report.statistics.totalFilesScanned}
- Total Recorded Events: ${report.statistics.totalEvents}
- Modified Files: ${report.statistics.modifiedCount}
- Created Files: ${report.statistics.createdCount}
- Deleted Files: ${report.statistics.deletedCount}
- Suspicious Anomalies: ${report.statistics.suspiciousCount}
- High/Critical Alerts: ${report.statistics.highCriticalCount}
- Overall System Integrity Score: ${report.statistics.overallIntegrityScore}%

## 2. Cryptographic Baseline Details
- Baseline Created: ${report.baselineInfo.createdAt || 'N/A'}
- Baseline Certified Files: ${report.baselineInfo.totalBaselineFiles}
- Hashing Algorithm: SHA-256 (FIPS 180-4 standard)

## 3. Cryptographic Verification Table
| File Name | Path | Status | Baseline SHA-256 | Current SHA-256 | Size (bytes) |
|---|---|---|---|---|---|
${report.fileHashIntegrityTable.map(f => `| ${f.fileName} | ${f.path} | ${f.status} | ${f.baselineHash} | ${f.currentHash} | ${f.size} |`).join('\n')}

## 4. Forensic Recommendations
${report.investigationRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 5. Chain of Custody & Non-Destructive Hashing Guarantee
${report.chainOfCustodyNotice}
    `.trim();

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">

      {/* Control Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-cyan-400" />
              <span>Digital Forensics Investigation Report Generator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Exports a forensic-grade case report documenting cryptographic integrity, event chronologies, and investigator recommendations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              disabled={!report}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied MD' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={!report}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/40 transition-colors disabled:opacity-50"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Investigator input form */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div>
            <label className="text-slate-500 block mb-1">Lead Forensic Examiner:</label>
            <input
              type="text"
              value={investigatorName}
              onChange={(e) => setInvestigatorName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Case Number / Reference:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-500"
              />
              <button
                onClick={fetchReportData}
                disabled={loading}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs shrink-0 font-semibold"
              >
                {loading ? 'Compiling...' : 'Refresh Report'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Formal Printable Forensic Report Document */}
      {report && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-8 font-sans shadow-xl text-slate-200 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
          
          {/* Report Header */}
          <div className="border-b-2 border-slate-700 pb-6 print:border-black">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 print:text-blue-700 font-bold mb-1">
                  Department of Cyber Forensic Science & Digital Investigation
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white print:text-black font-mono">
                  FILE INTEGRITY & THREAT DETECTION AUDIT REPORT
                </h1>
                <p className="text-xs text-slate-400 print:text-gray-600 mt-1 font-mono">
                  Evidence Certified under Non-Destructive Cryptographic Verification (SHA-256)
                </p>
              </div>

              <div className="text-right font-mono text-xs text-slate-400 print:text-gray-600">
                <div className="font-bold text-white print:text-black text-sm">{report.reportId}</div>
                <div>Case: {report.caseTitle}</div>
                <div>Generated: {new Date(report.generatedAt).toLocaleString()}</div>
              </div>
            </div>

            {/* Investigator & Scope Pills */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 print:border-gray-300 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 print:text-gray-500 block">Lead Examiner:</span>
                <span className="text-slate-200 print:text-black font-semibold">{report.investigator}</span>
              </div>
              <div>
                <span className="text-slate-500 print:text-gray-500 block">Monitored Scope:</span>
                <span className="text-cyan-300 print:text-blue-800 font-semibold truncate block" title={report.monitoredDirectory}>
                  {report.monitoredDirectory}
                </span>
              </div>
              <div>
                <span className="text-slate-500 print:text-gray-500 block">Baseline Established:</span>
                <span className="text-slate-200 print:text-black font-semibold">
                  {report.baselineInfo.createdAt ? new Date(report.baselineInfo.createdAt).toLocaleTimeString() : 'None'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 print:text-gray-500 block">Integrity Health:</span>
                <span className="text-emerald-400 print:text-green-700 font-bold">
                  {report.statistics.overallIntegrityScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Forensic Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-cyan-400 print:text-blue-800 border-b border-slate-800 pb-1">
              1. Executive Summary & Telemetry Statistics
            </h3>
            <p className="text-xs text-slate-300 print:text-gray-700 leading-relaxed font-sans">
              During the active monitoring period, FileGuard AI tracked <strong>{report.statistics.totalFilesScanned}</strong> file system artifacts within the target perimeter.
              A total of <strong>{report.statistics.totalEvents}</strong> discrete file system changes were captured and passed through the heuristic threat detection engine.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono pt-2">
              <div className="p-2.5 bg-slate-950 print:bg-gray-100 rounded border border-slate-800 print:border-gray-300">
                <span className="text-slate-500 print:text-gray-600 block text-[10px]">TOTAL ARTIFACTS</span>
                <span className="text-lg font-bold text-white print:text-black">{report.statistics.totalFilesScanned}</span>
              </div>

              <div className="p-2.5 bg-slate-950 print:bg-gray-100 rounded border border-slate-800 print:border-gray-300">
                <span className="text-slate-500 print:text-gray-600 block text-[10px]">TOTAL EVENTS</span>
                <span className="text-lg font-bold text-cyan-400 print:text-blue-700">{report.statistics.totalEvents}</span>
              </div>

              <div className="p-2.5 bg-slate-950 print:bg-gray-100 rounded border border-slate-800 print:border-gray-300">
                <span className="text-slate-500 print:text-gray-600 block text-[10px]">MODIFIED FILES</span>
                <span className="text-lg font-bold text-amber-400 print:text-amber-700">{report.statistics.modifiedCount}</span>
              </div>

              <div className="p-2.5 bg-slate-950 print:bg-gray-100 rounded border border-slate-800 print:border-gray-300">
                <span className="text-slate-500 print:text-gray-600 block text-[10px]">CREATED FILES</span>
                <span className="text-lg font-bold text-emerald-400 print:text-green-700">{report.statistics.createdCount}</span>
              </div>

              <div className="p-2.5 bg-slate-950 print:bg-gray-100 rounded border border-slate-800 print:border-gray-300">
                <span className="text-slate-500 print:text-gray-600 block text-[10px]">DELETED FILES</span>
                <span className="text-lg font-bold text-rose-400 print:text-red-700">{report.statistics.deletedCount}</span>
              </div>

              <div className="p-2.5 bg-slate-950 print:bg-gray-100 rounded border border-slate-800 print:border-gray-300">
                <span className="text-slate-500 print:text-gray-600 block text-[10px]">CRITICAL ALERTS</span>
                <span className="text-lg font-bold text-rose-500 print:text-red-800">{report.statistics.highCriticalCount}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Cryptographic SHA-256 Verification Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-cyan-400 print:text-blue-800 border-b border-slate-800 pb-1">
              2. Cryptographic Hash Integrity Verification Matrix
            </h3>
            <p className="text-xs text-slate-400 print:text-gray-600">
              Comparison between gold master baseline hashes and live file digests. SHA-256 calculation executes via read-only stream to ensure complete non-destructive evidence handling.
            </p>

            <div className="border border-slate-800 print:border-gray-300 rounded-lg overflow-hidden text-xs font-mono">
              <table className="w-full text-left">
                <thead className="bg-slate-950 print:bg-gray-100 text-slate-400 print:text-black uppercase text-[10px] border-b border-slate-800 print:border-gray-300">
                  <tr>
                    <th className="px-3 py-2">Artifact Name</th>
                    <th className="px-3 py-2">Relative Path</th>
                    <th className="px-3 py-2">Size</th>
                    <th className="px-3 py-2">Integrity Status</th>
                    <th className="px-3 py-2">Baseline SHA-256</th>
                    <th className="px-3 py-2">Current SHA-256</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-200 text-[11px]">
                  {report.fileHashIntegrityTable.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                      <td className="px-3 py-2 font-semibold text-slate-200 print:text-black">
                        {row.fileName}
                      </td>
                      <td className="px-3 py-2 text-slate-400 print:text-gray-600 truncate max-w-[120px]">
                        {row.path}
                      </td>
                      <td className="px-3 py-2 text-slate-300 print:text-black">
                        {row.size} B
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          row.status === 'MATCH' ? 'text-emerald-400 bg-emerald-950/60 print:text-green-800' :
                          row.status === 'CHANGED' ? 'text-amber-400 bg-amber-950/60 print:text-amber-800' :
                          row.status === 'NEW' ? 'text-cyan-400 bg-cyan-950/60 print:text-blue-800' :
                          'text-rose-400 bg-rose-950/60 print:text-red-800'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-400 print:text-gray-600 truncate max-w-[140px]" title={row.baselineHash}>
                        {row.baselineHash}
                      </td>
                      <td className={`px-3 py-2 truncate max-w-[140px] font-semibold ${row.status === 'CHANGED' ? 'text-rose-400 print:text-red-700' : 'text-slate-300 print:text-black'}`} title={row.currentHash}>
                        {row.currentHash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Priority Security Alerts */}
          {report.criticalEvents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-rose-400 print:text-red-800 border-b border-slate-800 pb-1">
                3. High & Critical Severity Incident Detections
              </h3>
              <div className="space-y-2 text-xs font-mono">
                {report.criticalEvents.map((evt) => (
                  <div key={evt.id} className="p-3 bg-slate-950 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white print:text-black">
                        {evt.eventType}: {evt.fileName}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-900 text-rose-200 font-bold uppercase text-[10px]">
                        {evt.severity}
                      </span>
                    </div>
                    <p className="text-slate-300 print:text-gray-700 font-sans text-xs">
                      {evt.reason}
                    </p>
                    <p className="text-slate-500 print:text-gray-500 text-[10px]">
                      Recommended Action: {evt.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Investigation Recommendations */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-cyan-400 print:text-blue-800 border-b border-slate-800 pb-1">
              4. Forensic Examination Recommendations
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300 print:text-gray-800 list-decimal list-inside font-sans leading-relaxed">
              {report.investigationRecommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>

          {/* Section 5: Chain of Custody Statement & Signatures */}
          <div className="pt-4 border-t-2 border-slate-700 print:border-black space-y-4">
            <div className="p-3 bg-slate-950 print:bg-gray-100 rounded border border-slate-800 print:border-gray-300 text-xs font-mono text-slate-400 print:text-gray-600">
              <span className="font-bold text-cyan-400 print:text-blue-800 block mb-1">
                EVIDENCE INTEGRITY & CHAIN OF CUSTODY ASSURANCE:
              </span>
              <p>{report.chainOfCustodyNotice}</p>
            </div>

            <div className="pt-6 grid grid-cols-2 gap-8 text-xs font-mono">
              <div>
                <div className="border-b border-slate-600 print:border-black h-8 mb-1"></div>
                <span className="text-slate-400 print:text-gray-600">Examiner Signature / Date</span>
              </div>

              <div>
                <div className="border-b border-slate-600 print:border-black h-8 mb-1"></div>
                <span className="text-slate-400 print:text-gray-600">Lab Director / Peer Reviewer</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
