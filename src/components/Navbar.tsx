/**
 * @file Navbar.tsx
 * @description Cybersecurity system header navigation with live monitoring status indicator.
 */

import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  FolderLock,
  History,
  FileSpreadsheet,
  FlaskConical,
  BookOpen,
  Sliders,
  Play,
  Square,
  AlertTriangle
} from 'lucide-react';

export type ActiveTab = 
  | 'dashboard' 
  | 'files' 
  | 'baseline' 
  | 'events' 
  | 'alerts' 
  | 'reports' 
  | 'demo' 
  | 'architecture' 
  | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
  monitoredDirectory: string;
  criticalAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isMonitoring,
  onToggleMonitoring,
  monitoredDirectory,
  criticalAlertCount,
}) => {
  const shortDir = monitoredDirectory.split('/').slice(-2).join('/') || monitoredDirectory;

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Brand & Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white font-mono">
                  FileGuard<span className="text-cyan-400"> AI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-semibold rounded bg-slate-800 border border-slate-700 text-slate-300">
                  FIM / DFIR
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                File Integrity Monitoring & Threat Detection System
              </p>
            </div>
          </div>

          {/* Center: Monitored Directory Breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950/70 px-3 py-1.5 rounded-md border border-slate-800">
            <span className="text-slate-500">Target:</span>
            <span className="text-cyan-300 font-semibold truncate max-w-[200px]" title={monitoredDirectory}>
              {shortDir}
            </span>
          </div>

          {/* Right Controls: Monitoring Toggle & Alerts badge */}
          <div className="flex items-center gap-3">
            {/* Real-time Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800">
              <span className="relative flex h-2.5 w-2.5">
                {isMonitoring && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isMonitoring ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span className={`text-xs font-mono font-medium ${isMonitoring ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isMonitoring ? 'MONITORING LIVE' : 'STOPPED'}
              </span>
            </div>

            {/* Start/Stop Button */}
            <button
              id="btn-toggle-monitoring"
              onClick={onToggleMonitoring}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isMonitoring
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60 hover:bg-rose-900/90'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/90'
              }`}
            >
              {isMonitoring ? (
                <>
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>Stop Engine</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Start Engine</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none text-xs font-medium">
          <button
            id="nav-tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          <button
            id="nav-tab-files"
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'files'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FolderLock className="h-4 w-4" />
            <span>File Monitor</span>
          </button>

          <button
            id="nav-tab-baseline"
            onClick={() => setActiveTab('baseline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'baseline'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Baseline</span>
          </button>

          <button
            id="nav-tab-events"
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'events'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Events</span>
          </button>

          <button
            id="nav-tab-alerts"
            onClick={() => setActiveTab('alerts')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'alerts'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Threat Alerts</span>
            {criticalAlertCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-500/80 text-white rounded-full text-[10px] font-bold">
                {criticalAlertCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-reports"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Forensic Report</span>
          </button>

          <button
            id="nav-tab-demo"
            onClick={() => setActiveTab('demo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'demo'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                : 'text-emerald-400/90 hover:text-emerald-200 hover:bg-emerald-950/40'
            }`}
          >
            <FlaskConical className="h-4 w-4" />
            <span className="font-semibold">Demo Sandbox</span>
          </button>

          <button
            id="nav-tab-architecture"
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>College Lab & Theory</span>
          </button>

          <button
            id="nav-tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
