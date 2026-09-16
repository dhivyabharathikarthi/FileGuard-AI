/**
 * @file api.ts
 * @description Frontend API Client service communicating with FileGuard AI backend.
 */

import {
  SystemStats,
  BaselineData,
  FileRecord,
  BaselineRecord,
  FimEvent,
  AiThreatAnalysis,
  ForensicReport,
  DemoActionResponse,
} from '../types/fim';

export async function getStatus(): Promise<{
  success: boolean;
  stats: SystemStats;
  directory: string;
  isMonitoring: boolean;
}> {
  const res = await fetch('/api/status');
  if (!res.ok) throw new Error('Failed to retrieve system status');
  return res.json();
}

export async function startMonitoring(directory?: string): Promise<{
  success: boolean;
  directory: string;
  message: string;
}> {
  const res = await fetch('/api/monitor/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ directory }),
  });
  if (!res.ok) throw new Error('Failed to start monitoring');
  return res.json();
}

export async function stopMonitoring(): Promise<{
  success: boolean;
  message: string;
}> {
  const res = await fetch('/api/monitor/stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to stop monitoring');
  return res.json();
}

export async function getBaseline(): Promise<{
  success: boolean;
  baseline: BaselineData | null;
}> {
  const res = await fetch('/api/baseline');
  if (!res.ok) throw new Error('Failed to retrieve baseline');
  return res.json();
}

export async function createBaseline(directory?: string): Promise<{
  success: boolean;
  message: string;
  baseline: BaselineData;
}> {
  const res = await fetch('/api/baseline/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ directory }),
  });
  if (!res.ok) throw new Error('Failed to create baseline');
  return res.json();
}

export async function getFiles(): Promise<{
  success: boolean;
  directory: string;
  matched: FileRecord[];
  modified: FileRecord[];
  created: FileRecord[];
  deleted: BaselineRecord[];
  allCurrentFiles: FileRecord[];
}> {
  const res = await fetch('/api/files');
  if (!res.ok) throw new Error('Failed to retrieve file list');
  return res.json();
}

export async function getEvents(filters?: {
  search?: string;
  eventType?: string;
  severity?: string;
  suspiciousOnly?: boolean;
}): Promise<{
  success: boolean;
  events: FimEvent[];
  total: number;
}> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.eventType) params.set('eventType', filters.eventType);
  if (filters?.severity) params.set('severity', filters.severity);
  if (filters?.suspiciousOnly) params.set('suspiciousOnly', 'true');

  const res = await fetch(`/api/events?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to retrieve event logs');
  return res.json();
}

export async function clearEvents(): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/events', { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear event logs');
  return res.json();
}

export async function explainThreat(event: FimEvent): Promise<{
  success: boolean;
  explanation: AiThreatAnalysis;
}> {
  const res = await fetch('/api/ai/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event }),
  });
  if (!res.ok) throw new Error('Failed to get AI threat analysis');
  return res.json();
}

export async function getReport(
  investigator?: string,
  caseTitle?: string
): Promise<{ success: boolean; report: ForensicReport }> {
  const params = new URLSearchParams();
  if (investigator) params.set('investigator', investigator);
  if (caseTitle) params.set('caseTitle', caseTitle);

  const res = await fetch(`/api/report?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to generate forensic report');
  return res.json();
}

export async function getDemoStatus(): Promise<{
  success: boolean;
  status: { exists: boolean; path: string; files: Array<{ name: string; size: number; modifiedAt: string }> };
}> {
  const res = await fetch('/api/demo/status');
  if (!res.ok) throw new Error('Failed to get demo status');
  return res.json();
}

export async function setupDemo(): Promise<{ success: boolean; message: string; directory: string }> {
  const res = await fetch('/api/demo/setup', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to initialize demo sandbox');
  return res.json();
}

export async function simulateDemoAction(action: string): Promise<DemoActionResponse> {
  const res = await fetch('/api/demo/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error('Failed to simulate action');
  return res.json();
}
