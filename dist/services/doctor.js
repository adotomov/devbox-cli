import { run } from "../utils/exec.js";
const checks = [
    { name: 'docker', args: ['info'] },
    { name: 'k3d', args: ['version'] },
    { name: 'kubectl', args: ['version', '--client'] },
    { name: 'helm', args: ['version'] },
    { name: 'git', args: ['--version'] },
];
export async function doctor() {
    const result = [];
    for (const c of checks) {
        try {
            await run(c.name, c.args);
            result.push({ name: c.name, ok: true });
        }
        catch (error) {
            result.push({ name: c.name, ok: false });
        }
    }
    return result;
}
