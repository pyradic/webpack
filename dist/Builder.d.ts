/// <reference path="../types/webpack.d.ts" />
/// <reference types="webpack" />
/// <reference types="webpack-dev-server" />
/// <reference types="@radic/webpacker/src/globals" />
import { AddonArray } from './AddonArray';
import { AddonFinder } from './AddonFinder';
import { Webpacker } from '@radic/webpacker';
import { Addon } from './Addon';
import { SyncHook, SyncWaterfallHook } from 'tapable';
export interface BuilderOptions {
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
     * Webpack mode
     * @default guesssed
     */
    mode?: 'production' | 'development';
    namespace?: string;
    manifestPath?: string;
    outputPath?: string;
    protocol?: 'http' | 'https';
    host?: string;
    port?: number;
}
export declare class Builder {
    readonly hooks: {
        addon: SyncHook<Addon, any, any>;
        addons: SyncWaterfallHook<AddonArray, any, any>;
        env: SyncHook<any, any, any>;
        webpacker: SyncHook<Webpacker, any, any>;
        initialized: SyncHook<Builder, any, any>;
    };
    addons: AddonArray;
    wp: Webpacker;
    env: any;
    options: BuilderOptions;
    constructor(options?: Partial<BuilderOptions>);
    init(): this;
    protected initWebpacker(): Webpacker;
    protected initAddon(path: any): Addon;
    protected initAddons(): AddonArray;
    protected runCustomAddonConfigs(): void;
    toConfig(): import("webpack").Configuration | import("webpack").Configuration[];
    webpackers: any[];
    addWebpacker(options: Webpacker.Options): Webpacker;
}
