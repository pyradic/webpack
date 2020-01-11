import { join, relative }                               from 'path';
import { AddonEntrypoint, ComposerSchema, PackageJson } from './interfaces';
import { existsSync }                                   from 'fs';
import { Builder }                                      from './Builder';
import { EntrypointArray }                              from './EntrypointArray';
import { SyncWaterfallHook }                            from 'tapable';


export class Addon {
    public readonly hooks = {
        addEntry: new SyncWaterfallHook<AddonEntrypoint>([ 'entry' ]),
        toObject: new SyncWaterfallHook<any>([ 'obj' ]),
    };
    public pkg: PackageJson;
    public composer: ComposerSchema;
    public readonly pkgPath: string;
    public readonly composerPath: string;
    public readonly relativePath: string;
    public readonly pyroConfigPath: string;
    sorted?: number;

    entries: any = {};

    constructor(protected readonly builder: Builder,
                public readonly path: string) {
        this.relativePath   = relative(process.cwd(), path);
        this.pkgPath        = join(path, 'package.json');
        this.composerPath   = join(path, 'composer.json');
        this.pyroConfigPath = join(path, 'pyro.config.ts');
        this.reloadJSONData();
    }

    public reloadJSONData() {
        this.pkg = require(this.pkgPath);
        if ( existsSync(this.composerPath) ) {
            this.composer = require(this.composerPath);
        }
    }

    protected relative(path: string) {return relative(process.cwd(), path);}

    public addEntry(entryName: string, entryData: { scripts: [], styles: [] }) {
        let entry                 = (entryName === this.exportName ? this.mainEntry : this.otherEntries.findSuffixed(this, entryName)) as AddonEntrypoint;
        entry                     = { ...entry, ...entryData };
        this.entries[ entryName ] = this.hooks.addEntry.call(entry);
    }

    public runPyroConfig(builder?: Builder) {
        builder = builder || this.builder;
        if ( this.hasPyroConfig ) {
            let fn;
            let pyroConfig = fn = require(this.pyroConfigPath);
            if ( typeof pyroConfig === 'function' ) {
                fn = pyroConfig;
            } else if ( 'default' in pyroConfig ) {
                fn = pyroConfig.default;
            } else if ( 'configure' in pyroConfig ) {
                fn = pyroConfig.configure;
            }
            fn.call(this, builder);
        }
        return this;
    }

    get hasPyroConfig(): boolean {return existsSync(this.pyroConfigPath);}

    get name(): string { return this.pkg.name; }

    get firstName(): string {return this.name.split('/')[ 0 ];}

    get firstNameSnake(): string {return this.firstName.replace(/-/g, '_').replace(/@/g, '');}

    get lastName(): string {return this.name.split('/')[ 1 ];}

    get lastNameSnake(): string {return this.lastName.replace(/-/g, '_');}

    get exportName(): string {return this.firstNameSnake + '__' + this.lastNameSnake; }

    get exportNames(): string[] {
        let names = [ this.exportName ];
        if ( this.otherEntries.length > 0 ) {
            this.otherEntries.forEach(entry => names.push(this.exportName + entry.suffix));
        }
        return names;
    }

    get srcPath() {return join(this.path, this.pkg.pyro.srcPath); }

    get mainEntry() { return this.entrypoints.env(this.builder.options.mode).main();}

    get otherEntries() { return this.entrypoints.env(this.builder.options.mode).suffixed();}

    get entrypoints() {return new EntrypointArray(...this.pkg.pyro.entrypoints.map(e => ({ ...e, path: join(this.srcPath, e.path) }))); }

    getSrcPath(...parts: string[]) {return join(this.srcPath, ...parts); }

    getPath(...parts: string[]) {return join(this.path, ...parts); }

    getRPath(...parts: string[]) { return join(this.relativePath, ...parts); }

    toObject() {
        let obj = {
            name          : this.name,
            firstName     : this.firstName,
            firstNameSnake: this.firstNameSnake,
            lastName      : this.lastName,
            lastNameSnake : this.lastNameSnake,
            exportName    : this.exportName,
            srcPath       : this.srcPath,
            pkg           : this.pkg,
            composer      : this.composer,
            pkgPath       : this.relative(this.pkgPath),
            composerPath  : this.relative(this.composerPath),
            pyroConfigPath: this.relative(this.pyroConfigPath),
            path          : this.relative(this.path),
            sorted        : this.sorted,
            entries       : this.entries,
        };

        return this.hooks.toObject.call(obj);
    }

}
