/// <reference path="../lib/types/webpack.d.ts" />
/// <reference types="webpack" />
/// <reference types="webpack-dev-server" />
/// <reference types="@radic/webpacker/src/globals" />
import { AddonArray } from './AddonArray';
import { AddonFinder } from './AddonFinder';
import { Webpacker } from '@radic/webpacker';
import { Addon } from './Addon';
import { SyncHook, SyncWaterfallHook } from 'tapable';
export interface PyroBuilderOptions {
    /**
     * Array of relative glob paths to possible addon directories
     */
    globs: string[];
    /**
     * The absolute root path of the project
     * @default process.cwd()
     */
    rootPath?: string;
    /**
     * The addon finder instance
     * @default AddonFinder
     */
    finder?: AddonFinder;
    /**
     * The output namespace
     * @default pyro
     */
    namespace?: string;
    /**
     * Webpack mode
     * @default guesssed
     */
    mode?: 'production' | 'development';
    /**
     * Use webpack dev server
     * @default false
     */
    serve?: boolean;
}
export declare class PyroBuilder implements PyroBuilderOptions {
    readonly hooks: {
        addon: SyncHook<Addon, any, any>;
        addons: SyncWaterfallHook<AddonArray, any, any>;
        env: SyncHook<any, any, any>;
        webpacker: SyncHook<Webpacker, any, any>;
        initialized: SyncHook<PyroBuilder, any, any>;
    };
    mode: 'production' | 'development';
    addons: AddonArray;
    wp: Webpacker;
    env: any;
    serve: boolean;
    globs: string[];
    finder: AddonFinder;
    rootPath: string;
    namespace: string;
    constructor(options: PyroBuilderOptions);
    init(): this;
    protected initWebpacker(): Webpacker;
    protected initAddon(path: any): Addon;
    protected initAddons(): AddonArray;
    toConfig(): import("webpack").Configuration | import("webpack").Configuration[];
    webpackers: any[];
    addWebpacker(options: Webpacker.Options): Webpacker;
}
