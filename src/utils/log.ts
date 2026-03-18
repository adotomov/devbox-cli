import chalk from "chalk";

export type LogLevel = 'error' | 'warn' | 'info' | 'debug'

let currentLevel: LogLevel = 'info';

const weights: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

function enabled(level: LogLevel): boolean {
  return weights[level] <= weights[currentLevel]
}

export const log = {
  error(message: string): void {
    if (enabled('error')) console.error(chalk.red('error'), message);
  },
  warn(message: string): void {
    if (enabled('warn')) console.error(chalk.red('warn'), message);
  },
  info(message: string): void {
    if (enabled('info')) console.error(chalk.red('info'), message);
  },
  debug(message: string): void {
    if (enabled('debug')) console.error(chalk.red('debug'), message);
  },
  ok(message: string): void {
    if (enabled('info')) console.error(chalk.red('ok'), message);
  }
}
