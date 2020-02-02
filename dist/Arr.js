"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
function arr(items) {
    return new Arr(...items);
}
exports.arr = arr;
class Arr extends Array {
    constructor(...items) {
        super(...items);
        Object.setPrototypeOf(this, new.target.prototype);
    }
    static make(items = []) { return new (this)(...items); }
    isEmpty() { return this.length === 0; }
    isNotEmpty() { return this.length > 0; }
    first() { return this[0]; }
    last() { return this[this.length - 1]; }
    findBy(key, value) { return this.find(item => lodash_1.get(item, key) === value); }
    where(key, value) { return this.filter(item => lodash_1.get(item, key) === value); }
    whereIn(key, values) { return this.filter(item => values.includes(lodash_1.get(item, key)) === true); }
    whereNotIn(key, values) { return this.filter(item => values.includes(lodash_1.get(item, key)) === false); }
    each(callbackfn) {
        this.forEach(callbackfn);
        return this;
    }
    newInstance(...items) {
        let Class = this.constructor;
        let instance = new Class(...items);
        return instance;
    }
    keyBy(key) {
        let cb = key;
        if (typeof key === 'string') {
            cb = item => item[key];
        }
        let result = {};
        this.forEach(item => {
            let key = cb(item);
            result[key] = item;
        });
        return result;
    }
    toMap(key) {
        const map = new Map();
        this.forEach(item => map.set(lodash_1.get(item, key), item));
        return map;
    }
}
exports.Arr = Arr;
//# sourceMappingURL=Arr.js.map