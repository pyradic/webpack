import { Arr } from './Arr';
import { Entrypoint } from './interfaces';
import { Addon } from './Addon';
export declare class EntrypointArray extends Arr<Entrypoint> {
    development(): this;
    production(): this;
    testing(): this;
    env(env: Entrypoint['env'], strict?: boolean): this;
    main(): Entrypoint;
    suffixed(): this;
    findSuffixed(addon: Addon, entryName: any): Entrypoint;
}
