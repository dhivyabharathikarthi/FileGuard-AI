/**
 * @file fim.ts
 * @description Core TypeScript interfaces and types for FileGuard AI.
 */

export type EventType = 'CREATED' | 'MODIFIED' | 'DELETED' | 'RENAMED';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type HashStatus = 'MATCH' | 'CHANGED' | 'NEW' | 'MISSING';

export interface FileRecord {
  name: string;
  path: string;
  fullPath: string;
  size: number;
  extension: string;
  createdAt: string;
  modifiedAt: string;
  sha256: string;
  baselineHash?: string | null;
  hashStatus: HashStatus;
  isConfiguration?: boolean;
}

export interface BaselineRecord {
  name: string;
  path: string;
  fullPath: string;
  size: number;
  extension: string;
  timestamp: string;
  sha256: string;
}

export interface BaselineData {
  createdAt: string;
  directory: string;
  totalFiles: number;
  files: Record<string, BaselineRecord>;
}

export interface ThreatRuleHit {
  ruleId: string;
  ruleName: string;
  severity: SeverityLevel;
  evidence: string;
  recommendation: string;
}

export interface FimEvent {
  id: string;
  timestamp: string;
  eventType: EventType;
  fileName: string;
  filePath: string;
  fullPath: string;
  fileSize: number;
  extension: string;
  previousHash: string | null;
  currentHash: string | null;
  hashStatus: HashStatus;
  severity: SeverityLevel;
  reason: string;
  isSuspicious: boolean;
  threatRules: ThreatRuleHit[];
  recommendation: string;
}

export interface SystemStats {
  isMonitoring: boolean;
  totalMonitoredFiles: number;
  baselineFileCount: number;
  modifiedFilesCount: number;
  createdFilesCount: number;
  deletedFilesCount: number;
  suspiciousEventsCount: number;
  highCriticalAlertsCount: number;
  totalEventsCount: number;
  integrityScore: number;
  baselineCreatedAt: string | null;
  lastEventTimestamp: string | null;
}

export interface AiThreatAnalysis {
  whatHappened: string;
  whySuspicious: string;
  evidenceObserved: string[];
  investigatorChecklist: string[];
  recommendedNextSteps: string[];
  confidenceAssessment: string;
  disclaimer: string;
}

export interface ForensicReport {
  reportId: string;
  generatedAt: string;
  caseTitle: string;
  investigator: string;
  monitoredDirectory: string;
  baselineInfo: {
    createdAt: string | null;
    totalBaselineFiles: number;
  };
  statistics: {
    totalFilesScanned: number;
    totalEvents: number;
    modifiedCount: number;
    createdCount: number;
    deletedCount: number;
    suspiciousCount: number;
    highCriticalCount: number;
    overallIntegrityScore: number;
  };
  criticalEvents: FimEvent[];
  fileHashIntegrityTable: Array<{
    fileName: string;
    path: string;
    status: HashStatus;
    baselineHash: string;
    currentHash: string;
    size: number;
  }>;
  investigationRecommendations: string[];
  chainOfCustodyNotice: string;
}

export interface DemoActionResponse {
  success: boolean;
  action: string;
  message: string;
  details?: string;
  affectedFile?: string;
}
