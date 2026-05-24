import { BaseCommand } from "../../../base-command.js";
import { listSharedServices } from "../../../services/shared.js";
import { setLogLevel } from "../../../utils/log.js";

export default class ConfigSharedList extends BaseCommand<
  typeof ConfigSharedList
> {
  static description = "List available shared services";

  static flags = {
    ...BaseCommand.baseFlags,
  };

  async run(): Promise<void> {
    setLogLevel(this.flags["log-level"]);

    const services = await listSharedServices();
    for (const service of services) {
      this.log(
        `${service.displayName}: ${service.enabled ? "enabled" : "disabled"}`,
      );
    }
  }
}
