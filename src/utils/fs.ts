import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function homeConfigDir(): string {
  return path.join(os.homedir(), ".config", "devbox");
}

export function homeStateDir(): string {
  return path.join(os.homedir(), ".local", "share", "devbox");
}

export function tempDir(): string {
  return path.join(os.tmpdir(), "devbox");
}

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function chmodRecursive(dir: string, mode: number): void {
  fs.chmodSync(dir, mode);

  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.lstatSync(fullPath);

    if (stat.isDirectory()) {
      chmodRecursive(fullPath, mode);
      continue;
    }

    fs.chmodSync(fullPath, mode);
  }
}

export function ensureDirWithMode(dir: string, mode: number): void {
  fs.mkdirSync(dir, { recursive: true });
  chmodRecursive(dir, mode);
}

export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

export function writeFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`writing file to disk ${filePath} ${content}`);
}

export function exists(filePath: string): boolean {
  return fs.existsSync(filePath);
}
