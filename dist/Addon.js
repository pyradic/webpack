"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const EntrypointArray_1 = require("./EntrypointArray");
const tapable_1 = require("tapable");
class Addon {
    constructor(builder, path) {
        this.builder = builder;
        this.path = path;
        this.hooks = {
            addEntry: new tapable_1.SyncWaterfallHook(['entry']),
            toObject: new tapable_1.SyncWaterfallHook(['obj']),
        };
        this.entries = {};
        this.relativePath = path_1.relative(process.cwd(), path);
        this.pkgPath = path_1.join(path, 'package.json');
        this.composerPath = path_1.join(path, 'composer.json');
        this.pyroConfigPath = path_1.join(path, 'pyro.config.ts');
        this.reloadJSONData();
    }
    reloadJSONData() {
        this.pkg = require(this.pkgPath);
        if (fs_1.existsSync(this.composerPath)) {
            this.composer = require(this.composerPath);
        }
    }
    relative(path) { return path_1.relative(process.cwd(), path); }
    addEntry(entryName, entryData) {
        let entry = (entryName === this.exportName ? this.mainEntry : this.otherEntries.findSuffixed(this, entryName));
        entry = Object.assign(Object.assign({}, entry), entryData);
        this.entries[entryName] = this.hooks.addEntry.call(entry);
    }
    runPyroConfig(builder) {
        builder = builder || this.builder;
        if (this.hasPyroConfig) {
            let fn;
            let pyroConfig = fn = require(this.pyroConfigPath);
            if (typeof pyroConfig === 'function') {
                fn = pyroConfig;
            }
            else if ('default' in pyroConfig) {
                fn = pyroConfig.default;
            }
            else if ('configure' in pyroConfig) {
                fn = pyroConfig.configure;
            }
            fn.call(this, builder);
        }
        return this;
    }
    get hasPyroConfig() { return fs_1.existsSync(this.pyroConfigPath); }
    get name() { return this.pkg.name; }
    get firstName() { return this.name.split('/')[0]; }
    get firstNameSnake() { return this.firstName.replace(/-/g, '_').replace(/@/g, ''); }
    get lastName() { return this.name.split('/')[1]; }
    get lastNameSnake() { return this.lastName.replace(/-/g, '_'); }
    get exportName() { return this.firstNameSnake + '__' + this.lastNameSnake; }
    get exportNames() {
        let names = [this.exportName];
        if (this.otherEntries.length > 0) {
            this.otherEntries.forEach(entry => names.push(this.exportName + entry.suffix));
        }
        return names;
    }
    get srcPath() { return path_1.join(this.path, this.pkg.pyro.srcPath); }
    get mainEntry() { return this.entrypoints.env(this.builder.options.mode).main(); }
    get otherEntries() { return this.entrypoints.env(this.builder.options.mode).suffixed(); }
    get entrypoints() { return new EntrypointArray_1.EntrypointArray(...this.pkg.pyro.entrypoints.map(e => (Object.assign(Object.assign({}, e), { path: path_1.join(this.srcPath, e.path) })))); }
    getSrcPath(...parts) { return path_1.join(this.srcPath, ...parts); }
    getPath(...parts) { return path_1.join(this.path, ...parts); }
    getRPath(...parts) { return path_1.join(this.relativePath, ...parts); }
    toObject() {
        let obj = {
            name: this.name,
            firstName: this.firstName,
            firstNameSnake: this.firstNameSnake,
            lastName: this.lastName,
            lastNameSnake: this.lastNameSnake,
            exportName: this.exportName,
            srcPath: this.srcPath,
            pkg: this.pkg,
            composer: this.composer,
            pkgPath: this.relative(this.pkgPath),
            composerPath: this.relative(this.composerPath),
            pyroConfigPath: this.relative(this.pyroConfigPath),
            path: this.relative(this.path),
            sorted: this.sorted,
            entries: this.entries,
        };
        return this.hooks.toObject.call(obj);
    }
}
exports.Addon = Addon;
//# sourceMappingURL=Addon.js.map