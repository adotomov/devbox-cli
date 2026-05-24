import path from "node:path";
import { GlobalConfig } from "../config/global.js";
import { homeStateDir } from "../utils/fs.js";

export const postgresPersistenceNodePath =
  "/var/lib/rancher/k3s/devbox/postgres";

export function postgresPersistenceHostPath(): string {
  return path.join(homeStateDir(), "postgres");
}

export function sharedDbSecret(config: GlobalConfig): string {
  return `apiVersion: v1
kind: Secret
metadata:
  name: shared-db-credentials
  namespace: "${config.cluster.sharedNamespace}"
type: Opaque
stringData:
  POSTGRES_DB: "${config.shared.postgres.database}"
  POSTGRES_USER: "${config.shared.postgres.username}"
  POSTGRES_PASSWORD: "${config.shared.postgres.password}"
`;
}

export function sharedPostgresExternalService(config: GlobalConfig): string {
  return `apiVersion: v1
kind: Service
metadata:
  name: postgres-external
  namespace: ${config.cluster.sharedNamespace}
spec:
  type: NodePort
  selector:
    app.kubernetes.io/instance: postgres
    app.kubernetes.io/name: postgresql
  ports:
    - name: postgres
      protocol: TCP
      port: 5432
      targetPort: 5432
      nodePort: 30432
`;
}

export function postgresPersistentVolume(config: GlobalConfig): string {
  return `apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-data
spec:
  storageClassName: manual
  capacity:
    storage: ${config.shared.postgres.storageSize}
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: ${postgresPersistenceNodePath}
    type: DirectoryOrCreate
`;
}

export function postgresPersistentVolumeClaim(config: GlobalConfig): string {
  return `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-data
  namespace: ${config.cluster.sharedNamespace}
spec:
  storageClassName: manual
  accessModes:
    - ReadWriteOnce
  volumeName: postgres-data
  resources:
    requests:
      storage: ${config.shared.postgres.storageSize}
`;
}

export function redisManifest(namespace: string): string {
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: ${namespace}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:7-alpine
          ports:
            - containerPort: 6379
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: ${namespace}
spec:
  selector:
    app: redis
  ports:
    - name: redis
      port: 6379
      targetPort: 6379
`;
}

export function fakeGcsManifest(namespace: string): string {
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: fakegcs
  namespace: ${namespace}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: fake-gcs
  template:
    metadata:
      labels:
        app: fake-gcs
    spec:
      containers:
        - name: fakegcs
          image: fsouza/fake-gcs-server:latest
          ports:
            - containerPort: 4443
---
apiVersion: v1
kind: Service
metadata:
  name: fakegcs
  namespace: ${namespace}
spec:
  type: NodePort
  selector:
    app: fake-gcs
  ports:
    - name: fakegcs
      port: 4443
      targetPort: 4443
      nodePort: 30443
`;
}
