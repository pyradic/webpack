"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AddonArray_1 = require("./AddonArray");
const AddonFinder_1 = require("./AddonFinder");
const webpacker_1 = require("@radic/webpacker");
const setup_1 = require("./setup");
const Addon_1 = require("./Addon");
const tapable_1 = require("tapable");
const env_1 = require("./env");
class PyroBuilder {
    constructor(options) {
        this.hooks = {
            addon: new tapable_1.SyncHook(['addon']),
            addons: new tapable_1.SyncWaterfallHook(['addons']),
            env: new tapable_1.SyncHook(['env']),
            webpacker: new tapable_1.SyncHook(['webpacker']),
            initialized: new tapable_1.SyncHook(['builder'])
        };
        this.env = env_1.env;
        this.webpackers = [];
        this.globs = options.globs;
        this.finder = options.finder || new AddonFinder_1.AddonFinder();
        this.rootPath = options.rootPath || process.cwd();
        this.namespace = options.namespace || env_1.env.WEBPACK_NAMESPACE;
        this.serve = options.serve === true || false;
        this.mode = 'production';
        if ('mode' in options) {
            this.mode = options.mode;
        }
        else if (['production', 'development'].includes(process.env.NODE_ENV)) {
            this.mode = process.env.NODE_ENV;
        }
    }
    init() {
        this.addons = this.initAddons();
        this.wp = this.initWebpacker();
        this.hooks.initialized.call(this);
        return this;
    }
    initWebpacker() {
        const wp = setup_1.setupWebpacker(this);
        this.hooks.webpacker.call(wp);
        return wp;
    }
    initAddon(path) {
        const addon = new Addon_1.Addon(this, path);
        this.hooks.addon.call(addon);
        return addon;
    }
    initAddons() {
        let addons = new AddonArray_1.AddonArray();
        this.finder.find(this.globs).forEach(path => addons.push(this.initAddon(path)));
        addons = addons.sortByDependency();
        addons = this.hooks.addons.call(addons);
        return addons;
    }
    toConfig() {
        if (this.webpackers.length === 0) {
            return this.wp.toConfig();
        }
        else {
            return [this.wp.toConfig()].concat(this.webpackers.map(compiler => compiler.toConfig()));
        }
    }
    addWebpacker(options) {
        const wp = new webpacker_1.Webpacker(Object.assign({ mode: this.mode }, options));
        this.webpackers.push(wp);
        return wp;
    }
}
exports.PyroBuilder = PyroBuilder;
//# sourceMappingURL=PyroBuilder.js.map