import { AddonArray } from './AddonArray';
import { AddonFinder } from './AddonFinder';
import { Webpacker } from '@radic/webpacker';
import { setupBase, setupWebpacker } from './setup';
import { config } from 'dotenv';
import { Addon } from './Addon';
import { SyncHook, SyncWaterfallHook } from 'tapable';

export interface PyroBuilderOptions {
    /**
     * Array of relative glob paths to possible addon directories
     */
    globs: string[]
    /**
     * The absolute root path of the project
     * @default process.cwd()
     */
    rootPath?: string
    /**
     * The addon finder instance
     * @default AddonFinder
     */
    finder?: AddonFinder
    /**
     * The output namespace
     * @default pyro
     */
    namespace?: string
    /**
     * Webpack mode
     * @default guesssed
     */
    mode?: 'production' | 'development'
    /**
     * Use webpack dev server
     * @default false
     */
    serve?: boolean
}


export class PyroBuilder implements PyroBuilderOptions {
    public readonly hooks = {
        addon      : new SyncHook<Addon>([ 'addon' ]),
        addons     : new SyncWaterfallHook<AddonArray>([ 'addons' ]),
        env        : new SyncHook<any>([ 'env' ]),
        webpacker  : new SyncHook<Webpacker>([ 'webpacker' ]),
        initialized: new SyncHook<PyroBuilder>([ 'builder' ])
    }
    public mode: 'production' | 'development'
    public addons: AddonArray
    public wp: Webpacker
    public env: any
    public serve: boolean

    public globs: string[]
    public finder: AddonFinder
    public rootPath: string
    public namespace: string

    constructor(options: PyroBuilderOptions) {
        this.globs     = options.globs
        this.finder    = options.finder || new AddonFinder()
        this.rootPath  = options.rootPath || process.cwd();
        this.namespace = options.namespace || 'pyro'
        this.serve     = options.serve === true || false
        this.mode      = 'production'
        if ( 'mode' in options ) {
            this.mode = options.mode;
        } else if ( [ 'production', 'development' ].includes(process.env.NODE_ENV) ) {
            this.mode = process.env.NODE_ENV as any;
        }
    }

    public init() {
        this.env    = this.initEnv();
        this.addons = this.initAddons();
        this.wp     = this.initWebpacker();
        this.hooks.initialized.call(this);
        return this;
    }

    protected initWebpacker(): Webpacker {
        const wp = setupWebpacker(this);
        this.hooks.webpacker.call(wp);
        return wp
    }

    protected initAddon(path): Addon {
        const addon = new Addon(this, path);
        this.hooks.addon.call(addon);
        return addon;
    }

    protected initAddons(): AddonArray {
        let addons = new AddonArray()
        this.finder.find(this.globs).forEach(path => addons.push(this.initAddon(path)));
        addons = addons.sortByDependency()
        addons = this.hooks.addons.call(addons);
        return addons;
    }

    protected initEnv(): any {
        const { parsed: env, error } = config({
            // debug   : false,
            encoding: 'utf8'
        })
        this.hooks.env.call(env);

        return env;
    }

    public toConfig() {
        if ( this.webpackers.length === 0 ) {
            return this.wp.toConfig();
        } else {
            return [ this.wp.toConfig() ].concat(
                this.webpackers.map(compiler => compiler.toConfig())
            )
        }
    }

    webpackers = [];

    public addWebpacker(options:Webpacker.Options) {
        const wp = new Webpacker({
            mode: this.mode,
            ...options
        })
        this.webpackers.push(wp)
        return wp;
    }
}