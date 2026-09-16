/**
 * @file demoSandbox.ts
 * @description Safe Demonstration Mode for College Cybersecurity Presentations.
 * Creates harmless mock files and triggers controlled test events (creation, modification, deletion).
 * NEVER creates, executes, or contains genuine malware payloads.
 */

import fs from 'fs';
import path from 'path';

export const DEMO_DIR = path.resolve(process.cwd(), 'demo_sandbox');

export interface SandboxStatus {
  exists: boolean;
  path: string;
  files: Array<{ name: string; size: number; modifiedAt: string }>;
}

/**
 * Initializes or resets the demonstration directory with harmless baseline test files.
 */
export function setupDemoSandbox(): { success: boolean; message: string; directory: string } {
  if (!fs.existsSync(DEMO_DIR)) {
    fs.mkdirSync(DEMO_DIR, { recursive: true });
  }

  // 1. sample_config.txt
  fs.writeFileSync(
    path.join(DEMO_DIR, 'sample_config.txt'),
    `# Digital Forensics Lab Server Configuration\nSERVER_PORT=8080\nDEBUG=false\nAUTHENTICATION_MODE=STRICT_MFA\nMAX_CONNECTIONS=100\nCIPHER_SUITE=TLS_AES_256_GCM_SHA384\nLAST_AUDIT=2026-09-16\n`,
    'utf-8'
  );

  // 2. sample_document.txt
  fs.writeFileSync(
    path.join(DEMO_DIR, 'sample_document.txt'),
    `DIGITAL FORENSIC SCIENCE LABORATORY\nCase File: CFS-2026-0819\nInvestigator: Cadet Forensic Examiner\nStatus: Active Chain of Custody\nScope: Verifying File Integrity Monitoring (FIM) SHA-256 state.\nEvidence integrity strictly guaranteed.\n`,
    'utf-8'
  );

  // 3. sample_log.txt
  fs.writeFileSync(
    path.join(DEMO_DIR, 'sample_log.txt'),
    `2026-09-16 08:00:01 INFO [Kernel] System secure boot verified\n2026-09-16 08:00:05 INFO [Auth] Forensic workstation initialized\n2026-09-16 08:00:12 INFO [Service] FileGuard AI monitoring listener active\n`,
    'utf-8'
  );

  return {
    success: true,
    message: 'Demo sandbox initialized with clean baseline test files.',
    directory: DEMO_DIR,
  };
}

/**
 * Returns current files inside the demo sandbox.
 */
export function getDemoStatus(): SandboxStatus {
  if (!fs.existsSync(DEMO_DIR)) {
    return { exists: false, path: DEMO_DIR, files: [] };
  }

  const entries = fs.readdirSync(DEMO_DIR, { withFileTypes: true });
  const files = entries
    .filter(e => e.isFile())
    .map(e => {
      const full = path.join(DEMO_DIR, e.name);
      const stat = fs.statSync(full);
      return {
        name: e.name,
        size: stat.size,
        modifiedAt: stat.mtime.toISOString(),
      };
    });

  return {
    exists: true,
    path: DEMO_DIR,
    files,
  };
}

/**
 * Simulates specific file events safely for presentation/classroom grading.
 */
export async function executeDemoSimulation(actionType: string): Promise<{
  success: boolean;
  message: string;
  affectedFile?: string;
  expectedEvent?: string;
}> {
  if (!fs.existsSync(DEMO_DIR)) {
    setupDemoSandbox();
  }

  switch (actionType) {
    case 'modify_config': {
      const configPath = path.join(DEMO_DIR, 'sample_config.txt');
      const now = new Date().toLocaleTimeString();
      const payload = `\n# [UNAUTHORIZED TAMPER SIMULATION at ${now}]\nAUTHENTICATION_MODE=DISABLED_BYPASS\nDEBUG=true\nATTACKER_TELEMETRY=enabled\n`;
      fs.appendFileSync(configPath, payload, 'utf-8');
      return {
        success: true,
        message: 'Modified sample_config.txt by appending unauthorized configuration overrides.',
        affectedFile: 'sample_config.txt',
        expectedEvent: 'MODIFIED (Severity: HIGH)',
      };
    }

    case 'create_executable': {
      const scriptPath = path.join(DEMO_DIR, 'suspicious_script.sh');
      const content = `#!/bin/bash\n# Harmless educational demo script demonstrating unexpected executable introduction\necho "Simulated unauthorized script execution"\nexit 0\n`;
      fs.writeFileSync(scriptPath, content, 'utf-8');
      return {
        success: true,
        message: 'Introduced harmless script suspicious_script.sh into the monitored scope.',
        affectedFile: 'suspicious_script.sh',
        expectedEvent: 'CREATED (Severity: HIGH - Executable Introduced)',
      };
    }

    case 'create_double_extension': {
      const doubleExtPath = path.join(DEMO_DIR, 'urgent_invoice.pdf.exe');
      const content = `[HARMLESS TEST MOCK]\nThis is a harmless text file simulating a social engineering double-extension technique (e.g., .pdf.exe).\nNo malicious instructions.\n`;
      fs.writeFileSync(doubleExtPath, content, 'utf-8');
      return {
        success: true,
        message: 'Created urgent_invoice.pdf.exe to test double extension masquerade heuristic.',
        affectedFile: 'urgent_invoice.pdf.exe',
        expectedEvent: 'CREATED (Severity: CRITICAL - Double Extension Masquerade)',
      };
    }

    case 'delete_file': {
      const logPath = path.join(DEMO_DIR, 'sample_log.txt');
      if (fs.existsSync(logPath)) {
        fs.unlinkSync(logPath);
        return {
          success: true,
          message: 'Deleted sample_log.txt to simulate critical log wiping activity.',
          affectedFile: 'sample_log.txt',
          expectedEvent: 'DELETED (Severity: HIGH - Log Deletion)',
        };
      } else {
        return {
          success: false,
          message: 'sample_log.txt does not exist to delete. Reset sandbox first.',
        };
      }
    }

    case 'rapid_tamper': {
      // Modifies multiple files in rapid succession to trigger the sliding-window burst rule
      const configPath = path.join(DEMO_DIR, 'sample_config.txt');
      const docPath = path.join(DEMO_DIR, 'sample_document.txt');
      const burstFile = path.join(DEMO_DIR, 'burst_test.txt');

      fs.appendFileSync(configPath, `\n# Burst tampering test #${Date.now()}\n`, 'utf-8');
      fs.appendFileSync(docPath, `\n# Burst document revision #${Date.now()}\n`, 'utf-8');
      fs.writeFileSync(burstFile, `Rapid burst creation test #${Date.now()}\n`, 'utf-8');

      return {
        success: true,
        message: 'Simulated 3 rapid file alterations in < 1 second to trigger the burst tampering detection rule.',
        affectedFile: 'Multiple files',
        expectedEvent: 'BURST_MODIFICATION (Severity: CRITICAL)',
      };
    }

    case 'reset_sandbox': {
      setupDemoSandbox();
      return {
        success: true,
        message: 'Reset demo sandbox files to clean default state.',
      };
    }

    default:
      return {
        success: false,
        message: `Unknown simulation action: ${actionType}`,
      };
  }
}
