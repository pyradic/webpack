import glob, { IOptions } from 'glob';
import { basename, dirname, join } from 'path';
import { existsSync, statSync } from 'fs';
import { PackageJson } from './interfaces';

export class AddonFinder {
    cwd = process.cwd()
    // excluded: string[] = [];
    //
    // exclude(...addonNames) {
    //     this.excluded.push(...addonNames)
    //     return this;
    // }

    find(globs: string[], globOptions: IOptions = {}): string[] {
        let paths: string[] = [];
        globs.forEach(pattern => paths = paths.concat(glob.sync(join(this.cwd, pattern), globOptions)));

        let addons = paths
                .filter(path => this.checkPathHasAddon(path))
                .map(path => this.transformPackagePathToDir(path))
            // .map(path => new Addon(path))
        ;

        // addons = addons.filter(addon => this.excluded.includes(addon.name) === false)

        return addons; //new AddonArray(...addons)
    }

    checkPathHasAddon(path) {
        let pathStat = statSync(path);
        if ( pathStat.isFile() && basename(path) === 'package.json' ) {
            return this.checkPackageIsAddon(path);
        } else if ( pathStat.isDirectory() && existsSync(join(path, 'package.json')) ) {
            return this.checkPackageIsAddon(join(path, 'package.json'));
        }
        return false;
    }

    protected transformPackagePathToDir(path) {
        if ( basename(path) === 'package.json' ) {
            return dirname(path);
        }
        return path;
    }

    protected checkPackageIsAddon(packageFilePath) {
        const pkg: PackageJson = require(packageFilePath);
        return 'pyro' in pkg;
    }
}
