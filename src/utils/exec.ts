import { execa } from 'execa';

export async function run(cmd: string, args: string[], cwd?: string): Promise<string> {
  const result = await execa(cmd, args, {
    cwd,
    stdio: 'pipe'
  });

  return result.stdout;
}

export async function runJson<T>(cmd: string, args: string[], cwd?: string): Promise<T> {
  const stdout = await run(cmd, args, cwd);
  return JSON.parse(stdout);
}

export async function runInherit(cmd: string, args: string[], cwd?: string): Promise<void> {
  await execa(cmd, args, {
    cwd,
    stdio: 'inherit'
  })
}
