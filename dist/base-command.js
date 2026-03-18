import { Command, Flags } from '@oclif/core';
export class BaseCommand extends Command {
    static enableJsonFlag = true;
    static baseFlags = {
        'log-level': Flags.option({
            summary: 'Log level for command output',
            helpGroup: 'GLOBAL',
            options: ['error', 'warn', 'info', 'debug', 'trace'],
            default: 'info',
        })()
    };
    flags;
    args;
    async init() {
        await super.init();
        const { args, flags } = await this.parse({
            flags: this.ctor.flags,
            baseFlags: super.ctor.baseFlags,
            enableJsonFlag: this.ctor.enableJsonFlag,
            args: this.ctor.args,
            strict: this.ctor.strict
        });
        this.flags = flags;
        this.args = args;
    }
    async catch(err) {
        return super.catch(err);
    }
    async finally(_) {
        return super.finally(_);
    }
}
