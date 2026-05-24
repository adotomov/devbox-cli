export function localRegistryHostConfigMap(
  registryName: string,
  registryPort: number,
): string {
  return `apiVersion: v1
kind: ConfigMap
metadata:
  name: local-registry-hosting
  namespace: kube-public
data:
  localRegistryHosting.v1: |
    host: "k3d-${registryName}:${registryPort}"
    help: "https://k3d.io
`;
}

export function namespaceManifest(
  name: string,
  labels?: Record<string, string>,
): string {
  const labelsYaml =
    labels && Object.keys(labels).length > 0
      ? "\n labels:\n" +
        Object.entries(labels)
          .map(([key, value]) => `${key}:${value}`)
          .join("\n")
      : "";

  return `apiVersion: v1
kind: Namespace
metadata:
  name: ${name}${labelsYaml}`;
}

export function projectNamespaceManifest(
  name: string,
  projectName: string,
): string {
  return namespaceManifest(name, {
    "devbox/project": projectName,
    "devbox/managed": "true",
  });
}
