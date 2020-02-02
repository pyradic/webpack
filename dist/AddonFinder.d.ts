import { IOptions } from 'glob';
export declare class AddonFinder {
    cwd: string;
    find(globs: string[], globOptions?: IOptions): string[];
    checkPathHasAddon(path: any): boolean;
    protected transformPackagePathToDir(path: any): any;
    protected checkPackageIsAddon(packageFilePath: any): boolean;
}
