import { BaseCommand } from "../../../../base-command.js";
import { setSharedServiceEnabled } from "../../../../services/shared.js";
import { setLogLevel } from "../../../../utils/log.js";

export default class ConfigSharedRedisDisable extends BaseCommand<
  typeof ConfigSharedRedisDisable
> {
  static description = "Disable the shared Redis service";

  static flags = {
    ...BaseCommand.baseFlags,
  };

  async run(): Promise<void> {
    setLogLevel(this.flags["log-level"]);
    await setSharedServiceEnabled("redis", false);
    this.log("Redis disabled");
  }
}
