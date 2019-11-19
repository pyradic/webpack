import { DependencySorter } from './DependencySorter';
import { Arr } from './Arr';
import { Addon } from './Addon';


export class AddonArray extends Arr<Addon> {

    get(value: string): Addon | null {return this.findBy('name', value) }

    has(value: string): boolean {return this.get(value) !== null}

    findByExportName(value: string): Addon | null { return this.findBy('exportName', value) }

    findByExportNames(value: string): Addon | null {
        return this.find(addon => {
            return addon.exportNames.includes(value);
        })
    }

    findByComposerName(value: string): Addon | null { return this.findBy('composer.name', value) }

    sortByDependency() {
        const sorter = new DependencySorter;
        this.forEach(addon => sorter.addItem(addon.name, Object.keys(addon.pkg.dependencies)))
        return new AddonArray(...sorter.sort().map(name => {
            return this.where('name', name).first()
        }))
    }

    reloadJSONData(){
        this.forEach(addon =>addon.reloadJSONData());
        return this;
    }
}
