export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EventType = 'CREATED' | 'MODIFIED' | 'DELETED' | 'RENAMED';

export type HashStatus = 'MATCH' | 'CHANGED' | 'NEW' | 'MISSING' | 'ERROR';

export interface FileRecord {
  path: string;              // relative path from root
  fullPath: string;          // absolute path
  name: string;
  size: number;
  extension: string;
  createdAt: string;
  modifiedAt: string;
  sha256: string;
  hashStatus: HashStatus;
  baselineHash?: string;
  baselineModifiedAt?: string;
  isExecutable?: boolean;
  isConfiguration?: boolean;
}

export interface BaselineRecord {
  path: string;
  fullPath: string;
  name: string;
  size: number;
  extension: string;
  modifiedAt: string;
  sha256: string;
  timestamp: string;
}

export interface BaselineData {
  createdAt: string;
  updatedAt: string;
  monitoredDirectory: string;
  totalFiles: number;
  files: Record<string, BaselineRecord>;
}

export interface ThreatRuleTrigger {
  ruleId: string;
  ruleName: string;
  severity: SeverityLevel;
  description: string;
  evidence: string;
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
  threatRules: ThreatRuleTrigger[];
  recommendation: string;
  investigatorNotes?: string;
}

export interface ThreatAlert {
  id: string;
  eventId: string;
  timestamp: string;
  fileName: string;
  filePath: string;
  eventType: EventType;
  severity: SeverityLevel;
  reason: string;
  previousHash: string | null;
  currentHash: string | null;
  recommendation: string;
  rulesTriggered: string[];
}

export interface SystemStats {
  monitoredDirectory: string;
  isMonitoring: boolean;
  totalMonitoredFiles: number;
  baselineFileCount: number;
  baselineCreatedAt: string | null;
  modifiedFilesCount: number;
  createdFilesCount: number;
  deletedFilesCount: number;
  suspiciousEventsCount: number;
  highCriticalAlertsCount: number;
  totalEventsCount: number;
  lastEventTimestamp: string | null;
  integrityScore: number; // 0 - 100%
}

export interface AiThreatAnalysis {
  eventId: string;
  fileName: string;
  timestamp: string;
  whatHappened: string;
  whySuspicious: string;
  evidenceObserved: string[];
  investigatorChecklist: string[];
  recommendedNextSteps: string[];
  confidenceAssessment: string;
  disclaimer: string;
  isAiGenerated: boolean;
}

export interface ForensicReport {
  reportId: string;
  generatedAt: string;
  investigator: string;
  caseTitle: string;
  monitoringPeriod: {
    startTime: string;
    endTime: string;
  };
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
  fileHashIntegrityTable: Array<{
    fileName: string;
    path: string;
    status: HashStatus;
    baselineHash: string;
    currentHash: string;
    size: number;
    lastModified: string;
  }>;
  criticalEvents: FimEvent[];
  investigationRecommendations: string[];
  chainOfCustodyNotice: string;
}

export interface DemoActionResponse {
  success: boolean;
  action: string;
  message: string;
  affectedFile?: string;
  expectedEvent?: string;
}
