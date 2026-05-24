import { BaseCommand } from "../../../../base-command.js";
import { setSharedServiceEnabled } from "../../../../services/shared.js";
import { setLogLevel } from "../../../../utils/log.js";

export default class ConfigSharedRedisEnable extends BaseCommand<
  typeof ConfigSharedRedisEnable
> {
  static description = "Enable the shared Redis service";

  static flags = {
    ...BaseCommand.baseFlags,
  };

  async run(): Promise<void> {
    setLogLevel(this.flags["log-level"]);
    await setSharedServiceEnabled("redis", true);
    this.log("Redis enabled");
  }
}
