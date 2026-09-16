/**
 * @file reporter.ts
 * @description Formal Digital Forensics Investigation Report Generator.
 * Compiles a structured, college-standard chain-of-custody report suitable
 * for academic demonstration and audit review.
 */

import { ForensicReport, HashStatus } from '../types/fim.js';
import { monitorService } from './monitor.js';
import { loadBaseline, compareWithBaseline } from './baseline.js';

export async function generateForensicReport(options?: {
  investigatorName?: string;
  caseTitle?: string;
}): Promise<ForensicReport> {
  const stats = monitorService.getStats();
  const baseline = loadBaseline();
  const events = monitorService.getEvents();
  const dir = monitorService.getMonitoredDirectory();

  const comparison = await compareWithBaseline(dir, baseline);

  // Build hash integrity table
  const integrityTable: Array<{
    fileName: string;
    path: string;
    status: HashStatus;
    baselineHash: string;
    currentHash: string;
    size: number;
    lastModified: string;
  }> = [];

  for (const f of comparison.allCurrentFiles) {
    integrityTable.push({
      fileName: f.name,
      path: f.path,
      status: f.hashStatus,
      baselineHash: f.baselineHash || 'N/A (Unbaselined)',
      currentHash: f.sha256,
      size: f.size,
      lastModified: f.modifiedAt,
    });
  }

  for (const del of comparison.deleted) {
    integrityTable.push({
      fileName: del.name,
      path: del.path,
      status: 'MISSING',
      baselineHash: del.sha256,
      currentHash: 'FILE_REMOVED',
      size: del.size,
      lastModified: del.modifiedAt,
    });
  }

  const criticalEvents = events.filter(e => e.severity === 'HIGH' || e.severity === 'CRITICAL');

  const recommendations: string[] = [
    'Enforce strict write-access restrictions (least privilege) on all monitored configuration directories.',
    'Correlate detected integrity violations with host-level audit logs (auditd on Linux / Event Logs on Windows) to pinpoint User IDs and parent Process IDs.',
    'Prioritize investigation of artifacts marked with HIGH and CRITICAL severity flags before updating the baseline.',
    'Only invoke "Update Baseline" after independent administrative verification that file changes were authorized and benign.',
    'Preserve cryptographic SHA-256 evidence logs for potential forensic chain of custody requirements.',
  ];

  return {
    reportId: `REP-CFS-${Date.now().toString(36).toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    investigator: options?.investigatorName || 'Forensic Examiner (Student Analyst)',
    caseTitle: options?.caseTitle || 'FileGuard AI - Comprehensive File Integrity & Threat Audit',
    monitoringPeriod: {
      startTime: baseline?.createdAt || stats.lastEventTimestamp || new Date().toISOString(),
      endTime: new Date().toISOString(),
    },
    monitoredDirectory: dir,
    baselineInfo: {
      createdAt: baseline?.createdAt || null,
      totalBaselineFiles: baseline ? Object.keys(baseline.files).length : 0,
    },
    statistics: {
      totalFilesScanned: integrityTable.length,
      totalEvents: stats.totalEventsCount,
      modifiedCount: stats.modifiedFilesCount,
      createdCount: stats.createdFilesCount,
      deletedCount: stats.deletedFilesCount,
      suspiciousCount: stats.suspiciousEventsCount,
      highCriticalCount: stats.highCriticalAlertsCount,
      overallIntegrityScore: stats.integrityScore,
    },
    fileHashIntegrityTable: integrityTable,
    criticalEvents: criticalEvents.slice(0, 20),
    investigationRecommendations: recommendations,
    chainOfCustodyNotice: 'EVIDENCE INTEGRITY STATEMENT: All cryptographic SHA-256 digests in this report were generated via streaming read-only system calls without altering metadata timestamps or target file contents. Certified for Cyber Forensic Science analysis.',
  };
}
