import {
  loadGlobalConfig,
  writeGlobalConfig,
  type GlobalConfig,
} from "../config/global.js";
import {
  sharedDbSecret,
  sharedPostgresExternalService,
  redisManifest,
  fakeGcsManifest,
  postgresPersistentVolumeClaim,
  postgresPersistentVolume,
} from "../manifests/shared.js";
import { kubectlApply, kubectlDelete } from "./kube.js";
import { runJson, runInherit } from "../utils/exec.js";
import { log } from "../utils/log.js";

export type SharedServiceName = "postgres" | "redis" | "fakegcs";

export const sharedServiceNames: SharedServiceName[] = [
  "postgres",
  "redis",
  "fakegcs",
];

export function sharedServiceDisplayName(service: SharedServiceName): string {
  switch (service) {
    case "postgres":
      return "Postgres";
    case "redis":
      return "Redis";
    case "fakegcs":
      return "Fake GCS";
  }
}

export function sharedServiceDefaultConfig(): Record<
  SharedServiceName,
  { enabled: boolean }
> {
  return {
    postgres: { enabled: true },
    redis: { enabled: false },
    fakegcs: { enabled: false },
  };
}

export function sharedServiceEnabled(
  config: GlobalConfig,
  service: SharedServiceName,
): boolean {
  return config.shared.services[service].enabled;
}

export function postgresPersistentVolumeClaimName(): string {
  return "postgres-data";
}

export async function listSharedServices(): Promise<
  Array<{ name: SharedServiceName; displayName: string; enabled: boolean }>
> {
  const config = loadGlobalConfig();

  return sharedServiceNames.map((service) => ({
    name: service,
    displayName: sharedServiceDisplayName(service),
    enabled: sharedServiceEnabled(config, service),
  }));
}

export async function ensureSharedPostgres(
  config: GlobalConfig,
): Promise<void> {
  log.info("Ensuring shared Postgres service");

  await runInherit("helm", [
    "repo",
    "add",
    "bitnami",
    "https://charts.bitnami.com/bitnami",
  ]).catch(() => undefined);
  await runInherit("helm", ["repo", "update"]);

  await kubectlApply(
    postgresPersistentVolume(config),
    "shared-postgres-pv.yaml",
  );
  await kubectlApply(
    postgresPersistentVolumeClaim(config),
    "shared-postgres-pvc.yaml",
  );

  await runInherit("helm", [
    "upgrade",
    "--install",
    "postgres",
    "bitnami/postgresql",
    "--namespace",
    config.cluster.sharedNamespace,
    "--set",
    `auth.username=${config.shared.postgres.username}`,
    "--set",
    `auth.password=${config.shared.postgres.password}`,
    "--set",
    `auth.database=${config.shared.postgres.database}`,
    "--set",
    `primary.persistence.existingClaim=${postgresPersistentVolumeClaimName()}`,
    "--set",
    `primary.persistence.size=${config.shared.postgres.storageSize}`,
    "--set",
    "service.type=ClusterIP",
  ]);

  await kubectlApply(sharedDbSecret(config), "shared-db-secret.yaml");
  await kubectlApply(
    sharedPostgresExternalService(config),
    "shared-postgres-external.yaml",
  );
}

export async function disableSharedPostgres(
  config: GlobalConfig,
): Promise<void> {
  log.info("Disabling shared Postgres service");

  await runInherit("helm", [
    "uninstall",
    "postgres",
    "--namespace",
    config.cluster.sharedNamespace,
  ]).catch(() => undefined);

  await kubectlDelete(sharedDbSecret(config), "shared-db-secret.yaml").catch(
    () => undefined,
  );
  await kubectlDelete(
    sharedPostgresExternalService(config),
    "shared-postgres-external.yaml",
  ).catch(() => undefined);
}

export async function ensureSharedRedis(config: GlobalConfig): Promise<void> {
  log.info("Ensuring shared Redis service");
  await kubectlApply(
    redisManifest(config.cluster.sharedNamespace),
    "shared-redis.yaml",
  );
}

export async function disableSharedRedis(config: GlobalConfig): Promise<void> {
  log.info("Disabling shared Redis service");
  await kubectlDelete(
    redisManifest(config.cluster.sharedNamespace),
    "shared-redis.yaml",
  ).catch(() => undefined);
}

export async function ensureSharedFakeGcs(config: GlobalConfig): Promise<void> {
  log.info("Ensuring shared Fake GCS service");
  await kubectlApply(
    fakeGcsManifest(config.cluster.sharedNamespace),
    "shared-fakegcs.yaml",
  );
}

export async function disableSharedFakeGcs(
  config: GlobalConfig,
): Promise<void> {
  log.info("Disabling shared Fake GCS service");
  await kubectlDelete(
    fakeGcsManifest(config.cluster.sharedNamespace),
    "shared-fakegcs.yaml",
  ).catch(() => undefined);
}

export async function ensureSharedService(
  service: SharedServiceName,
  config: GlobalConfig,
): Promise<void> {
  switch (service) {
    case "postgres":
      await ensureSharedPostgres(config);
      return;
    case "redis":
      await ensureSharedRedis(config);
      return;
    case "fakegcs":
      await ensureSharedFakeGcs(config);
      return;
  }
}

export async function disableSharedService(
  service: SharedServiceName,
  config: GlobalConfig,
): Promise<void> {
  switch (service) {
    case "postgres":
      await disableSharedPostgres(config);
      return;
    case "redis":
      await disableSharedRedis(config);
      return;
    case "fakegcs":
      await disableSharedFakeGcs(config);
      return;
  }
}

export async function setSharedServiceEnabled(
  service: SharedServiceName,
  enabled: boolean,
): Promise<void> {
  const config = loadGlobalConfig();
  const currentlyEnabled = sharedServiceEnabled(config, service);

  if (currentlyEnabled === enabled) {
    log.info(
      `${sharedServiceDisplayName(service)} is already ${enabled ? "enabled" : "disabled"}`,
    );
    return;
  }

  if (enabled) {
    await ensureSharedService(service, config);
  } else {
    await disableSharedService(service, config);
  }

  config.shared.services[service].enabled = enabled;
  if (service === "postgres") {
    config.shared.postgres.enabled = enabled;
  }

  writeGlobalConfig(config);
}

async function helmReleaseExists(namespace: string): Promise<boolean> {
  try {
    const releases = await runJson<Array<{ name: string }>>("helm", [
      "list",
      "--namespace",
      namespace,
      "-o",
      "json",
    ]);

    return releases.some((release) => release.name === "postgres");
  } catch {
    return false;
  }
}

async function deploymentExists(
  namespace: string,
  label: string,
  name: string,
): Promise<boolean> {
  try {
    const deployments = await runJson<{
      items: Array<{ metadata: { name: string } }>;
    }>("kubectl", [
      "get",
      "deployment",
      "-n",
      namespace,
      "-l",
      label,
      "-o",
      "json",
    ]);

    return deployments.items.some(
      (deployment) => deployment.metadata.name === name,
    );
  } catch {
    return false;
  }
}

export async function sharedServicesStatus(): Promise<string[]> {
  const config = loadGlobalConfig();
  const namespace = config.cluster.sharedNamespace;
  const lines = [`Shared namespace: ${namespace}`];

  for (const service of sharedServiceNames) {
    const enabled = sharedServiceEnabled(config, service);

    let running = false;
    if (enabled) {
      if (service === "postgres") {
        running = await helmReleaseExists(namespace);
      } else if (service === "redis") {
        running = await deploymentExists(namespace, "app=redis", "redis");
      } else if (service === "fakegcs") {
        running = await deploymentExists(namespace, "app=fake-gcs", "fakegcs");
      }
    }

    lines.push(
      `${sharedServiceDisplayName(service)}: enabled=${enabled ? "yes" : "no"}, running=${running ? "yes" : "no"}`,
    );
  }

  return lines;
}
