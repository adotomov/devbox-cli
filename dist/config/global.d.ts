import { z } from 'zod';
export declare const globalConfigSchema: z.ZodObject<{
    cluster: z.ZodObject<{
        name: z.ZodDefault<z.ZodString>;
        sharedNamespace: z.ZodDefault<z.ZodString>;
        apiPort: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    registry: z.ZodObject<{
        name: z.ZodDefault<z.ZodString>;
        port: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    shared: z.ZodObject<{
        postgres: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            database: z.ZodDefault<z.ZodString>;
            username: z.ZodDefault<z.ZodString>;
            password: z.ZodDefault<z.ZodString>;
            storageSize: z.ZodDefault<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type GlobalConfig = z.infer<typeof globalConfigSchema>;
export declare function defaultGlobalConfig(): GlobalConfig;
