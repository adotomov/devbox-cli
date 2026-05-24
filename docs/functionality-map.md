# Devbox CLI functionality map

This document captures the current implementation state of the devbox CLI, what is already working, what is still missing, and the next areas to extend.

## 1. Current command surface

The CLI currently exposes the following commands, confirmed from `node ./bin/run.js --help` and the generated manifest:

- `doctor` → checks local developer tooling
- `init` → bootstraps the machine-level devbox environment
- `reset` → removes the machine-level devbox environment
- `status` → shows machine-level status
- `project:init` → creates a project scaffold
- `config shared list` → lists available shared services
- `config shared status` → reports shared service state
- `config shared postgres enable|disable` → manages the shared Postgres service
- `config shared redis enable|disable` → manages the shared Redis service
- `config shared fakegcs enable|disable` → manages the shared Fake GCS service

### Command summary

| Command | Implemented | Notes |
| --- | --- | --- |
| `doctor` | Yes | Checks Docker, k3d, kubectl, helm, and git availability |
| `init` | Yes | Creates/starts a local k3d cluster, registry, shared namespace, and shared Postgres |
| `reset` | Yes | Deletes the cluster and registry, with confirmation unless `--yes` is set |
| `status` | Partial | Reads machine config and prints shared namespace status, but no comprehensive status model |
| `project:init` | Partial | Creates the project directory structure and writes `.devbox/project.yaml` and `.devbox/namespace.yaml` |
| `config shared list` | Yes | Lists all shared service names and enabled state |
| `config shared status` | Yes | Reports enabled/running state for each shared service |
| `config shared postgres enable|disable` | Yes | Enables or disables the shared Postgres service |
| `config shared redis enable|disable` | Yes | Enables or disables the shared Redis service |
| `config shared fakegcs enable|disable` | Yes | Enables or disables the shared Fake GCS service |

## 2. Current implementation map

### 2.1 Entry point and command wiring

- [src/index.ts](src/index.ts) boots oclif.
- [src/base-command.ts](src/base-command.ts) provides shared flag parsing and global `--log-level` support.
- [src/commands](src/commands) contains the exposed CLI commands.

### 2.2 Configuration model

#### Global machine config

- [src/config/global.ts](src/config/global.ts) defines the global config schema and defaults.
- The current global config stores:
  - cluster name
  - shared namespace
  - API port
  - registry name and port
  - shared Postgres settings

#### Project config

- [src/config/project.ts](src/config/project.ts) defines the project config schema, defaults, and helpers.
- The current project config stores:
  - project metadata
  - package manager
  - workspace directories
  - endpoint settings
  - entities list

### 2.3 Services

#### Machine lifecycle

- [src/services/cluster.ts](src/services/cluster.ts) contains the main machine bootstrap/reset/status flow.
- It currently:
  1. runs `doctor`
  2. writes global config
  3. ensures the k3d registry exists
  4. ensures the k3d cluster exists or starts it
  5. applies a local registry hosting config map
  6. ensures the shared namespace exists
  7. deploys shared Postgres via Helm
  8. applies a NodePort service for the shared Postgres instance

#### Project lifecycle

- [src/services/project.ts](src/services/project.ts) currently creates:
  - the project directory
  - `.devbox/`
  - `apps/`
  - `packages/`
  - `.devbox/project.yaml`
  - `.devbox/namespace.yaml`

#### Diagnostics

- [src/services/doctor.ts](src/services/doctor.ts) checks for:
  - Docker
  - k3d
  - kubectl
  - helm
  - git

#### Kubernetes helpers

- [src/services/kube.ts](src/services/kube.ts) provides helpers for:
  - `kubectl apply`
  - `kubectl delete`
  - `kubectl delete namespace`
  - `kubectl get` JSON/text wrappers
  - namespace existence checks

### 2.4 Manifests

- [src/manifests/cluster.ts](src/manifests/cluster.ts) contains manifests for the local registry host config map and namespace resources.
- [src/manifests/shared.ts](src/manifests/shared.ts) contains the shared Postgres Secret and NodePort service manifest, plus Redis and Fake GCS Kubernetes manifests.

### 2.5 Shared service orchestration

- [src/services/shared.ts](src/services/shared.ts) contains shared-service lifecycle helpers for:
  - listing available services
  - enabling and disabling Postgres, Redis, and Fake GCS
  - reporting shared service status
  - reconciling the shared service state with Kubernetes and Helm

### 2.5 Utilities

- [src/utils/exec.ts](src/utils/exec.ts) wraps `execa` for command execution, JSON parsing, and inheriting stdio.
- [src/utils/fs.ts](src/utils/fs.ts) wraps filesystem operations.
- [src/utils/log.ts](src/utils/log.ts) provides the logging interface.
- [src/utils/prompt.ts](src/utils/prompt.ts) provides confirmation prompts.

## 3. What is implemented today

### 3.1 Machine-level environment setup

The current implementation can:

- initialize a global devbox config
- create or start a k3d cluster
- create a local registry and wire it into the cluster
- create a shared namespace
- install shared Postgres
- expose shared Postgres via a NodePort
- delete the cluster and registry

### 3.2 Shared service management

The current implementation can:

- list the available shared services
- report shared service enabled/running state
- enable or disable Postgres, Redis, and Fake GCS
- apply Kubernetes manifests for Redis and Fake GCS
- uninstall Helm-managed Postgres and delete Postgres-related resources

### 3.3 Diagnostics

The tool can currently verify the presence of developer tooling required to bootstrap the environment.

### 3.4 Project scaffolding

The tool can currently create a project workspace skeleton and write YAML metadata files.

## 4. What is not implemented yet

### 4.1 Project lifecycle beyond scaffolding

The project commands are not yet fully functional. Missing capabilities include:

- creating project namespaces in Kubernetes
- applying project manifests
- creating or wiring project apps/packages
- resolving app ports and endpoints
- managing per-project local runtime state
- linking project resources to the shared cluster

### 4.2 Project status and health

There is no command for project-level status, only machine-level status support. The status surface does not yet provide a holistic view of:

- project existence
- project namespace status
- deployed entities
- endpoint reachability
- local proxy or ingress state

### 4.3 Shared service coverage

Shared service management is now implemented for the first set of services, but the current implementation is still limited:

- service definitions are hardcoded in code
- there is no user-facing service-specific configuration beyond enable/disable
- there is no richer lifecycle model such as versions, ports, or per-service settings

### 4.4 Command and schema completeness

Several areas appear incomplete or rough:

- `project:init` does not validate or create the project namespace from Kubernetes
- `status` only prints a small subset of machine state
- `doctor` only checks binaries and does not validate runtime readiness
- `writeFile` in [src/utils/fs.ts](src/utils/fs.ts) logs the full contents of files to stdout, which is noisy and not ideal for production behavior
- the logging output is currently not level-sensitive in a helpful way

### 4.5 Command surface gaps

The current command surface is quite minimal. Missing high-value commands include:

- project `status`
- project `up`
- project `down`
- app/package registration
- deploy / sync / restart operations
- ingress or endpoint management
- namespace cleanup
- secret and config management
- local service port forwarding

## 5. Current workflow assumptions

The code assumes the following workflow:

1. Run `init` to bootstrap the machine environment.
2. Run `project:init` to scaffold a project.
3. Later add commands to deploy and manage the project in the cluster.

At present, step 3 is not implemented.

## 6. Implementation status by area

### 6.1 Stable and usable

- global config schema
- machine bootstrap
- machine reset
- local registry setup
- shared namespace creation
- shared Postgres installation
- basic diagnostics
- project scaffold generation

### 6.2 Incomplete

- project deployment
- project status
- shared service abstraction
- endpoint management
- local container/app lifecycle

### 6.3 Not started

- service orchestration for projects
- runtime command orchestration
- HTTP/TLS endpoint management
- richer status/reporting
- tests and integration coverage

## 7. Recommended next steps

1. Decide the desired end-to-end workflow for a project.
2. Define the minimal set of runtime commands needed to manage a devbox project.
3. Implement project namespace creation and project status.
4. Add shared-service helpers and move reusable logic out of [src/services/cluster.ts](src/services/cluster.ts).
5. Replace ad hoc file logging with cleaner output handling.
6. Add tests for the configuration and service behavior.

## 8. Verification notes

The current implementation was verified with:

- `npm run build` → succeeded and wrote the oclif manifest
- `node ./bin/run.js --help` → confirmed the current command surface
- `node ./bin/run.js doctor` → confirmed the current dependency checks

## 9. Working hypothesis for the next phase

The repository is currently a solid foundation for machine-level environment orchestration, but it is not yet a complete project lifecycle tool. The next logical step is to turn the project scaffold into real project management, starting with project namespace creation and status reporting.
