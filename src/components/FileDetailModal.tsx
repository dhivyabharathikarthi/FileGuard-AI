/**
 * @file FileDetailModal.tsx
 * @description In-depth Forensic File & Event Dossier with AI Threat Explanation.
 */

import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  FileCode,
  Calendar,
  HardDrive,
  Hash,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  Search,
  ArrowRight
} from 'lucide-react';
import { FimEvent, FileRecord, AiThreatAnalysis } from '../types/fim';
import { explainThreat } from '../services/api';

interface FileDetailModalProps {
  item: FimEvent | FileRecord | null;
  onClose: () => void;
}

export const FileDetailModal: React.FC<FileDetailModalProps> = ({ item, onClose }) => {
  const [aiAnalysis, setAiAnalysis] = useState<AiThreatAnalysis | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  if (!item) return null;

  const isEvent = 'eventType' in item;
  const fileName = item.name || (item as FimEvent).fileName;
  const filePath = (item as FileRecord).path || (item as FimEvent).filePath;
  const fullPath = (item as FileRecord).fullPath || (item as FimEvent).fullPath;
  const size = (item as FileRecord).size || (item as FimEvent).fileSize || 0;
  const extension = item.extension;
  const currentHash = (item as FileRecord).sha256 || (item as FimEvent).currentHash || 'MISSING';
  const baselineHash = (item as FileRecord).baselineHash || (item as FimEvent).previousHash || 'None';
  const hashStatus = item.hashStatus;
  const modifiedAt = (item as FileRecord).modifiedAt || (item as FimEvent).timestamp;

  const eventSeverity = isEvent ? (item as FimEvent).severity : (hashStatus === 'CHANGED' ? 'HIGH' : 'LOW');
  const eventReason = isEvent ? (item as FimEvent).reason : (hashStatus === 'CHANGED' ? 'Cryptographic hash deviated from baseline.' : 'Compliant with trusted baseline.');
  const recommendation = isEvent ? (item as FimEvent).recommendation : 'Monitor for unauthorized changes.';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleRunAiAnalysis = async () => {
    setLoadingAi(true);
    try {
      let eventPayload: FimEvent;
      if (isEvent) {
        eventPayload = item as FimEvent;
      } else {
        eventPayload = {
          id: `MANUAL-${Date.now()}`,
          timestamp: new Date().toISOString(),
          eventType: hashStatus === 'NEW' ? 'CREATED' : (hashStatus === 'CHANGED' ? 'MODIFIED' : 'MODIFIED'),
          fileName,
          filePath,
          fullPath,
          fileSize: size,
          extension,
          previousHash: baselineHash !== 'None' ? baselineHash : null,
          currentHash: currentHash !== 'MISSING' ? currentHash : null,
          hashStatus,
          severity: eventSeverity,
          reason: eventReason,
          isSuspicious: eventSeverity === 'HIGH' || eventSeverity === 'CRITICAL',
          threatRules: [],
          recommendation,
        };
      }

      const res = await explainThreat(eventPayload);
      if (res.success) {
        setAiAnalysis(res.explanation);
      }
    } catch (err) {
      console.error('AI analysis request error:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white font-mono flex items-center gap-2">
                <span>{fileName}</span>
                {isEvent && (
                  <span className="text-xs px-2 py-0.5 rounded uppercase font-mono font-bold bg-slate-800 text-slate-300">
                    {(item as FimEvent).eventType}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 font-mono truncate max-w-md" title={filePath}>
                {filePath}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Threat Assessment & Status Bar */}
          <div className={`p-4 rounded-lg border flex items-start gap-3 ${
            eventSeverity === 'CRITICAL'
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
              : eventSeverity === 'HIGH'
              ? 'bg-orange-950/40 border-orange-800/60 text-orange-200'
              : eventSeverity === 'MEDIUM'
              ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
              : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
          }`}>
            <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold uppercase tracking-wider text-xs font-mono">
                  Threat Classification: {eventSeverity}
                </span>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold uppercase bg-slate-900/80 border border-slate-700">
                  Status: {hashStatus}
                </span>
              </div>
              <p className="text-slate-300 font-sans mb-1">{eventReason}</p>
              <p className="text-slate-400 font-mono text-[11px] italic">
                Recommendation: {recommendation}
              </p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <HardDrive className="h-3.5 w-3.5" />
                <span>File Size</span>
              </div>
              <span className="font-mono text-slate-200 font-medium">
                {size} bytes ({(size / 1024).toFixed(2)} KB)
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <FileCode className="h-3.5 w-3.5" />
                <span>Extension</span>
              </div>
              <span className="font-mono text-slate-200 font-medium">
                {extension || '(None)'}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 col-span-2">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Last Modified</span>
              </div>
              <span className="font-mono text-slate-200 font-medium">
                {new Date(modifiedAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Cryptographic SHA-256 Hashes Comparison */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Cryptographic Hash Analysis (SHA-256)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Read-Only Forensic Hash</span>
            </div>

            {/* Baseline Hash */}
            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-semibold text-cyan-400 font-mono">TRUSTED BASELINE SHA-256</span>
                <button
                  onClick={() => handleCopy(baselineHash, 'baseline')}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-300"
                >
                  {copiedHash === 'baseline' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedHash === 'baseline' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="font-mono text-xs text-slate-200 break-all select-all">
                {baselineHash}
              </p>
            </div>

            {/* Current Hash */}
            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className={`font-semibold font-mono ${currentHash !== baselineHash && baselineHash !== 'None' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  CURRENT FILE SHA-256
                </span>
                <button
                  onClick={() => handleCopy(currentHash, 'current')}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-300"
                >
                  {copiedHash === 'current' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedHash === 'current' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className={`font-mono text-xs break-all select-all ${currentHash !== baselineHash && baselineHash !== 'None' ? 'text-rose-300' : 'text-slate-200'}`}>
                {currentHash}
              </p>
            </div>

            {/* Hash Verdict */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              {baselineHash === currentHash ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Hashes match exactly. Cryptographic integrity verified intact.</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-400 font-mono">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Hashes diverge. 1 or more bytes have been modified since baseline creation.</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Threat Explanation Section */}
          <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white font-mono">
                    Google Gemini AI Threat Explanation
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Evidence-based cyber forensic incident breakdown
                  </p>
                </div>
              </div>

              {!aiAnalysis && (
                <button
                  id="btn-run-ai-explanation"
                  onClick={handleRunAiAnalysis}
                  disabled={loadingAi}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-sm transition-all disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{loadingAi ? 'Analyzing Evidence...' : 'Generate AI Explanation'}</span>
                </button>
              )}
            </div>

            {loadingAi && (
              <div className="py-6 flex flex-col items-center justify-center space-y-2 text-slate-400">
                <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-mono">Connecting to Gemini DFIR Intelligence Engine...</p>
              </div>
            )}

            {aiAnalysis && (
              <div className="space-y-4 pt-2 text-xs">
                {/* What happened & Why suspicious */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="font-semibold text-cyan-300 font-mono block mb-1">
                      1. What Happened?
                    </span>
                    <p className="text-slate-300 leading-relaxed font-sans">
                      {aiAnalysis.whatHappened}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="font-semibold text-amber-300 font-mono block mb-1">
                      2. Why Could This Be Suspicious?
                    </span>
                    <p className="text-slate-300 leading-relaxed font-sans">
                      {aiAnalysis.whySuspicious}
                    </p>
                  </div>
                </div>

                {/* Evidence Observed */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-200 font-mono block mb-1.5">
                    3. Observed Forensic Evidence (Factual)
                  </span>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside font-mono text-[11px]">
                    {aiAnalysis.evidenceObserved.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>

                {/* Investigator Checklist */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-semibold text-indigo-300 font-mono block mb-1.5">
                    4. Investigator Verification Checklist
                  </span>
                  <ul className="space-y-1.5 text-slate-300">
                    {aiAnalysis.investigatorChecklist.map((check, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowRight className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
                        <span>{check}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Next Steps */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-semibold text-emerald-300 font-mono block mb-1.5">
                    5. Recommended Next Steps
                  </span>
                  <ul className="space-y-1.5 text-slate-300">
                    {aiAnalysis.recommendedNextSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Confidence & Forensic Disclaimer */}
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <p className="font-mono text-slate-300">
                    <span className="text-cyan-400">Confidence Assessment:</span> {aiAnalysis.confidenceAssessment}
                  </p>
                  <p className="text-[10px] text-slate-500 italic">
                    {aiAnalysis.disclaimer}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono">
            FileGuard AI Forensic Inspection Window
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
