import { Arr } from './Arr';
import { Addon } from './Addon';
export declare class AddonArray extends Arr<Addon> {
    get(value: string): Addon | null;
    has(value: string): boolean;
    findByExportName(value: string): Addon | null;
    findByExportNames(value: string): Addon | null;
    findByComposerName(value: string): Addon | null;
    sortByDependency(): AddonArray;
    reloadJSONData(): this;
}
