import { BaseCommand } from "../../../../base-command.js";
import { setSharedServiceEnabled } from "../../../../services/shared.js";
import { setLogLevel } from "../../../../utils/log.js";

export default class ConfigSharedFakeGcsDisable extends BaseCommand<
  typeof ConfigSharedFakeGcsDisable
> {
  static description = "Disable the shared Fake GCS service";

  static flags = {
    ...BaseCommand.baseFlags,
  };

  async run(): Promise<void> {
    setLogLevel(this.flags["log-level"]);
    await setSharedServiceEnabled("fakegcs", false);
    this.log("Fake GCS disabled");
  }
}
