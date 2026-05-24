import path from "node:path";
import fs from "node:fs";
import {
  defaultProjectConfig,
  directoryIsEmpty,
  namespaceConfigPath,
  writeProjectConfig,
} from "../config/project.js";
import { ensureDir, writeFile } from "../utils/fs.js";
import { loadGlobalConfig } from "../config/global.js";

export type ProjectInitOptions = {
  cwd: string;
  name: string;
  type: string;
};

export async function initProject(opts: ProjectInitOptions): Promise<void> {
  const globalCfg = loadGlobalConfig();
  const projectRoot = path.join(opts.cwd, opts.name);
  console.log(`Project root is: ${projectRoot}`);

  if (fs.existsSync(projectRoot) && directoryIsEmpty(projectRoot)) {
    throw new Error(
      `Target directory already exists and is not empty: ${projectRoot}`,
    );
  }

  ensureDir(projectRoot);
  ensureDir(path.join(projectRoot, ".devbox"));
  ensureDir(path.join(projectRoot, "apps"));
  ensureDir(path.join(projectRoot, "packages"));

  const config = defaultProjectConfig(projectRoot, opts.name, opts.type);

  writeProjectConfig(config);

  const namespaceMeta = {
    name: config.namespace,
    project: config.name,
    createdAt: config.createdAt,
    sharedNamespace: globalCfg.cluster.sharedNamespace,
  };

  writeFile(
    namespaceConfigPath(projectRoot),
    `${JSON.stringify(namespaceMeta, null, 2)}\n`,
  );
}
