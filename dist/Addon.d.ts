import { AddonEntrypoint, ComposerSchema, PackageJson } from './interfaces';
import { Builder } from './Builder';
import { EntrypointArray } from './EntrypointArray';
import { SyncWaterfallHook } from 'tapable';
export declare class Addon {
    protected readonly builder: Builder;
    readonly path: string;
    readonly hooks: {
        addEntry: SyncWaterfallHook<AddonEntrypoint, any, any>;
        toObject: SyncWaterfallHook<any, any, any>;
    };
    pkg: PackageJson;
    composer: ComposerSchema;
    readonly pkgPath: string;
    readonly composerPath: string;
    readonly relativePath: string;
    readonly pyroConfigPath: string;
    sorted?: number;
    entries: any;
    constructor(builder: Builder, path: string);
    reloadJSONData(): void;
    protected relative(path: string): string;
    addEntry(entryName: string, entryData: {
        scripts: [];
        styles: [];
    }): void;
    runPyroConfig(builder?: Builder): this;
    get hasPyroConfig(): boolean;
    get name(): string;
    get firstName(): string;
    get firstNameSnake(): string;
    get lastName(): string;
    get lastNameSnake(): string;
    get exportName(): string;
    get exportNames(): string[];
    get srcPath(): string;
    get mainEntry(): import("./interfaces").Entrypoint;
    get otherEntries(): EntrypointArray;
    get entrypoints(): EntrypointArray;
    getSrcPath(...parts: string[]): string;
    getPath(...parts: string[]): string;
    getRPath(...parts: string[]): string;
    toObject(): any;
}
