/**
 * @file App.tsx
 * @description Root Application Component for FileGuard AI.
 * Digital Forensics and Cyber Threat Detection System.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { FileMonitorView } from './components/FileMonitorView';
import { BaselineView } from './components/BaselineView';
import { EventsView } from './components/EventsView';
import { AlertsView } from './components/AlertsView';
import { ReportsView } from './components/ReportsView';
import { DemoSandboxView } from './components/DemoSandboxView';
import { ArchitectureView } from './components/ArchitectureView';
import { SettingsView } from './components/SettingsView';
import { FileDetailModal } from './components/FileDetailModal';

import {
  getStatus,
  startMonitoring,
  stopMonitoring,
  getBaseline,
  createBaseline,
  getFiles,
  getEvents,
  clearEvents,
  simulateDemoAction
} from './services/api';

import {
  SystemStats,
  BaselineData,
  FileRecord,
  FimEvent
} from './types/fim';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMonitoring, setIsMonitoring] = useState<boolean>(true);
  const [monitoredDirectory, setMonitoredDirectory] = useState<string>('demo_sandbox');
  const [stats, setStats] = useState<SystemStats>({
    isMonitoring: true,
    totalMonitoredFiles: 0,
    baselineFileCount: 0,
    modifiedFilesCount: 0,
    createdFilesCount: 0,
    deletedFilesCount: 0,
    suspiciousEventsCount: 0,
    highCriticalAlertsCount: 0,
    totalEventsCount: 0,
    integrityScore: 100,
    baselineCreatedAt: null,
    lastEventTimestamp: null,
  });

  const [baseline, setBaseline] = useState<BaselineData | null>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [events, setEvents] = useState<FimEvent[]>([]);
  const [selectedItem, setSelectedItem] = useState<FimEvent | FileRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Load all core data
  const loadData = useCallback(async () => {
    try {
      const [statusRes, baselineRes, filesRes, eventsRes] = await Promise.all([
        getStatus().catch(() => null),
        getBaseline().catch(() => null),
        getFiles().catch(() => null),
        getEvents().catch(() => null),
      ]);

      if (statusRes?.success) {
        setStats(statusRes.stats);
        setIsMonitoring(statusRes.isMonitoring);
        setMonitoredDirectory(statusRes.directory);
      }

      if (baselineRes?.success) {
        setBaseline(baselineRes.baseline);
      }

      if (filesRes?.success) {
        setFiles(filesRes.allCurrentFiles || []);
      }

      if (eventsRes?.success) {
        setEvents(eventsRes.events || []);
      }
    } catch (err) {
      console.error('Data loading error:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Polling loop (every 3 seconds for continuous monitoring telemetry)
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handlers
  const handleToggleMonitoring = async () => {
    try {
      if (isMonitoring) {
        await stopMonitoring();
        setIsMonitoring(false);
      } else {
        await startMonitoring(monitoredDirectory);
        setIsMonitoring(true);
      }
      await loadData();
    } catch (err) {
      console.error('Toggle monitoring error:', err);
    }
  };

  const handleCreateBaseline = async () => {
    setLoading(true);
    try {
      const res = await createBaseline(monitoredDirectory);
      if (res.success) {
        setBaseline(res.baseline);
        await loadData();
      }
    } catch (err) {
      console.error('Create baseline error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDirectory = async (newDir: string) => {
    setLoading(true);
    try {
      await startMonitoring(newDir);
      setMonitoredDirectory(newDir);
      await loadData();
    } catch (err) {
      console.error('Update directory error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearEvents = async () => {
    try {
      await clearEvents();
      await loadData();
    } catch (err) {
      console.error('Clear events error:', err);
    }
  };

  const handleRunSimulation = async (action: string) => {
    try {
      await simulateDemoAction(action);
      await loadData();
    } catch (err) {
      console.error('Simulation trigger error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMonitoring={isMonitoring}
        onToggleMonitoring={handleToggleMonitoring}
        monitoredDirectory={monitoredDirectory}
        criticalAlertCount={stats.highCriticalAlertsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            recentEvents={events}
            onSelectEvent={(evt) => setSelectedItem(evt)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onRunSimulation={handleRunSimulation}
          />
        )}

        {activeTab === 'files' && (
          <FileMonitorView
            files={files}
            monitoredDirectory={monitoredDirectory}
            loading={loading}
            onRefresh={loadData}
            onSelectFile={(file) => setSelectedItem(file)}
            onUpdateDirectory={handleUpdateDirectory}
          />
        )}

        {activeTab === 'baseline' && (
          <BaselineView
            baseline={baseline}
            loading={loading}
            onCreateBaseline={handleCreateBaseline}
          />
        )}

        {activeTab === 'events' && (
          <EventsView
            events={events}
            onSelectEvent={(evt) => setSelectedItem(evt)}
            onClearEvents={handleClearEvents}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            events={events}
            onSelectEvent={(evt) => setSelectedItem(evt)}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView />
        )}

        {activeTab === 'demo' && (
          <DemoSandboxView
            onNavigateTab={(tab) => setActiveTab(tab)}
            onRefreshAll={loadData}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            monitoredDirectory={monitoredDirectory}
            isMonitoring={isMonitoring}
            onUpdateDirectory={handleUpdateDirectory}
            onToggleMonitoring={handleToggleMonitoring}
          />
        )}
      </main>

      {/* File & Event Forensic Inspection Modal */}
      {selectedItem && (
        <FileDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Application Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>FileGuard AI &bull; Digital Forensics & File Integrity Monitoring</span>
          </div>
          <div className="flex items-center gap-3">
            <span>FIPS 180-4 SHA-256</span>
            <span>&bull;</span>
            <span>Non-Destructive Forensics Standard</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
