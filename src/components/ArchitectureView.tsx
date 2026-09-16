/**
 * @file ArchitectureView.tsx
 * @description Academic DFIR Architecture, Theory, and College Presentation Guide.
 */

import React from 'react';
import {
  BookOpen,
  Layers,
  Hash,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  FileCheck2,
  Lock,
  ArrowRight,
  HelpCircle,
  Award,
  CheckCircle2
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-500/30">
            Digital Forensics & Incident Response (DFIR)
          </span>
          <span className="text-xs text-slate-400 font-mono">College Project Academic Reference</span>
        </div>
        <h1 className="text-2xl font-bold text-white font-mono">
          System Architecture & Cyber Forensic Theory
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          FileGuard AI is designed around foundational principles of cryptographic data integrity, real-time operating system kernel watchers, non-destructive evidence gathering, and heuristic threat categorization.
        </p>
      </div>

      {/* Interactive System Architecture Workflow Diagram */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <Layers className="h-5 w-5 text-cyan-400" />
            <span>FIM Data Flow & Detection Pipeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end telemetry pipeline from raw file-system events to verified forensic intelligence.
          </p>
        </div>

        {/* Pipeline Visual Flow */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 text-xs font-mono items-stretch">
          
          {/* Step 1 */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] text-cyan-400 font-bold block mb-1">STAGE 01</span>
              <h4 className="font-semibold text-white">Target Scope</h4>
              <p className="text-slate-400 text-[11px] mt-1 font-sans">
                Recursively indexed target directory perimeter.
              </p>
            </div>
            <span className="text-[10px] text-slate-500">I/O Ingress</span>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] text-cyan-400 font-bold block mb-1">STAGE 02</span>
              <h4 className="font-semibold text-white">OS Watcher</h4>
              <p className="text-slate-400 text-[11px] mt-1 font-sans">
                Real-time filesystem events (add, change, unlink).
              </p>
            </div>
            <span className="text-[10px] text-slate-500">chokidar engine</span>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-cyan-500/40 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] text-cyan-400 font-bold block mb-1">STAGE 03</span>
              <h4 className="font-semibold text-white">SHA-256 Stream</h4>
              <p className="text-slate-400 text-[11px] mt-1 font-sans">
                Read-only byte stream hashing without touching atime.
              </p>
            </div>
            <span className="text-[10px] text-emerald-400">Non-Destructive</span>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] text-cyan-400 font-bold block mb-1">STAGE 04</span>
              <h4 className="font-semibold text-white">Baseline Diff</h4>
              <p className="text-slate-400 text-[11px] mt-1 font-sans">
                Exact string comparison against certified gold master.
              </p>
            </div>
            <span className="text-[10px] text-slate-500">Hash Verdict</span>
          </div>

          {/* Step 5 */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] text-cyan-400 font-bold block mb-1">STAGE 05</span>
              <h4 className="font-semibold text-white">Threat Engine</h4>
              <p className="text-slate-400 text-[11px] mt-1 font-sans">
                Evaluates extension masquerading, burst attacks, etc.
              </p>
            </div>
            <span className="text-[10px] text-amber-400">Rule Heuristics</span>
          </div>

          {/* Step 6 */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-indigo-500/40 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] text-indigo-400 font-bold block mb-1">STAGE 06</span>
              <h4 className="font-semibold text-white">Gemini AI</h4>
              <p className="text-slate-400 text-[11px] mt-1 font-sans">
                Formulates evidence checklist and root-cause analysis.
              </p>
            </div>
            <span className="text-[10px] text-indigo-400">AI Reasoning</span>
          </div>

          {/* Step 7 */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] text-cyan-400 font-bold block mb-1">STAGE 07</span>
              <h4 className="font-semibold text-white">SOC & Audit</h4>
              <p className="text-slate-400 text-[11px] mt-1 font-sans">
                Visual alerts, chain of custody logs, printable PDF.
              </p>
            </div>
            <span className="text-[10px] text-slate-500">Final Artifact</span>
          </div>

        </div>
      </div>

      {/* Core Educational Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Cryptographic Hashing Theory */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Hash className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              1. Cryptographic Hashing: Why SHA-256?
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Cryptographic hash functions are deterministic mathematical algorithms that map arbitrary-size data to a fixed-size bit string (256 bits / 64 hex characters).
          </p>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside font-mono">
            <li>
              <strong className="text-slate-200">Pre-image Resistance:</strong> Computationally infeasible to reverse-engineer the original file content from the hash digest.
            </li>
            <li>
              <strong className="text-slate-200">Collision Resistance:</strong> No two distinct files can produce identical SHA-256 hashes ($2^{128}$ operational security).
            </li>
            <li>
              <strong className="text-slate-200">The Avalanche Effect:</strong> Changing even a single bit in a file changes approximately 50% of the output hash digest.
            </li>
            <li>
              <strong className="text-slate-200">Why not MD5 or SHA-1?</strong> MD5 and SHA-1 have been broken by practical chosen-prefix collision attacks. SHA-256 remains the NIST FIPS 180-4 standard for forensic verification.
            </li>
          </ul>
        </div>

        {/* 2. Benign vs Malicious Activity */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              2. Benign Modification vs. Threat
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A hash mismatch proves a file changed, but cannot inherently reveal intent. FileGuard AI uses multi-parameter heuristics to categorize risk:
          </p>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">Benign Modification (LOW):</span>
              <p className="text-slate-400 font-sans">
                A text document edited by an authorized user during normal business hours without rapid bursts or script drops.
              </p>
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="text-rose-400 font-bold block mb-1">Suspicious Indicators (HIGH / CRITICAL):</span>
              <p className="text-slate-400 font-sans">
                Rapid alteration of 3+ files in &lt;2s (ransomware marker), creation of double extensions (.pdf.exe), or deletion of security audit logs.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Non-Destructive Monitoring Principles */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              3. Non-Destructive Forensics (Chain of Custody)
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In Digital Forensics, evidence preservation is paramount. Adhering to ISO/IEC 27037 standards:
          </p>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside font-mono">
            <li>
              <strong className="text-slate-200">Read-Only Operations:</strong> FileGuard AI opens file descriptors exclusively in read-only mode (<code className="text-cyan-300">fs.createReadStream</code>).
            </li>
            <li>
              <strong className="text-slate-200">No Auto-Quarantine/Deletion:</strong> The application never alters, moves, encrypts, or deletes target files during monitoring.
            </li>
            <li>
              <strong className="text-slate-200">Chain of Custody:</strong> Every event records exact millisecond timestamps, pre-event hashes, and post-event hashes.
            </li>
          </ul>
        </div>

        {/* 4. Industry Compliance Standards */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-500/30">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              4. Industry Compliance Frameworks
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            File Integrity Monitoring is a mandatory security requirement in modern enterprise compliance:
          </p>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside font-mono">
            <li>
              <strong className="text-slate-200">PCI-DSS Requirement 11.5:</strong> Deploy file-integrity monitoring tools to alert personnel to unauthorized modification of critical system files or configuration files.
            </li>
            <li>
              <strong className="text-slate-200">NIST SP 800-53 (SI-7):</strong> Software, Firmware, and Information Integrity verification controls.
            </li>
            <li>
              <strong className="text-slate-200">CIS Critical Security Controls:</strong> Control 10 (Data Protection) and Control 13 (Network Monitoring).
            </li>
          </ul>
        </div>

      </div>

      {/* Viva / College Presentation Q&A Cheat Sheet */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-400" />
          <h3 className="text-base font-bold text-white font-mono">
            College Viva / Defense Presentation Q&A Guide
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Key questions professors frequently ask during college cyber forensic science capstone evaluations:
        </p>

        <div className="space-y-3 text-xs font-mono">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4" />
              <span>Q1: Why can't we just rely on OS modification timestamps (mtime)?</span>
            </span>
            <p className="text-slate-300 font-sans text-xs pl-5">
              Timestamps are easily manipulated by attackers via standard utilities (e.g., the Linux <code className="text-cyan-300">touch -d</code> command or Windows timestomping APIs). Only cryptographic hashes inspect the actual byte contents of the file, making stealthy modification mathematically impossible to hide.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4" />
              <span>Q2: What happens if an attacker compromises the baseline file itself?</span>
            </span>
            <p className="text-slate-300 font-sans text-xs pl-5">
              In production DFIR environments, baseline databases are digitally signed with an asymmetric private key or stored on WORM (Write Once, Read Many) tamper-evident storage / hardware security modules (HSMs). In FileGuard AI, the baseline is certified with an audit timestamp and cryptographic count.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4" />
              <span>Q3: How does FileGuard AI handle the role of AI in forensic analysis?</span>
            </span>
            <p className="text-slate-300 font-sans text-xs pl-5">
              AI (Google Gemini) serves strictly as an advisory, explanatory layer. It NEVER replaces hard cryptographic evidence. It formulates investigator checklists and contextual explanations while explicitly separating factual observations from hypotheses.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
