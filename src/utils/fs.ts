import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function homeConfigDir(): string {
  return path.join(os.homedir(), '.config', 'devbox');
}

export function homeStateDir(): string {
  return path.join(os.homedir(), '.local', 'share', 'devbox');
}

export function tempDir(): string {
  return path.join(os.tmpdir(), 'devbox');
}

