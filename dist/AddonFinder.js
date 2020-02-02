"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const glob_1 = __importDefault(require("glob"));
const path_1 = require("path");
const fs_1 = require("fs");
class AddonFinder {
    constructor() {
        this.cwd = process.cwd();
    }
    // excluded: string[] = [];
    //
    // exclude(...addonNames) {
    //     this.excluded.push(...addonNames)
    //     return this;
    // }
    find(globs, globOptions = {}) {
        let paths = [];
        globs.forEach(pattern => paths = paths.concat(glob_1.default.sync(path_1.join(this.cwd, pattern), globOptions)));
        let addons = paths
            .filter(path => this.checkPathHasAddon(path))
            .map(path => this.transformPackagePathToDir(path));
        // addons = addons.filter(addon => this.excluded.includes(addon.name) === false)
        return addons; //new AddonArray(...addons)
    }
    checkPathHasAddon(path) {
        let pathStat = fs_1.statSync(path);
        if (pathStat.isFile() && path_1.basename(path) === 'package.json') {
            return this.checkPackageIsAddon(path);
        }
        else if (pathStat.isDirectory() && fs_1.existsSync(path_1.join(path, 'package.json'))) {
            return this.checkPackageIsAddon(path_1.join(path, 'package.json'));
        }
        return false;
    }
    transformPackagePathToDir(path) {
        if (path_1.basename(path) === 'package.json') {
            return path_1.dirname(path);
        }
        return path;
    }
    checkPackageIsAddon(packageFilePath) {
        const pkg = require(packageFilePath);
        return 'pyro' in pkg;
    }
}
exports.AddonFinder = AddonFinder;
//# sourceMappingURL=AddonFinder.js.map