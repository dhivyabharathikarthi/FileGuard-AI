/**
 * @file baseline.ts
 * @description Trusted Cryptographic Baseline Store & Integrity Comparator.
 * Persists known-good file hashes and metadata.
 */

import fs from 'fs';
import path from 'path';
import { BaselineData, BaselineRecord, FileRecord } from '../types/fim.js';
import { scanDirectoryRecursively } from './hasher.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BASELINE_FILE = path.join(DATA_DIR, 'fim_baseline.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Loads baseline from JSON storage.
 */
export function loadBaseline(): BaselineData | null {
  try {
    if (fs.existsSync(BASELINE_FILE)) {
      const content = fs.readFileSync(BASELINE_FILE, 'utf-8');
      return JSON.parse(content) as BaselineData;
    }
  } catch (err) {
    console.error('Failed to read baseline file:', err);
  }
  return null;
}

/**
 * Saves baseline to JSON storage.
 */
export function saveBaseline(data: BaselineData): void {
  try {
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write baseline file:', err);
    throw err;
  }
}

/**
 * Creates or updates the trusted baseline for a given directory.
 * NOTE: Establishes the current files and their SHA-256 hashes as the "trusted known-good" state.
 */
export async function createBaseline(targetDirectory: string): Promise<BaselineData> {
  const normalizedDir = path.resolve(targetDirectory);
  if (!fs.existsSync(normalizedDir)) {
    throw new Error(`Directory does not exist: ${normalizedDir}`);
  }

  // Scan files without prior baseline to get fresh hashes
  const files = await scanDirectoryRecursively(normalizedDir, normalizedDir, {});

  const fileMap: Record<string, BaselineRecord> = {};
  const timestamp = new Date().toISOString();

  for (const f of files) {
    fileMap[f.path] = {
      path: f.path,
      fullPath: f.fullPath,
      name: f.name,
      size: f.size,
      extension: f.extension,
      modifiedAt: f.modifiedAt,
      sha256: f.sha256,
      timestamp,
    };
  }

  const baselineData: BaselineData = {
    createdAt: timestamp,
    updatedAt: timestamp,
    monitoredDirectory: normalizedDir,
    totalFiles: Object.keys(fileMap).length,
    files: fileMap,
  };

  saveBaseline(baselineData);
  return baselineData;
}

/**
 * Compares current directory state against the trusted baseline.
 */
export async function compareWithBaseline(
  targetDirectory: string,
  baseline: BaselineData | null
): Promise<{
  matched: FileRecord[];
  modified: FileRecord[];
  created: FileRecord[];
  deleted: BaselineRecord[];
  allCurrentFiles: FileRecord[];
}> {
  const normalizedDir = path.resolve(targetDirectory);
  const baselineMap: Record<string, { sha256: string; modifiedAt: string }> = {};

  if (baseline && baseline.files) {
    for (const [key, val] of Object.entries(baseline.files)) {
      baselineMap[key] = { sha256: val.sha256, modifiedAt: val.modifiedAt };
    }
  }

  const currentFiles = await scanDirectoryRecursively(normalizedDir, normalizedDir, baselineMap);

  const matched: FileRecord[] = [];
  const modified: FileRecord[] = [];
  const created: FileRecord[] = [];
  const currentPathSet = new Set<string>();

  for (const file of currentFiles) {
    currentPathSet.add(file.path);
    if (!baseline || !baseline.files[file.path]) {
      created.push(file);
    } else if (file.sha256 === baseline.files[file.path].sha256) {
      matched.push(file);
    } else {
      modified.push(file);
    }
  }

  const deleted: BaselineRecord[] = [];
  if (baseline && baseline.files) {
    for (const [relPath, baselineRecord] of Object.entries(baseline.files)) {
      if (!currentPathSet.has(relPath)) {
        deleted.push(baselineRecord);
      }
    }
  }

  return {
    matched,
    modified,
    created,
    deleted,
    allCurrentFiles: currentFiles,
  };
}
