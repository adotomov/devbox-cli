export declare function homeConfigDir(): string;
export declare function homeStateDir(): string;
export declare function tempDir(): string;
export declare function ensureDir(dir: string): void;
export declare function ensureDirWithMode(dir: string, mode: number): void;
export declare function readFile(filePath: string): string;
export declare function writeFile(filePath: string, content: string): void;
export declare function exists(filePath: string): boolean;
