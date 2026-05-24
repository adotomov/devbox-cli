import { BaseCommand } from "../../../../base-command.js";
import { setSharedServiceEnabled } from "../../../../services/shared.js";
import { setLogLevel } from "../../../../utils/log.js";

export default class ConfigSharedFakeGcsEnable extends BaseCommand<
  typeof ConfigSharedFakeGcsEnable
> {
  static description = "Enable the shared Fake GCS service";

  static flags = {
    ...BaseCommand.baseFlags,
  };

  async run(): Promise<void> {
    setLogLevel(this.flags["log-level"]);
    await setSharedServiceEnabled("fakegcs", true);
    this.log("Fake GCS enabled");
  }
}
