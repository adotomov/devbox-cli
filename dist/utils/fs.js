import os from 'node:os';
import path from 'node:path';
export function homeConfigDir() {
    return path.join(os.homedir(), '.config', 'devbox');
}
export function homeStateDir() {
    return path.join(os.homedir(), '.local', 'share', 'devbox');
}
export function tempDir() {
    return path.join(os.tmpdir(), 'devbox');
}
