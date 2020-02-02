"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DependencySorter_1 = require("./DependencySorter");
const Arr_1 = require("./Arr");
class AddonArray extends Arr_1.Arr {
    get(value) { return this.findBy('name', value); }
    has(value) { return this.get(value) !== null; }
    findByExportName(value) { return this.findBy('exportName', value); }
    findByExportNames(value) {
        return this.find(addon => {
            return addon.exportNames.includes(value);
        });
    }
    findByComposerName(value) { return this.findBy('composer.name', value); }
    sortByDependency() {
        const sorter = new DependencySorter_1.DependencySorter;
        this.forEach(addon => sorter.addItem(addon.name, Object.keys(addon.pkg.dependencies)));
        return new AddonArray(...sorter.sort().map(name => {
            return this.where('name', name).first();
        }));
    }
    reloadJSONData() {
        this.forEach(addon => addon.reloadJSONData());
        return this;
    }
}
exports.AddonArray = AddonArray;
//# sourceMappingURL=AddonArray.js.map