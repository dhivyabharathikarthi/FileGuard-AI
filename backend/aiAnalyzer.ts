/**
 * @file aiAnalyzer.ts
 * @description Forensic AI Threat Explanation Service powered by Google Gemini.
 * Formulates evidence-based investigative summaries adhering to digital forensics standards:
 * - Distinguishes between verified factual evidence and working hypotheses.
 * - Never claims an artifact is definitive malware without dynamic binary execution proof.
 */

import { GoogleGenAI } from '@google/genai';
import { FimEvent, AiThreatAnalysis } from '../types/fim.js';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

/**
 * Fallback forensic analyzer when Gemini API is unavailable or offline.
 * Provides high-standard digital forensics breakdown based on forensic rules and metadata.
 */
function generateForensicRuleAnalysis(event: FimEvent): AiThreatAnalysis {
  const rules = event.threatRules.map(r => `${r.ruleName}: ${r.description}`).join('; ');
  
  return {
    eventId: event.id,
    fileName: event.fileName,
    timestamp: event.timestamp,
    whatHappened: `File system monitoring recorded an event of type "${event.eventType}" on artifact "${event.fileName}" at path "${event.filePath}". The previous cryptographic state (${event.previousHash ? event.previousHash.substring(0, 16) + '...' : 'None'}) was superseded by current state (${event.currentHash ? event.currentHash.substring(0, 16) + '...' : 'Missing/Deleted'}).`,
    whySuspicious: `The observed event triggered security rules: ${rules || event.reason}. Changes to files outside an approved maintenance window or unexpected changes to binaries and configurations indicate potential unauthorized persistence, credential tampering, or staging.`,
    evidenceObserved: [
      `File Name: ${event.fileName}`,
      `Path: ${event.filePath}`,
      `Event Type: ${event.eventType}`,
      `File Size: ${event.fileSize} bytes`,
      `Baseline SHA-256: ${event.previousHash || 'Not in baseline'}`,
      `Current SHA-256: ${event.currentHash || 'Artifact deleted'}`,
      `Severity Level: ${event.severity}`,
      ...event.threatRules.map(r => `Rule Match: ${r.ruleName} (${r.evidence})`),
    ],
    investigatorChecklist: [
      `Check operating system process creation logs (e.g., Sysmon Event ID 1 or auditd) around ${event.timestamp}.`,
      `Identify the originating User ID (UID) and Process ID (PID) that held write handles to ${event.fileName}.`,
      `Cross-reference internal change management ticketing systems to confirm if an authorized change was scheduled.`,
      `Inspect parent processes (PPID) to determine if this file was written by an interactive shell, web server, or script interpreter.`,
      `If the file is a binary or script, perform static analysis (strings extraction, entropy calculation) in an isolated sandbox.`,
    ],
    recommendedNextSteps: [
      `Preserve volatile memory and write-block the physical or virtual disk if unauthorized intrusion is suspected.`,
      `Isolate the host or subnet if multiple rapid modifications or encryption markers were flagged.`,
      `If verified as authorized administrative activity, refresh the trusted FIM baseline to acknowledge the new SHA-256 hash.`,
    ],
    confidenceAssessment: `Preliminary heuristic evaluation: Observed evidence warrants "Requires Investigation" classification (Severity: ${event.severity}). Definitive attribution requires host-level process telemetry.`,
    disclaimer: 'DISCLAIMER (Digital Forensics Standard): This assessment is based purely on filesystem metadata and cryptographic hash integrity comparison. It does not constitute proof of malicious intent or conclusive malware identification.',
    isAiGenerated: false,
  };
}

/**
 * Analyzes a suspicious FIM event using Gemini AI with fallback to forensic heuristics.
 */
export async function explainThreatWithAi(event: FimEvent): Promise<AiThreatAnalysis> {
  const ai = getGeminiClient();

  if (!ai) {
    console.log('[AI Analyzer] GEMINI_API_KEY not configured. Utilizing forensic rule fallback.');
    return generateForensicRuleAnalysis(event);
  }

  const prompt = `
You are a senior Digital Forensics and Incident Response (DFIR) specialist evaluating a File Integrity Monitoring (FIM) event for a college cybersecurity demonstration.

EVENT DETAILS:
- File Name: ${event.fileName}
- File Path: ${event.filePath}
- Event Type: ${event.eventType}
- Severity: ${event.severity}
- File Size: ${event.fileSize} bytes
- Extension: ${event.extension}
- Baseline SHA-256 Hash: ${event.previousHash || 'None (New file)'}
- Current SHA-256 Hash: ${event.currentHash || 'None (Deleted)'}
- Detected Reason: ${event.reason}
- Triggered Rules: ${JSON.stringify(event.threatRules)}

STRICT FORENSIC GUIDELINES:
1. Clearly distinguish between verified physical EVIDENCE (what was actually logged) and WORKING ASSUMPTIONS (hypotheses).
2. NEVER declare that a file is definitively "malware" without dynamic/static reverse engineering proof. Use terms like "Potentially Suspicious" or "Requires Investigation".
3. Provide concrete forensic investigative questions and next steps suitable for a cybersecurity student or forensic analyst.

Respond ONLY with valid JSON matching this exact structure:
{
  "whatHappened": "Clear factual explanation of the file modification/creation/deletion and hash transition",
  "whySuspicious": "Technical explanation of why this pattern raises forensic concern",
  "evidenceObserved": ["Array of bullet points of confirmed factual evidence"],
  "investigatorChecklist": ["5 specific artifacts, logs, or system indicators the examiner should check"],
  "recommendedNextSteps": ["3-4 ordered remediation or preservation steps"],
  "confidenceAssessment": "Statement of confidence regarding suspiciousness vs benign possibility"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        eventId: event.id,
        fileName: event.fileName,
        timestamp: event.timestamp,
        whatHappened: parsed.whatHappened || 'File modification detected.',
        whySuspicious: parsed.whySuspicious || 'Event deviated from baseline.',
        evidenceObserved: parsed.evidenceObserved || [],
        investigatorChecklist: parsed.investigatorChecklist || [],
        recommendedNextSteps: parsed.recommendedNextSteps || [],
        confidenceAssessment: parsed.confidenceAssessment || 'Requires investigation.',
        disclaimer: 'DISCLAIMER (Digital Forensics Standard): This AI-assisted forensic assessment is advisory and evidence-based. It does not prove malicious intent without corroborating host telemetry.',
        isAiGenerated: true,
      };
    }
  } catch (err) {
    console.error('Gemini AI analysis error, falling back to forensic heuristics:', err);
  }

  return generateForensicRuleAnalysis(event);
}
