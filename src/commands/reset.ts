import { Flags } from "@oclif/core";
import { BaseCommand } from "../base-command.js";
import { setLogLevel } from "../utils/log.js";
import { confirm } from "../utils/prompt.js";
import { resetMachine } from "../services/cluster.js";

export default class Reset extends BaseCommand<typeof Reset> {
  static description = "Delete the devbox cluster and registry";

  static flags = {
    ...BaseCommand.baseFlags,
    yes: Flags.boolean({
      char: "y",
      summary: "Skip confirmation prompt",
      default: false,
    }),
  };

  async run(): Promise<void> {
    const flags = this.flags;
    setLogLevel(flags["log-level"]);

    if (!flags.yes) {
      const approved = await confirm(
        "This will remove the devbox cluster and registry. Continue?",
        false,
      );
      if (!approved) {
        this.log("Aborted");
        return;
      }
    }

    await resetMachine();
  }
}
