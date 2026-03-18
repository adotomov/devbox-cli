import { execa } from 'execa';
export async function run(cmd, args, cwd) {
    const result = await execa(cmd, args, {
        cwd,
        stdio: 'pipe'
    });
    return result.stdout;
}
export async function runJson(cmd, args, cwd) {
    const stdout = await run(cmd, args, cwd);
    return JSON.parse(stdout);
}
export async function runInherit(cmd, args, cwd) {
    await execa(cmd, args, {
        cwd,
        stdio: 'inherit'
    });
}
