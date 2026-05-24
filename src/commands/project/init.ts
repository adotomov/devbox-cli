import { Flags } from "@oclif/core";
import { BaseCommand } from "../../base-command.js";
import { setLogLevel } from "../../utils/log.js";
import { initProject } from "../../services/project.js";

export default class ProjectInit extends BaseCommand<typeof ProjectInit> {
  static description = "Create a devbox project workspace";

  static flags = {
    ...BaseCommand.baseFlags,
    name: Flags.string({ required: true, summary: "Project name" }),
    type: Flags.string({
      required: true,
      summary: "Type of project (monorepo vs standalone)",
    }),
  };

  async run(): Promise<void> {
    setLogLevel(this.flags["log-level"]);
    await initProject({
      cwd: process.cwd(),
      name: this.flags.name,
      type: this.flags.type,
    });

    this.log(`Project created`);
  }
}
