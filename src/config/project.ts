import fs from "node:fs";
import path from "node:path";
import z from "zod";
import { exists, readFile, writeFile } from "../utils/fs.js";
import YAML from "yaml";

export const projectAppSchema = z.object({
  name: z.string(),
  kind: z.enum(["app", "package"]),
  path: z.string(),
  port: z.number().int().positive().optional(),
  runtime: z.enum(["node", "go", "python"]).default("node"),
  expose: z.boolean().default(true),
  state: z.enum(["local", "live", "hybrid"]).default("local"),
  createdAt: z.string(),
});

export const projectConfigSchema = z.object({
  cwd: z.string(),
  name: z.string(),
  type: z.enum(["monorepo", "standalone"]),
  namespace: z.string(),
  createdAt: z.string(),
  packageManager: z.enum(["pnpm", "npm"]),
  workspace: z.object({
    appsDir: z.string(),
    packagesDir: z.string(),
  }),
  endpoints: z.object({
    domainSuffix: z.string(),
    protocol: z.enum(["http", "https"]),
  }),
  entities: z.array(projectAppSchema),
});

export type ProjectConfig = z.infer<typeof projectConfigSchema>;
export type ProjectEntities = z.infer<typeof projectAppSchema>;

export function projectConfigPath(projectRoot: string): string {
  return path.join(projectRoot, ".devbox", "project.yaml");
}

export function namespaceConfigPath(projectRoot: string): string {
  return path.join(projectRoot, ".devbox", "namespace.yaml");
}

export function defaultProjectConfig(
  projectRoot: string,
  name: string,
  type: string,
): ProjectConfig {
  return projectConfigSchema.parse({
    name,
    cwd: projectRoot,
    type,
    namespace: name,
    createdAt: new Date().toISOString(),
    packageManager: "pnpm",
    workspace: {
      appsDir: "apps",
      packagesDir: "packages",
    },
    endpoints: {
      domainSuffix: "localhost",
      protocol: "http",
    },
    entities: [],
  });
}

export function writeProjectConfig(config: ProjectConfig): string {
  const file = projectConfigPath(config.cwd);
  writeFile(file, YAML.stringify(config));
  return file;
}

export function loadProjectConfig(projectRoot: string): ProjectConfig {
  const file = projectConfigPath(projectRoot);
  if (!exists(file)) {
    throw new Error(
      `Project config not found at ${file}. Run \`devbox project init\`.`,
    );
  }

  return projectConfigSchema.parse(YAML.parse(readFile(file)) ?? {});
}

export function findProjectRoot(startDir = process.cwd()): string {
  let current = path.resolve(startDir);

  while (true) {
    const marker = path.join(current, ".devbox", "project.yaml");
    if (exists(marker)) return current;

    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error("Not inside a devbox project.");
    }

    current = parent;
  }
}

export function directoryIsEmpty(dir: string): boolean {
  return !exists(dir) || fs.readdirSync(dir).length === 0;
}
