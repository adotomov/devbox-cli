import { BaseCommand } from "../base-command.js";
import { globalStatus } from "../services/cluster.js";
import { setLogLevel } from "../utils/log.js";

export default class Status extends BaseCommand<typeof Status> {
  static description = "Show machine-level devbox status";

  static flags = {
    ...BaseCommand.baseFlags,
  };

  async run(): Promise<void> {
    const flags = this.flags;
    setLogLevel(flags["log-level"]);
    this.log(await globalStatus());
  }
}
