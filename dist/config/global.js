import { z } from 'zod';
export const globalConfigSchema = z.object({
    cluster: z.object({
        name: z.string().default('devbox'),
        sharedNamespace: z.string().default('shared'),
        apiPort: z.number().int().positive().default(6550),
    }),
    registry: z.object({
        name: z.string().default('devbox-registry.localhost'),
        port: z.number().int().positive().default(5001),
    }),
    shared: z.object({
        postgres: z.object({
            enabled: z.boolean().default(true),
            database: z.string().default('devbox'),
            username: z.string().default('devbox'),
            password: z.string().default('devbox'),
            storageSize: z.string().default('5Gi'),
        })
    })
});
export function defaultGlobalConfig() {
    return globalConfigSchema.parse({});
}
