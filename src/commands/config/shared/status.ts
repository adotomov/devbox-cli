import { BaseCommand } from "../../../base-command.js";
import { sharedServicesStatus } from "../../../services/shared.js";
import { setLogLevel } from "../../../utils/log.js";

export default class ConfigSharedStatus extends BaseCommand<
  typeof ConfigSharedStatus
> {
  static description = "Show status for shared services";

  static flags = {
    ...BaseCommand.baseFlags,
  };

  async run(): Promise<void> {
    setLogLevel(this.flags["log-level"]);

    for (const line of await sharedServicesStatus()) {
      this.log(line);
    }
  }
}
