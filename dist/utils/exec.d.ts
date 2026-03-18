export declare function run(cmd: string, args: string[], cwd?: string): Promise<string>;
export declare function runJson<T>(cmd: string, args: string[], cwd?: string): Promise<T>;
export declare function runInherit(cmd: string, args: string[], cwd?: string): Promise<void>;
