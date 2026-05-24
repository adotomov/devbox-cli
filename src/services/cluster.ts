import {
  clusterRegistryName,
  clusterRegistryRef,
  defaultGlobalConfig,
  GlobalConfig,
  hostRegistryRef,
  loadGlobalConfig,
  mergeGlobalConfig,
  writeGlobalConfig,
} from "../config/global.js";
import {
  localRegistryHostConfigMap,
  namespaceManifest,
} from "../manifests/cluster.js";
import {
  postgresPersistenceHostPath,
  postgresPersistenceNodePath,
  sharedDbSecret,
} from "../manifests/shared.js";
import { ensureDirWithMode } from "../utils/fs.js";
import { runInherit, runJson } from "../utils/exec.js";
import { log } from "../utils/log.js";
import { doctor } from "./doctor.js";
import { kubectlApply, kubectlGetText, namespaceExists } from "./kube.js";
import { ensureSharedPostgres } from "./shared.js";

export async function initMachine(
  options?: Partial<GlobalConfig>,
): Promise<GlobalConfig> {
  const hc = await doctor();

  const missing = hc.filter((c) => !c.ok);
  if (missing.length > 0) {
    throw new Error(
      `Missing dependencies: ${missing.map((i) => i.name).join(", ")}`,
    );
  }

  const cfg = mergeGlobalConfig(defaultGlobalConfig(), options);
  writeGlobalConfig(cfg);

  await ensureRegistry(cfg);
  await ensureCluster(cfg);
  await ensureSharedNamespace(cfg);
  await installSharedServices(cfg);

  return cfg;
}

async function ensureRegistry(cfg: GlobalConfig): Promise<void> {
  const { name } = cfg.registry;

  try {
    const registries = await runJson<Array<{ name: string }>>("k3d", [
      "registry",
      "list",
      "-o",
      "json",
    ]);

    const exists = registries.some(
      (registry) => registry.name === clusterRegistryName(cfg.registry.name),
    );

    if (exists) {
      log.info(
        `Using existing registry ${clusterRegistryName(cfg.registry.name)}`,
      );
      return;
    }
  } catch {
    // continue
  }

  log.info(`Creating registry ${name}:${cfg.registry.port}`);
  await runInherit("k3d", [
    "registry",
    "create",
    name,
    "--port",
    String(cfg.registry.port),
  ]);
}

async function ensureCluster(cfg: GlobalConfig): Promise<void> {
  const clusters = await runJson<Array<{ name: string }>>("k3d", [
    "cluster",
    "list",
    "-o",
    "json",
  ]).catch(() => []);
  const exists = clusters.some((cluster) => cluster.name === cfg.cluster.name);

  if (!exists) {
    ensureDirWithMode(postgresPersistenceHostPath(), 0o777);

    log.info(`Creating cluster ${cfg.cluster.name}`);
    await runInherit("k3d", [
      "cluster",
      "create",
      cfg.cluster.name,
      "--api-port",
      String(cfg.cluster.apiPort),
      "-p",
      "80:80@loadbalancer",
      "-p",
      "443:443@loadbalancer",
      "-p",
      "5432:30432@loadbalancer",
      "-p",
      "4443:30443@loadbalancer",
      "--registry-use",
      clusterRegistryRef(cfg),
      "--volume",
      `${postgresPersistenceHostPath()}:${postgresPersistenceNodePath}`,
      "--wait",
    ]);
  } else {
    log.info(`Starting existing cluster ${cfg.cluster.name}`);
    await runInherit("k3d", ["cluster", "start", cfg.cluster.name]);
  }

  await kubectlApply(
    localRegistryHostConfigMap(cfg.registry.name, cfg.registry.port),
    "local-registry-hosting.yaml",
  );
}

async function ensureSharedNamespace(cfg: GlobalConfig): Promise<void> {
  if (!(await namespaceExists(cfg.cluster.sharedNamespace))) {
    await kubectlApply(
      namespaceManifest(cfg.cluster.sharedNamespace),
      "shared-db-secret.yaml",
    );
  }

  if (cfg.shared.services.postgres.enabled) {
    await kubectlApply(sharedDbSecret(cfg), "shared-db-secret.yaml");
  }
}

async function installSharedServices(config: GlobalConfig): Promise<void> {
  if (config.shared.services.postgres.enabled) {
    await ensureSharedPostgres(config);
  }
}

export async function globalStatus(): Promise<string> {
  const cfg = loadGlobalConfig();
  const lines: string[] = [];
  lines.push(`Cluster: ${cfg.cluster.name}`);
  lines.push(`Registry host push: ${hostRegistryRef(cfg)}`);
  lines.push(`Registry cluster ref: ${clusterRegistryRef(cfg)}`);
  lines.push(`Shared namespace: ${cfg.cluster.sharedNamespace}`);
  lines.push("");

  try {
    lines.push(
      await kubectlGetText([
        "get",
        "pods",
        "-n",
        cfg.cluster.sharedNamespace,
        "-o",
        "wide",
      ]),
    );
  } catch {
    lines.push("Shared namespace status unavailable");
  }

  return lines.join("\n");
}

export async function resetMachine(): Promise<void> {
  const cfg = loadGlobalConfig();

  await runInherit("k3d", ["cluster", "delete", cfg.cluster.name]).catch(
    () => undefined,
  );
  await runInherit("k3d", ["registry", "delete", cfg.registry.name]).catch(
    () => undefined,
  );

  log.ok("Removed devbox cluster and registry");
}
