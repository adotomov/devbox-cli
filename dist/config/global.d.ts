import { z } from "zod";
export declare const globalConfigSchema: z.ZodObject<{
    cluster: z.ZodObject<{
        name: z.ZodString;
        sharedNamespace: z.ZodString;
        apiPort: z.ZodNumber;
    }, z.core.$strip>;
    registry: z.ZodObject<{
        name: z.ZodString;
        port: z.ZodNumber;
    }, z.core.$strip>;
    shared: z.ZodObject<{
        postgres: z.ZodObject<{
            enabled: z.ZodBoolean;
            database: z.ZodString;
            username: z.ZodString;
            password: z.ZodString;
            storageSize: z.ZodString;
        }, z.core.$strip>;
        services: z.ZodObject<{
            postgres: z.ZodObject<{
                enabled: z.ZodBoolean;
            }, z.core.$strip>;
            redis: z.ZodObject<{
                enabled: z.ZodBoolean;
            }, z.core.$strip>;
            fakegcs: z.ZodObject<{
                enabled: z.ZodBoolean;
            }, z.core.$strip>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type GlobalConfig = z.infer<typeof globalConfigSchema>;
export declare function defaultGlobalConfig(): GlobalConfig;
export declare function globalConfigPath(): string;
export declare function mergeGlobalConfig(base: GlobalConfig, incoming?: Partial<GlobalConfig>): GlobalConfig;
export declare function loadGlobalConfig(): GlobalConfig;
export declare function writeGlobalConfig(config: GlobalConfig): string;
export declare function clusterRegistryName(name: string): string;
export declare function clusterRegistryRef(config: GlobalConfig): string;
export declare function hostRegistryRef(config: GlobalConfig): string;
