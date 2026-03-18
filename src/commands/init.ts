import { Flags } from "@oclif/core";
import { BaseCommand } from "../base-command.js";
import { defaultGlobalConfig } from "../config/global.js";
import { setLogLevel } from "../utils/log.js";

export default class Init extends BaseCommand<typeof Init> {
  static description = 'Bootstrapping devbox environment'

  static flags = {
    ...BaseCommand.baseFlags,
    'cluster-name': Flags.string({
      summary: 'Cluster name',
    }),
    'registry-port': Flags.integer({
      summary: 'Local registry port',
    }),
    'shared-namespace': Flags.string({
      summary: 'Shared resource namespace'
    }),
  }

  async run(): Promise<void> {
    const flags = this.flags;
    setLogLevel(flags['log-level'])

    const config = defaultGlobalConfig();
  }
}