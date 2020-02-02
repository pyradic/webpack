"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DependencySorter {
    constructor() {
        /**
         * @var array
         */
        this.items = [];
        /**
         * @var array
         */
        this.dependencies = {};
        /**
         * @var array
         */
        this.dependsOn = {};
        /**
         * @var array
         */
        this.missing = {};
        /**
         * @var array
         */
        this.circular = {};
        /**
         * @var array
         */
        this.hits = {};
        /**
         * @var array
         */
        this.sorted = {};
    }
    add(items) {
        Object.keys(items).forEach((name) => {
            this.addItem(name, items[name]);
        });
    }
    addItem(name, deps) {
        if (typeof deps === 'undefined') {
            deps = deps || [];
        }
        else if (typeof deps === 'string') {
            deps = deps.toString().split(/,\s?/);
        }
        this.setItem(name, deps);
    }
    setItem(name, deps) {
        this.items.push(name);
        deps.forEach((dep) => {
            this.items.push(dep);
            if (!this.dependsOn[dep]) {
                this.dependsOn[dep] = {};
            }
            this.dependsOn[dep][name] = name;
            this.hits[dep] = 0;
        });
        // uniq
        this.items = this.items.filter((x, i, a) => a.indexOf(x) == i);
        this.dependencies[name] = deps;
        this.hits[name] = 0;
    }
    sort() {
        this.sorted = [];
        var hasChanged = true;
        while (this.sorted.length < this.items.length && hasChanged) {
            hasChanged = false;
            Object.keys(this.dependencies).forEach((item) => {
                if (this.satisfied(item)) {
                    this.setSorted(item);
                    this.removeDependents(item);
                    hasChanged = true;
                }
                this.hits[item]++;
            });
        }
        return this.sorted;
    }
    satisfied(name) {
        var pass = true;
        this.getDependents(name).forEach((dep) => {
            if (this.isSorted(dep)) {
                return;
            }
            if (!this.exists(name)) {
                this.setMissing(name, dep);
                if (pass) {
                    pass = false;
                }
            }
            if (this.hasDependents(dep)) {
                if (pass) {
                    pass = false;
                }
            }
            else {
                this.setFound(name, dep);
            }
            if (this.isDependent(name, dep)) {
                this.setCircular(name, dep);
                if (pass) {
                    pass = false;
                }
            }
        });
        return pass;
    }
    /**
     * setSorted
     *
     * @param item
     */
    setSorted(item) {
        this.sorted.push(item);
    }
    exists(item) {
        return this.items.indexOf(item) !== -1;
    }
    /**
     * removeDependents
     *
     * @param item
     */
    removeDependents(item) {
        delete this.dependencies[item];
    }
    /**
     * setCircular
     *
     * @param item
     * @param item2
     */
    setCircular(item, item2) {
        this.circular[item] = this.circular[item] || {};
        this.circular[item][item2] = item2;
    }
    /**
     * setMissing
     *
     * @param item
     * @param item2
     */
    setMissing(item, item2) {
        this.missing[item] = this.missing[item] || {};
        this.missing[item][item2] = item2;
    }
    /**
     * setFound
     *
     * @param item
     * @param item2
     */
    setFound(item, item2) {
        if (typeof this.missing[item] !== 'undefined') {
            delete this.missing[item][item2];
            if (Object.keys(this.missing[item]).length > 0) {
                delete this.missing[item];
            }
        }
    }
    /**
     * isSorted
     *
     * @param item
     * @return bool
     */
    isSorted(item) {
        return typeof this.sorted[item] !== 'undefined';
    }
    requiredBy(item) {
        return typeof this.dependsOn[item] !== 'undefined' ? this.dependsOn[item] : [];
    }
    isDependent(item, item2) {
        return typeof this.dependsOn[item] !== 'undefined' && typeof this.dependsOn[item][item2] !== 'undefined';
    }
    hasDependents(item) {
        return typeof this.dependencies[item] !== 'undefined';
    }
    hasMissing(item) {
        return typeof this.missing[item] !== 'undefined';
    }
    isMissing(dep) {
        var missing = false;
        Object.keys(this.missing).forEach((item) => {
            var deps = this.missing[item];
            if (deps.indexOf(dep) !== -1) {
                missing = true;
            }
        });
        return missing;
    }
    hasCircular(item) {
        return typeof this.circular[item] !== 'undefined';
    }
    isCircular(dep) {
        var circular = false;
        Object.keys(this.circular).forEach((item) => {
            var deps = this.circular[item];
            if (deps.indexOf(dep) !== -1) {
                circular = true;
            }
        });
        return circular;
    }
    /**
     * getDependents
     *
     * @param item
     * @return mixed
     */
    getDependents(item) {
        return this.dependencies[item];
    }
    getMissing(str) {
        if (typeof str === 'string') {
            return this.missing[str];
        }
        return this.missing;
    }
    getCircular(str) {
        if (typeof str === 'string') {
            return this.circular[str];
        }
        return this.circular;
    }
    getHits(str) {
        if (typeof str === 'string') {
            return this.hits[str];
        }
        return this.hits;
    }
}
exports.DependencySorter = DependencySorter;
//# sourceMappingURL=DependencySorter.js.map