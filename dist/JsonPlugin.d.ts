import { Compiler, Stats } from 'webpack';
import { AddonArray } from './AddonArray';
declare const webpackJson: {
    filePath: string;
    ensureRemoved: () => void;
    write: (data: object) => void;
};
declare const _do: {
    _data: {};
    get<T>(path: any, def?: any): T;
    set(path: any, value: any): {};
    push(path: any, value: any): {};
    getData(): {};
};
export declare namespace JsonPlugin {
    interface Options {
        filePath?: string;
        addons?: AddonArray;
        data?: any;
        transformer?: (jsonData: any, data: typeof _do & Record<string, any>) => any;
        done?: (jsonData: any, data: typeof _do & Record<string, any>, stats: Stats) => any;
        remove?: boolean;
    }
}
export declare class JsonPlugin {
    protected options: JsonPlugin.Options;
    static webpackJson: typeof webpackJson;
    protected webpackJson: typeof webpackJson;
    constructor(options?: JsonPlugin.Options);
    apply(compiler: Compiler): void;
}
export default JsonPlugin;
