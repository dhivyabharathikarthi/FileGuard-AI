/**
 * @file monitor.ts
 * @description Real-Time File System Integrity Monitoring Engine.
 * Integrates chokidar file watcher, cryptographic SHA-256 calculation, and threat evaluation.
 */

import fs from 'fs';
import path from 'path';
import { FSWatcher, watch } from 'chokidar';
import { FimEvent, SystemStats, EventType, HashStatus } from '../types/fim.js';
import { calculateSha256 } from './hasher.js';
import { loadBaseline } from './baseline.js';
import { evaluateThreat } from './threatEngine.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'fim_events.json');

// Ensure data folder
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class FimMonitorService {
  private watcher: FSWatcher | null = null;
  private isMonitoringActive: boolean = false;
  private monitoredDirectory: string = path.resolve(process.cwd(), 'demo_sandbox');
  private events: FimEvent[] = [];
  private fileHashMap: Map<string, string> = new Map(); // relative path -> last known sha256
  private fileSizeMap: Map<string, number> = new Map(); // relative path -> last known size
  private debounceMap: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.loadEvents();
  }

  private loadEvents(): void {
    try {
      if (fs.existsSync(EVENTS_FILE)) {
        const data = fs.readFileSync(EVENTS_FILE, 'utf-8');
        this.events = JSON.parse(data);
      }
    } catch (err) {
      console.error('Failed to load events log:', err);
      this.events = [];
    }
  }

  private saveEvents(): void {
    try {
      // Keep up to 500 recent events
      if (this.events.length > 500) {
        this.events = this.events.slice(0, 500);
      }
      fs.writeFileSync(EVENTS_FILE, JSON.stringify(this.events, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save events log:', err);
    }
  }

  public getEvents(params?: {
    search?: string;
    eventType?: string;
    severity?: string;
    suspiciousOnly?: boolean;
  }): FimEvent[] {
    let list = [...this.events];

    if (params) {
      if (params.search) {
        const query = params.search.toLowerCase();
        list = list.filter(e => 
          e.fileName.toLowerCase().includes(query) ||
          e.filePath.toLowerCase().includes(query) ||
          e.reason.toLowerCase().includes(query) ||
          (e.currentHash && e.currentHash.toLowerCase().includes(query))
        );
      }

      if (params.eventType && params.eventType !== 'ALL') {
        list = list.filter(e => e.eventType === params.eventType);
      }

      if (params.severity && params.severity !== 'ALL') {
        list = list.filter(e => e.severity === params.severity);
      }

      if (params.suspiciousOnly) {
        list = list.filter(e => e.isSuspicious);
      }
    }

    return list;
  }

  public clearEvents(): void {
    this.events = [];
    this.saveEvents();
  }

  public getMonitoredDirectory(): string {
    return this.monitoredDirectory;
  }

  public setMonitoredDirectory(dir: string): void {
    const resolved = path.resolve(dir);
    if (!fs.existsSync(resolved)) {
      fs.mkdirSync(resolved, { recursive: true });
    }
    this.monitoredDirectory = resolved;
  }

  public isMonitoring(): boolean {
    return this.isMonitoringActive;
  }

  public async startMonitoring(dir?: string): Promise<{ success: boolean; directory: string; message: string }> {
    if (dir) {
      this.setMonitoredDirectory(dir);
    }

    if (this.isMonitoringActive && this.watcher) {
      return {
        success: true,
        directory: this.monitoredDirectory,
        message: 'Monitoring is already active.'
      };
    }

    const baseline = loadBaseline();
    if (baseline && baseline.files) {
      for (const [relPath, rec] of Object.entries(baseline.files)) {
        this.fileHashMap.set(relPath, rec.sha256);
        this.fileSizeMap.set(relPath, rec.size);
      }
    }

    // Initialize watcher
    this.watcher = watch(this.monitoredDirectory, {
      ignored: [/(^|[\/\\])\../, '**/node_modules/**', '**/dist/**'],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 400,
        pollInterval: 100,
      },
    });

    this.watcher.on('add', (filePath) => this.handleFileEvent('CREATED', filePath));
    this.watcher.on('change', (filePath) => this.handleFileEvent('MODIFIED', filePath));
    this.watcher.on('unlink', (filePath) => this.handleFileEvent('DELETED', filePath));
    this.watcher.on('error', (error) => console.error('FIM Watcher error:', error));

    this.isMonitoringActive = true;
    console.log(`[FIM] Real-time file integrity monitoring STARTED for: ${this.monitoredDirectory}`);

    return {
      success: true,
      directory: this.monitoredDirectory,
      message: `Monitoring successfully started on ${this.monitoredDirectory}`
    };
  }

  public async stopMonitoring(): Promise<{ success: boolean; message: string }> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
    this.isMonitoringActive = false;
    console.log('[FIM] Real-time file integrity monitoring STOPPED.');
    return {
      success: true,
      message: 'File integrity monitoring stopped.'
    };
  }

  private async handleFileEvent(type: EventType, fullPath: string): Promise<void> {
    const relativePath = path.relative(this.monitoredDirectory, fullPath).replace(/\\/g, '/');
    const fileName = path.basename(fullPath);
    const ext = path.extname(fileName).toLowerCase();

    // Debounce to prevent dual triggers on rapid file writes
    const debounceKey = `${type}:${relativePath}`;
    if (this.debounceMap.has(debounceKey)) {
      clearTimeout(this.debounceMap.get(debounceKey)!);
    }

    this.debounceMap.set(debounceKey, setTimeout(async () => {
      this.debounceMap.delete(debounceKey);
      await this.processEvent(type, fullPath, relativePath, fileName, ext);
    }, 150));
  }

  private async processEvent(
    type: EventType,
    fullPath: string,
    relativePath: string,
    fileName: string,
    ext: string
  ): Promise<void> {
    const baseline = loadBaseline();
    const baselineRecord = baseline?.files ? baseline.files[relativePath] : undefined;
    const previousHash = this.fileHashMap.get(relativePath) || baselineRecord?.sha256 || null;
    const previousSize = this.fileSizeMap.get(relativePath) || baselineRecord?.size || 0;

    let currentHash: string | null = null;
    let currentSize = 0;

    if (type !== 'DELETED') {
      try {
        if (fs.existsSync(fullPath)) {
          const stats = fs.statSync(fullPath);
          currentSize = stats.size;
          currentHash = await calculateSha256(fullPath);
          this.fileHashMap.set(relativePath, currentHash);
          this.fileSizeMap.set(relativePath, currentSize);
        }
      } catch (err) {
        currentHash = 'UNREADABLE';
      }
    } else {
      this.fileHashMap.delete(relativePath);
      this.fileSizeMap.delete(relativePath);
    }

    // Determine Hash Status
    let hashStatus: HashStatus = 'NEW';
    if (type === 'DELETED') {
      hashStatus = 'MISSING';
    } else if (baselineRecord) {
      hashStatus = (currentHash === baselineRecord.sha256) ? 'MATCH' : 'CHANGED';
    }

    // Evaluate via Threat Detection Engine
    const evalResult = evaluateThreat({
      eventType: type,
      fileName,
      filePath: relativePath,
      previousSize,
      currentSize,
      previousHash,
      currentHash,
      isNewToBaseline: !baselineRecord,
    });

    const eventRecord: FimEvent = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      eventType: type,
      fileName,
      filePath: relativePath,
      fullPath,
      fileSize: currentSize,
      extension: ext,
      previousHash,
      currentHash,
      hashStatus,
      severity: evalResult.severity,
      reason: evalResult.reason,
      isSuspicious: evalResult.isSuspicious,
      threatRules: evalResult.rulesTriggered,
      recommendation: evalResult.recommendation,
    };

    // Prepend to event log
    this.events.unshift(eventRecord);
    this.saveEvents();

    console.log(`[FIM ALERT - ${evalResult.severity}] ${type}: ${relativePath} (${evalResult.reason})`);
  }

  public getStats(): SystemStats {
    const baseline = loadBaseline();
    const baselineFileCount = baseline ? Object.keys(baseline.files).length : 0;

    let modifiedCount = 0;
    let createdCount = 0;
    let deletedCount = 0;
    let suspiciousCount = 0;
    let highCriticalCount = 0;

    for (const e of this.events) {
      if (e.eventType === 'MODIFIED') modifiedCount++;
      if (e.eventType === 'CREATED') createdCount++;
      if (e.eventType === 'DELETED') deletedCount++;
      if (e.isSuspicious) suspiciousCount++;
      if (e.severity === 'HIGH' || e.severity === 'CRITICAL') highCriticalCount++;
    }

    // Calculate integrity score (100% minus penalties for alerts/tampering)
    let penalty = (highCriticalCount * 25) + (suspiciousCount * 10) + (modifiedCount * 5);
    const integrityScore = Math.max(0, Math.min(100, 100 - penalty));

    return {
      monitoredDirectory: this.monitoredDirectory,
      isMonitoring: this.isMonitoringActive,
      totalMonitoredFiles: this.fileHashMap.size || baselineFileCount,
      baselineFileCount,
      baselineCreatedAt: baseline?.createdAt || null,
      modifiedFilesCount: modifiedCount,
      createdFilesCount: createdCount,
      deletedFilesCount: deletedCount,
      suspiciousEventsCount: suspiciousCount,
      highCriticalAlertsCount: highCriticalCount,
      totalEventsCount: this.events.length,
      lastEventTimestamp: this.events[0]?.timestamp || null,
      integrityScore,
    };
  }
}

export const monitorService = new FimMonitorService();
