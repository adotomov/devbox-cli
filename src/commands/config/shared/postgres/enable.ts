import { BaseCommand } from "../../../../base-command.js";
import { setSharedServiceEnabled } from "../../../../services/shared.js";
import { setLogLevel } from "../../../../utils/log.js";

export default class ConfigSharedPostgresEnable extends BaseCommand<
  typeof ConfigSharedPostgresEnable
> {
  static description = "Enable the shared Postgres service";

  static flags = {
    ...BaseCommand.baseFlags,
  };

  async run(): Promise<void> {
    setLogLevel(this.flags["log-level"]);
    await setSharedServiceEnabled("postgres", true);
    this.log("Postgres enabled");
  }
}
