import path from 'node:path';
import YAML from 'yaml';
import { registry, z } from 'zod';

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
})

export type GlobalConfig = z.infer<typeof globalConfigSchema>;

export function defaultGlobalConfig(): GlobalConfig {
  return globalConfigSchema.parse({});
}

export function mergeGlobalConfig(base: GlobalConfig, incoming?: Partial<GlobalConfig>): GlobalConfig {
  return {
    cluster: {
      ...base.cluster,
      ...(incoming?.cluster ?? {})
    },
    registry: {
      ...base.registry,
      ...(incoming?.registry ?? {})
    },
    shared: {
      postgres: {
        ...base.shared.postgres,
        ...(incoming?.shared?.postgres ?? {}),
      }
    }
  }
}
