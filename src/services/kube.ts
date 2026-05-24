import path from "node:path";
import { tempDir, writeFile } from "../utils/fs.js";
import { run, runJson, runInherit } from "../utils/exec.js";

export async function kubectlApply(
  content: string,
  fileName: string,
): Promise<void> {
  const filePath = path.join(tempDir(), fileName);
  writeFile(filePath, content);
  await runInherit("kubectl", ["apply", "-f", filePath]);
}

export async function kubectlDelete(
  content: string,
  fileName: string,
): Promise<void> {
  const filePath = path.join(tempDir(), fileName);
  writeFile(filePath, content);
  await runInherit("kubectl", ["delete", "-f", filePath]);
}

export async function kubectlDeletenamespace(namespace: string): Promise<void> {
  await runInherit("kubectl", ["delete", "namespace", namespace]);
}

export async function kubectlGetJson<T>(args: string[]): Promise<T> {
  return runJson<T>("kubectl", [...args, "-o", "json"]);
}

export async function kubectlGetText(args: string[]): Promise<string> {
  return run("kubectl", args);
}

export async function namespaceExists(namespace: string): Promise<boolean> {
  try {
    await run("kubectl", ["get", "namespace", namespace]);
    return true;
  } catch {
    return false;
  }
}

function decodeSecretData(
  data: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    out[key] = Buffer.from(value, "base64").toString("utf-8");
  }
  return out;
}
