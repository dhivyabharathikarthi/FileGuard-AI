/**
 * @file hasher.ts
 * @description Cryptographic File Hashing and Metadata Extraction Engine.
 * Implements read-only SHA-256 cryptographic hashing using Node.js crypto APIs.
 * Intended for forensic integrity verification without altering original artifacts.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { FileRecord, HashStatus } from '../types/fim.js';

// Extensions often considered executable or scriptable
const EXECUTABLE_EXTENSIONS = new Set([
  '.exe', '.dll', '.bin', '.elf', '.sh', '.bat', '.ps1', '.cmd', 
  '.vbs', '.js', '.vbe', '.wsf', '.scr', '.com', '.msi', '.apk'
]);

// Critical or configuration files
const CONFIG_FILES = new Set([
  'config.json', 'settings.json', 'database.json', '.env', 'hosts',
  'web.config', 'nginx.conf', 'application.yml', 'application.properties',
  'passwd', 'shadow', 'authorized_keys', 'id_rsa'
]);

const CONFIG_EXTENSIONS = new Set([
  '.conf', '.config', '.env', '.yaml', '.yml', '.ini', '.key', '.pem', '.crt'
]);

/**
 * Calculates SHA-256 hash of a file using streams.
 * Ensures the target file is opened in strict read-only mode and never modified.
 */
export async function calculateSha256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(filePath)) {
        return reject(new Error(`File not found: ${filePath}`));
      }

      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath, { flags: 'r' });

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Validates and sanitizes a target path to prevent directory traversal attacks.
 */
export function sanitizePath(baseDir: string, targetPath: string): string {
  const normalizedBase = path.resolve(baseDir);
  const normalizedTarget = path.resolve(baseDir, targetPath);

  if (!normalizedTarget.startsWith(normalizedBase)) {
    throw new Error('Access denied: Path traversal attempted outside monitored boundary');
  }

  return normalizedTarget;
}

/**
 * Inspects a single file and extracts its forensic metadata & SHA-256 hash.
 */
export async function inspectFile(
  fullPath: string, 
  baseDir: string,
  baselineHash?: string,
  baselineModifiedAt?: string
): Promise<FileRecord> {
  const stats = await fs.promises.stat(fullPath);
  const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
  const fileName = path.basename(fullPath);
  const extension = path.extname(fileName).toLowerCase();

  let sha256 = '';
  try {
    sha256 = await calculateSha256(fullPath);
  } catch (err) {
    sha256 = 'UNREADABLE_OR_LOCKED';
  }

  let hashStatus: HashStatus = 'NEW';
  if (baselineHash) {
    hashStatus = (sha256 === baselineHash) ? 'MATCH' : 'CHANGED';
  }

  const isExecutable = EXECUTABLE_EXTENSIONS.has(extension);
  const isConfiguration = CONFIG_FILES.has(fileName.toLowerCase()) || CONFIG_EXTENSIONS.has(extension);

  return {
    path: relativePath,
    fullPath,
    name: fileName,
    size: stats.size,
    extension,
    createdAt: stats.birthtime.toISOString(),
    modifiedAt: stats.mtime.toISOString(),
    sha256,
    hashStatus,
    baselineHash,
    baselineModifiedAt,
    isExecutable,
    isConfiguration,
  };
}

/**
 * Recursively scans a directory and extracts file records.
 * Skips version control (.git) and build directories (node_modules, dist) for performance.
 */
export async function scanDirectoryRecursively(
  dirPath: string,
  baseDir: string = dirPath,
  baselineMap: Record<string, { sha256: string; modifiedAt: string }> = {}
): Promise<FileRecord[]> {
  const records: FileRecord[] = [];
  const normalizedDir = path.resolve(dirPath);

  if (!fs.existsSync(normalizedDir)) {
    return records;
  }

  const entries = await fs.promises.readdir(normalizedDir, { withFileTypes: true });

  for (const entry of entries) {
    // Ignore internal dev/temp artifacts
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.vite') {
      continue;
    }

    const fullEntryPath = path.join(normalizedDir, entry.name);

    if (entry.isDirectory()) {
      const subRecords = await scanDirectoryRecursively(fullEntryPath, baseDir, baselineMap);
      records.push(...subRecords);
    } else if (entry.isFile()) {
      try {
        const relativePath = path.relative(baseDir, fullEntryPath).replace(/\\/g, '/');
        const baseline = baselineMap[relativePath];
        const record = await inspectFile(
          fullEntryPath,
          baseDir,
          baseline?.sha256,
          baseline?.modifiedAt
        );
        records.push(record);
      } catch (err) {
        console.error(`Error inspecting file ${fullEntryPath}:`, err);
      }
    }
  }

  return records;
}
