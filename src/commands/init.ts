import { Flags } from "@oclif/core";
import { BaseCommand } from "../base-command.js";
import { defaultGlobalConfig } from "../config/global.js";
import { setLogLevel } from "../utils/log.js";
import { initMachine } from "../services/cluster.js";

export default class Init extends BaseCommand<typeof Init> {
  static description = "Bootstrapping devbox environment";

  static flags = {
    ...BaseCommand.baseFlags,
    "cluster-name": Flags.string({
      summary: "Cluster name",
    }),
    "registry-port": Flags.integer({
      summary: "Local registry port",
    }),
    "shared-namespace": Flags.string({
      summary: "Shared resource namespace",
    }),
  };

  async run(): Promise<void> {
    const flags = this.flags;
    setLogLevel(flags["log-level"]);

    const config = defaultGlobalConfig();
    if (flags["cluster-name"]) config.cluster.name = flags["cluster-name"];
    if (flags["registry-port"]) config.registry.port = flags["registry-port"];
    if (flags["shared-namespace"])
      config.cluster.sharedNamespace = flags["shared-namespace"];

    const finalConfig = await initMachine(config);
    this.log(`Initialized devbox cluster ${finalConfig.cluster.name}`);
    this.log(`Registry: localhost:${finalConfig.registry.port}`);
    this.log(`Shared namespace: ${finalConfig.cluster.sharedNamespace}`);
  }
}
