import fs from "node:fs";
import os from "node:os";
import path from "node:path";
export function homeConfigDir() {
    return path.join(os.homedir(), ".config", "devbox");
}
export function homeStateDir() {
    return path.join(os.homedir(), ".local", "share", "devbox");
}
export function tempDir() {
    return path.join(os.tmpdir(), "devbox");
}
export function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}
function chmodRecursive(dir, mode) {
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
export function ensureDirWithMode(dir, mode) {
    fs.mkdirSync(dir, { recursive: true });
    chmodRecursive(dir, mode);
}
export function readFile(filePath) {
    return fs.readFileSync(filePath, "utf-8");
}
export function writeFile(filePath, content) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`writing file to disk ${filePath} ${content}`);
}
export function exists(filePath) {
    return fs.existsSync(filePath);
}
