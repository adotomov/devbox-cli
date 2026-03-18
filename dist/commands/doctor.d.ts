import { BaseCommand, Flags } from "../base-command.js";
export default class Doctor extends BaseCommand<typeof Doctor> {
    static description: string;
    static flags: {
        'log-level': import("@oclif/core/interfaces").OptionFlag<"error" | "warn" | "info" | "debug" | "trace", import("@oclif/core/interfaces").CustomOptions>;
    };
    run(): Promise<Flags<typeof Doctor>>;
}
