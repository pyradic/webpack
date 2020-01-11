import { AddonArray }                  from './AddonArray';
import { AddonFinder }                 from './AddonFinder';
import { Webpacker }                   from '@radic/webpacker';
import { setupWebpacker }              from './setup';
import { Addon }                       from './Addon';
import { SyncHook, SyncWaterfallHook } from 'tapable';
import { env }                         from './env';

export interface BuilderOptions {
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
     * Webpack mode
     * @default guesssed
     */
    mode?: 'production' | 'development'

    namespace?: string
    manifestPath?: string
    outputPath?: string
    protocol?: 'http' | 'https'
    host?: string
    port?: number
}


export class Builder {
    public readonly hooks = {
        addon      : new SyncHook<Addon>([ 'addon' ]),
        addons     : new SyncWaterfallHook<AddonArray>([ 'addons' ]),
        env        : new SyncHook<any>([ 'env' ]),
        webpacker  : new SyncHook<Webpacker>([ 'webpacker' ]),
        initialized: new SyncHook<Builder>([ 'builder' ]),
    };
    public addons: AddonArray;
    public wp: Webpacker;
    public env: any       = env;

    public options: BuilderOptions = {
        globs       : [],
        rootPath    : process.cwd(),
        finder      : new AddonFinder(),
        mode        : process.env.NODE_ENV || 'production' as any,
        namespace   : env.WEBPACK_NAMESPACE,
        manifestPath: env.WEBPACK_PATH,
        protocol    : env.WEBPACK_PROTOCOL,
        host        : env.WEBPACK_HOST,
        port        : env.WEBPACK_PORT,
        outputPath  : env.WEBPACK_OUTPUT_PATH,
    };

    constructor(options: Partial<BuilderOptions> = {}) {
        this.options = {
            ...this.options,
            ...options,
        };
    }

    public init() {
        this.addons = this.initAddons();
        this.wp     = this.initWebpacker();
        this.runCustomAddonConfigs();
        this.hooks.initialized.call(this);
        return this;
    }

    protected initWebpacker(): Webpacker {
        const wp = setupWebpacker(this);
        this.hooks.webpacker.call(wp);
        return wp;
    }

    protected initAddon(path): Addon {
        const addon = new Addon(this, path);
        this.hooks.addon.call(addon);
        return addon;
    }

    protected initAddons(): AddonArray {
        let addons = new AddonArray();
        this.options.finder.find(this.options.globs).forEach(path => addons.push(this.initAddon(path)));
        addons = addons.sortByDependency();
        addons = this.hooks.addons.call(addons);
        return addons;
    }

    protected runCustomAddonConfigs() {
        this.addons.forEach(a => a.hasPyroConfig ? a.runPyroConfig(this) : null);
    }


    public toConfig() {
        if ( this.webpackers.length === 0 ) {
            return this.wp.toConfig();
        } else {
            return [ this.wp.toConfig() ].concat(
                this.webpackers.map(compiler => compiler.toConfig()),
            );
        }
    }

    webpackers = [];

    public addWebpacker(options: Webpacker.Options) {
        const wp = new Webpacker({
            mode: this.options.mode,
            ...options,
        });
        this.webpackers.push(wp);
        return wp;
    }
}
