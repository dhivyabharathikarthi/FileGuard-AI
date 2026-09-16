/**
 * @file server.ts
 * @description Express backend server for FileGuard AI.
 * Hosts REST APIs for file integrity monitoring, SHA-256 hashing, threat detection,
 * Google Gemini AI threat explanation, and mounts Vite middleware for the frontend UI.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { monitorService } from './backend/monitor.js';
import { createBaseline, loadBaseline, compareWithBaseline } from './backend/baseline.js';
import { explainThreatWithAi } from './backend/aiAnalyzer.js';
import { generateForensicReport } from './backend/reporter.js';
import { setupDemoSandbox, getDemoStatus, executeDemoSimulation, DEMO_DIR } from './backend/demoSandbox.js';
import { FimEvent } from './types/fim.js';

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Automatically initialize demo sandbox if it doesn't exist
  setupDemoSandbox();

  // Set default monitored directory to demo sandbox and establish baseline if not present
  monitorService.setMonitoredDirectory(DEMO_DIR);
  const existingBaseline = loadBaseline();
  if (!existingBaseline) {
    try {
      await createBaseline(DEMO_DIR);
      console.log('[FIM] Initialized trusted baseline for demo sandbox.');
    } catch (e) {
      console.error('[FIM] Baseline init warning:', e);
    }
  }

  // Auto-start monitoring on demo sandbox so the app is immediately live
  await monitorService.startMonitoring(DEMO_DIR);

  // ===================== REST API ROUTES =====================

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'FileGuard AI' });
  });

  // System & Monitoring Status
  app.get('/api/status', (req: Request, res: Response) => {
    try {
      const stats = monitorService.getStats();
      res.json({
        success: true,
        stats,
        directory: monitorService.getMonitoredDirectory(),
        isMonitoring: monitorService.isMonitoring(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Start Monitoring
  app.post('/api/monitor/start', async (req: Request, res: Response) => {
    try {
      const { directory } = req.body || {};
      const result = await monitorService.startMonitoring(directory);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Stop Monitoring
  app.post('/api/monitor/stop', async (req: Request, res: Response) => {
    try {
      const result = await monitorService.stopMonitoring();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Baseline Management
  app.get('/api/baseline', (req: Request, res: Response) => {
    try {
      const baseline = loadBaseline();
      res.json({ success: true, baseline });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create / Refresh Baseline
  app.post('/api/baseline/create', async (req: Request, res: Response) => {
    try {
      const dir = req.body?.directory || monitorService.getMonitoredDirectory();
      const baseline = await createBaseline(dir);
      res.json({
        success: true,
        message: 'Trusted cryptographic baseline successfully established.',
        baseline,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // List Monitored Files with current integrity status
  app.get('/api/files', async (req: Request, res: Response) => {
    try {
      const dir = monitorService.getMonitoredDirectory();
      const baseline = loadBaseline();
      const comparison = await compareWithBaseline(dir, baseline);
      res.json({
        success: true,
        directory: dir,
        ...comparison,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Event Log
  app.get('/api/events', (req: Request, res: Response) => {
    try {
      const { search, eventType, severity, suspiciousOnly } = req.query;
      const events = monitorService.getEvents({
        search: search as string,
        eventType: eventType as string,
        severity: severity as string,
        suspiciousOnly: suspiciousOnly === 'true',
      });
      res.json({ success: true, events, total: events.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Clear Events
  app.delete('/api/events', (req: Request, res: Response) => {
    try {
      monitorService.clearEvents();
      res.json({ success: true, message: 'Event log cleared.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // AI Threat Explanation (Gemini API with fallback)
  app.post('/api/ai/explain', async (req: Request, res: Response) => {
    try {
      const event: FimEvent = req.body?.event;
      if (!event) {
        return res.status(400).json({ success: false, error: 'Event data required' });
      }

      const explanation = await explainThreatWithAi(event);
      res.json({ success: true, explanation });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Forensic Investigation Report
  app.get('/api/report', async (req: Request, res: Response) => {
    try {
      const { investigator, caseTitle } = req.query;
      const report = await generateForensicReport({
        investigatorName: investigator as string,
        caseTitle: caseTitle as string,
      });
      res.json({ success: true, report });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Demonstration Sandbox APIs
  app.get('/api/demo/status', (req: Request, res: Response) => {
    try {
      const status = getDemoStatus();
      res.json({ success: true, status });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/demo/setup', (req: Request, res: Response) => {
    try {
      const result = setupDemoSandbox();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/demo/simulate', async (req: Request, res: Response) => {
    try {
      const { action } = req.body || {};
      const result = await executeDemoSimulation(action);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ===================== FRONTEND INTEGRATION =====================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FileGuard AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
