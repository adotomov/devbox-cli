import { Command, Interfaces } from '@oclif/core';
export type Flags<T extends typeof Command> = Interfaces.InferredFlags<typeof BaseCommand['baseFlags'] & T['flags']>;
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>;
export declare abstract class BaseCommand<T extends typeof Command> extends Command {
    static enableJsonFlag: boolean;
    static baseFlags: {
        'log-level': Interfaces.OptionFlag<"error" | "warn" | "info" | "debug" | "trace", Interfaces.CustomOptions>;
    };
    protected flags: Flags<T>;
    protected args: Args<T>;
    protected init(): Promise<void>;
    protected catch(err: Error & {
        exitCode?: number;
    }): Promise<any>;
    protected finally(_: Error | undefined): Promise<any>;
}
