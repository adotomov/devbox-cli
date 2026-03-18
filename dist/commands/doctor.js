import { BaseCommand } from "../base-command.js";
import { doctor } from "../services/doctor.js";
export default class Doctor extends BaseCommand {
    static description = 'Check required local dependencies';
    static flags = {
        ...BaseCommand.baseFlags
    };
    async run() {
        for (const [flag, value] of Object.entries(this.flags)) {
            this.log(`${flag}:${value}`);
        }
        const results = await doctor();
        for (const r of results) {
            this.log(`${r.ok ? 'ok' : 'miss'} ${r.name}`);
        }
        const failed = results.filter((item) => !item.ok);
        if (failed.length > 0) {
            this.error(`Missing dependencies: ${failed.map((item) => item.name).join(', ')}`, { exit: 1 });
        }
        return this.flags;
    }
}
