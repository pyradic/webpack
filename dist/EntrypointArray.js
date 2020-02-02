"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Arr_1 = require("./Arr");
class EntrypointArray extends Arr_1.Arr {
    development() { return this.filter(e => e.env === undefined || e.env === 'development'); }
    production() { return this.filter(e => e.env === undefined || e.env === 'production'); }
    testing() { return this.filter(e => e.env === undefined || e.env === 'testing'); }
    env(env, strict = false) {
        return this.filter(e => {
            if (strict) {
                return e.env === env;
            }
            return e.env === undefined || e.env === env;
        });
    }
    main() { return this.find(e => e.suffix === undefined); }
    suffixed() { return this.filter(e => e.suffix !== undefined); }
    findSuffixed(addon, entryName) { return this.find(entry => addon.exportName + entry.suffix === entryName); }
}
exports.EntrypointArray = EntrypointArray;
//# sourceMappingURL=EntrypointArray.js.map