/**
 * @file threatEngine.ts
 * @description Rule-Based Threat Detection Engine for File Integrity Monitoring.
 * Evaluates file system events against forensic heuristics.
 *
 * NOTE FOR FORENSIC INVESTIGATORS:
 * Rule matches classify events as "Potentially Suspicious" or "Requires Investigation"
 * based on observed behavioral anomalies, never confirming malicious intent without
 * dynamic/static binary analysis and forensic corroboration.
 */

import path from 'path';
import { EventType, SeverityLevel, ThreatRuleTrigger } from '../types/fim.js';

// Suspicious double extensions often used in social engineering attacks
const DOUBLE_EXTENSION_REGEX = /\.(pdf|docx?|xlsx?|txt|jpg|png|mp4)\.(exe|bat|cmd|vbs|ps1|scr|js|sh)$/i;

// Ransomware / encryptor markers
const RANSOM_EXTENSIONS = new Set([
  '.locked', '.crypto', '.crypt', '.ransom', '.enc', '.wnry', '.crypted', '.vault'
]);

// Protected critical configurations & credentials
const CRITICAL_FILES = new Set([
  'config.json', 'settings.json', '.env', 'hosts', 'passwd', 'shadow',
  'authorized_keys', 'id_rsa', 'master.key', 'credentials.ini', 'web.config'
]);

const EXECUTABLE_EXTENSIONS = new Set([
  '.exe', '.dll', '.bin', '.elf', '.sh', '.bat', '.ps1', '.cmd', 
  '.vbs', '.js', '.vbe', '.wsf', '.scr', '.com', '.msi'
]);

// Sliding window tracker for burst activity
interface RecentChange {
  timestamp: number;
  filePath: string;
}

const recentModifications: RecentChange[] = [];
const BURST_WINDOW_MS = 6000; // 6 seconds window
const BURST_THRESHOLD = 3;    // 3 modifications within window triggers alert

/**
 * Prunes the modification buffer and checks for rapid modification anomalies.
 */
function checkBurstActivity(filePath: string): { isBurst: boolean; count: number } {
  const now = Date.now();
  recentModifications.push({ timestamp: now, filePath });

  // Keep only events within sliding window
  const validIndex = recentModifications.findIndex(item => now - item.timestamp < BURST_WINDOW_MS);
  if (validIndex > 0) {
    recentModifications.splice(0, validIndex);
  }

  const count = recentModifications.length;
  return {
    isBurst: count >= BURST_THRESHOLD,
    count
  };
}

/**
 * Counts how many times a specific file path was modified recently.
 */
function checkRepeatedFileChanges(filePath: string): number {
  const now = Date.now();
  return recentModifications.filter(
    item => item.filePath === filePath && now - item.timestamp < BURST_WINDOW_MS
  ).length;
}

export interface EvaluationInput {
  eventType: EventType;
  fileName: string;
  filePath: string;
  previousSize?: number;
  currentSize?: number;
  previousHash?: string | null;
  currentHash?: string | null;
  isNewToBaseline: boolean;
}

export interface ThreatEvaluationResult {
  isSuspicious: boolean;
  severity: SeverityLevel;
  reason: string;
  rulesTriggered: ThreatRuleTrigger[];
  recommendation: string;
}

/**
 * Evaluates an event against the forensic rule database.
 */
export function evaluateThreat(input: EvaluationInput): ThreatEvaluationResult {
  const {
    eventType,
    fileName,
    filePath,
    previousSize = 0,
    currentSize = 0,
    isNewToBaseline,
  } = input;

  const rulesTriggered: ThreatRuleTrigger[] = [];
  const lowerFileName = fileName.toLowerCase();
  const ext = path.extname(lowerFileName);

  // Track burst modifications
  const { isBurst, count: burstCount } = checkBurstActivity(filePath);
  const repeatCount = checkRepeatedFileChanges(filePath);

  // RULE 1: Double Extension Masquerading (e.g. invoice.pdf.exe)
  if (DOUBLE_EXTENSION_REGEX.test(fileName)) {
    rulesTriggered.push({
      ruleId: 'RULE-001-DOUBLE-EXT',
      ruleName: 'Double Extension Masquerade Detected',
      severity: 'CRITICAL',
      description: 'The file appears to masquerade as a benign document but possesses an executable secondary extension.',
      evidence: `File name "${fileName}" matches heuristic regex pattern for disguised executables.`,
    });
  }

  // RULE 2: Ransomware / Encrypted file signature
  if (RANSOM_EXTENSIONS.has(ext)) {
    rulesTriggered.push({
      ruleId: 'RULE-002-RANSOM-EXT',
      ruleName: 'Potential Ransomware / Encrypted Extension',
      severity: 'CRITICAL',
      description: 'The file extension matches known ransomware encryption markers.',
      evidence: `File extension "${ext}" matches known ransomware indicator list.`,
    });
  }

  // RULE 3: Unexpected executable creation or modification
  if (EXECUTABLE_EXTENSIONS.has(ext)) {
    if (eventType === 'CREATED') {
      rulesTriggered.push({
        ruleId: 'RULE-003-EXEC-CREATED',
        ruleName: 'Executable Dropped in Monitored Path',
        severity: 'HIGH',
        description: 'An unexpected binary, script, or executable payload was introduced.',
        evidence: `Extension "${ext}" indicates binary or script capable of host execution.`,
      });
    } else if (eventType === 'MODIFIED') {
      rulesTriggered.push({
        ruleId: 'RULE-004-EXEC-MODIFIED',
        ruleName: 'Executable or Script Binary Altered',
        severity: 'HIGH',
        description: 'Existing binary code or script logic has been altered after baseline creation.',
        evidence: `SHA-256 hash change confirmed on executable artifact (${fileName}).`,
      });
    }
  }

  // RULE 4: Changes to critical configuration / credential files
  const isCritical = CRITICAL_FILES.has(lowerFileName) || 
    lowerFileName.endsWith('.env') || 
    lowerFileName.endsWith('.pem') || 
    lowerFileName.endsWith('.key');

  if (isCritical) {
    if (eventType === 'MODIFIED') {
      rulesTriggered.push({
        ruleId: 'RULE-005-CONFIG-TAMPER',
        ruleName: 'Protected Configuration File Modified',
        severity: 'HIGH',
        description: 'A system or application configuration file was altered, which could alter security posture.',
        evidence: `Cryptographic integrity break observed on critical file "${fileName}".`,
      });
    } else if (eventType === 'DELETED') {
      rulesTriggered.push({
        ruleId: 'RULE-006-CONFIG-DELETED',
        ruleName: 'Protected Configuration File Deleted',
        severity: 'CRITICAL',
        description: 'An essential configuration, key, or credential file was removed.',
        evidence: `Artifact "${fileName}" removed from monitored perimeter.`,
      });
    }
  }

  // RULE 5: Burst rate of file modifications (Ransomware / automated batch tamper behavior)
  if (isBurst && burstCount >= BURST_THRESHOLD) {
    rulesTriggered.push({
      ruleId: 'RULE-007-RAPID-CHANGES',
      ruleName: 'Multiple File Modifications in Short Window',
      severity: 'CRITICAL',
      description: 'Rapid cluster of file changes observed across short duration (typical of automated wipers or ransomware).',
      evidence: `${burstCount} file modifications detected within a 6-second window.`,
    });
  }

  // RULE 6: Repeated modification of the same target file
  if (repeatCount >= 3) {
    rulesTriggered.push({
      ruleId: 'RULE-008-REPEATED-TAMPER',
      ruleName: 'Repeated File Modification Anomalies',
      severity: 'HIGH',
      description: 'Target file was modified repeatedly in quick succession.',
      evidence: `Target "${fileName}" was modified ${repeatCount} times within 6 seconds.`,
    });
  }

  // RULE 7: Sudden Large File Size Variance
  if (eventType === 'MODIFIED' && previousSize > 0) {
    const ratio = currentSize / previousSize;
    if (ratio >= 5 || (currentSize === 0 && previousSize > 100)) {
      rulesTriggered.push({
        ruleId: 'RULE-009-SIZE-ANOMALY',
        ruleName: 'Abnormal File Size Variance',
        severity: 'HIGH',
        description: 'File size surged or dropped drastically compared to baseline record.',
        evidence: `Size changed from ${previousSize} bytes to ${currentSize} bytes (${(ratio * 100).toFixed(0)}% of original).`,
      });
    }
  }

  // RULE 8: Unexpected new file appearing in monitored directory
  if (eventType === 'CREATED' && isNewToBaseline && !rulesTriggered.some(r => r.ruleId === 'RULE-003-EXEC-CREATED')) {
    rulesTriggered.push({
      ruleId: 'RULE-010-NEW-UNBASELINE-FILE',
      ruleName: 'Un-baselined File Introduced',
      severity: 'MEDIUM',
      description: 'A new file appeared in the monitored scope that was not present in the trusted baseline.',
      evidence: `New artifact "${fileName}" detected with no prior cryptographic baseline record.`,
    });
  }

  // RULE 9: Baseline file deleted
  if (eventType === 'DELETED' && !isCritical) {
    rulesTriggered.push({
      ruleId: 'RULE-011-FILE-DELETION',
      ruleName: 'Monitored Baseline File Removed',
      severity: 'MEDIUM',
      description: 'A file previously certified in the trusted baseline was deleted from the file system.',
      evidence: `Path "${filePath}" is no longer present on storage media.`,
    });
  }

  // RULE 10: Standard baseline hash discrepancy
  if (eventType === 'MODIFIED' && rulesTriggered.length === 0) {
    rulesTriggered.push({
      ruleId: 'RULE-012-HASH-MISMATCH',
      ruleName: 'Baseline Cryptographic Hash Discrepancy',
      severity: 'LOW',
      description: 'File content was modified after the trusted baseline was established.',
      evidence: `SHA-256 digest differs from baseline value recorded at establishment time.`,
    });
  }

  // Determine overall severity
  let severity: SeverityLevel = 'LOW';
  if (rulesTriggered.some(r => r.severity === 'CRITICAL')) {
    severity = 'CRITICAL';
  } else if (rulesTriggered.some(r => r.severity === 'HIGH')) {
    severity = 'HIGH';
  } else if (rulesTriggered.some(r => r.severity === 'MEDIUM')) {
    severity = 'MEDIUM';
  }

  const isSuspicious = severity === 'HIGH' || severity === 'CRITICAL' || (severity === 'MEDIUM' && eventType !== 'CREATED');

  // Build educational forensic reason and recommendation
  let reason = '';
  let recommendation = '';

  if (rulesTriggered.length > 0) {
    const highestRule = rulesTriggered[0];
    reason = `${highestRule.ruleName}: ${highestRule.description}`;
  } else {
    reason = `File ${eventType.toLowerCase()} event observed within monitored perimeter.`;
  }

  switch (severity) {
    case 'CRITICAL':
      recommendation = 'IMMEDIATE ACTION REQUIRED: Isolate endpoint or test environment. Verify if this change was authorized by system administration. Check for automated encryption or rogue processes.';
      break;
    case 'HIGH':
      recommendation = 'PRIORITY INVESTIGATION: Verify change authorization against change-management tickets. Review audit logs for process ID and user account responsible for this modification.';
      break;
    case 'MEDIUM':
      recommendation = 'INVESTIGATE: Inspect newly created artifact or deleted record. If this was a legitimate software update, refresh the trusted baseline.';
      break;
    case 'LOW':
    default:
      recommendation = 'ROUTINE VERIFICATION: Validate whether this modification was authorized. If expected, update baseline.';
      break;
  }

  return {
    isSuspicious,
    severity,
    reason,
    rulesTriggered,
    recommendation,
  };
}
