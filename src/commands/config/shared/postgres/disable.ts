import { BaseCommand } from "../../../../base-command.js";
import { setSharedServiceEnabled } from "../../../../services/shared.js";
import { setLogLevel } from "../../../../utils/log.js";

export default class ConfigSharedPostgresDisable extends BaseCommand<
  typeof ConfigSharedPostgresDisable
> {
  static description = "Disable the shared Postgres service";

  static flags = {
    ...BaseCommand.baseFlags,
  };

  async run(): Promise<void> {
    setLogLevel(this.flags["log-level"]);
    await setSharedServiceEnabled("postgres", false);
    this.log("Postgres disabled");
  }
}
