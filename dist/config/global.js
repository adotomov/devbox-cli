import path from "node:path";
import YAML from "yaml";
import { z } from "zod";
import { exists, homeConfigDir, writeFile, readFile } from "../utils/fs.js";
const sharedServiceStateSchema = z.object({
    enabled: z.boolean(),
});
export const globalConfigSchema = z.object({
    cluster: z.object({
        name: z.string(),
        sharedNamespace: z.string(),
        apiPort: z.number().int().positive(),
    }),
    registry: z.object({
        name: z.string(),
        port: z.number().int().positive(),
    }),
    shared: z.object({
        postgres: z.object({
            enabled: z.boolean(),
            database: z.string(),
            username: z.string(),
            password: z.string(),
            storageSize: z.string(),
        }),
        services: z.object({
            postgres: sharedServiceStateSchema,
            redis: sharedServiceStateSchema,
            fakegcs: sharedServiceStateSchema,
        }),
    }),
});
export function defaultGlobalConfig() {
    const defaultCfg = {
        cluster: {
            name: "devbox",
            sharedNamespace: "shared",
            apiPort: 6550,
        },
        registry: {
            name: "devbox-registry.localhost",
            port: 5001,
        },
        shared: {
            postgres: {
                enabled: true,
                database: "app",
                username: "devbox",
                password: "devbox",
                storageSize: "5Gi",
            },
            services: {
                postgres: { enabled: true },
                redis: { enabled: false },
                fakegcs: { enabled: false },
            },
        },
    };
    return globalConfigSchema.parse(defaultCfg);
}
export function globalConfigPath() {
    return path.join(homeConfigDir(), "config.yaml");
}
export function mergeGlobalConfig(base, incoming) {
    return {
        cluster: {
            ...base.cluster,
            ...(incoming?.cluster ?? {}),
        },
        registry: {
            ...base.registry,
            ...(incoming?.registry ?? {}),
        },
        shared: {
            postgres: {
                ...base.shared.postgres,
                ...(incoming?.shared?.postgres ?? {}),
            },
            services: {
                postgres: {
                    ...base.shared.services.postgres,
                    ...(incoming?.shared?.services?.postgres ?? {}),
                },
                redis: {
                    ...base.shared.services.redis,
                    ...(incoming?.shared?.services?.redis ?? {}),
                },
                fakegcs: {
                    ...base.shared.services.fakegcs,
                    ...(incoming?.shared?.services?.fakegcs ?? {}),
                },
            },
        },
    };
}
export function loadGlobalConfig() {
    const file = globalConfigPath();
    if (!exists(file)) {
        throw new Error("Global devbox config not found. Run `devbox init` first.");
    }
    const parsed = YAML.parse(readFile(file)) ?? {};
    return globalConfigSchema.parse(mergeGlobalConfig(defaultGlobalConfig(), parsed));
}
export function writeGlobalConfig(config) {
    const file = globalConfigPath();
    writeFile(file, YAML.stringify(config));
    return file;
}
export function clusterRegistryName(name) {
    return `k3d-${name}`;
}
export function clusterRegistryRef(config) {
    return `${clusterRegistryName(config.registry.name)}:${config.registry.port}`;
}
export function hostRegistryRef(config) {
    return `localhost:${config.registry.port}`;
}
