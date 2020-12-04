"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const yargs_1 = __importDefault(require("yargs"));
const console_input_1 = require("@radic/console-input");
const path_1 = require("path");
const find_up_1 = __importDefault(require("find-up"));
const glob_1 = require("glob");
const term_size_1 = __importDefault(require("term-size"));
const fs_1 = require("fs");
function getAddons() {
    let addons = {};
    let dirs = [
        find_up_1.default.sync('addons', { type: 'directory' }),
        find_up_1.default.sync('core', { type: 'directory' }),
        find_up_1.default.sync('packages', { type: 'directory' }),
    ];
    for (const path of dirs) {
        glob_1.glob.sync(path_1.resolve(path, '**', 'package.json'))
            .forEach(path => {
            let pkg = require(path);
            if (pkg.pyro !== undefined) {
                addons[path] = pkg;
            }
        });
    }
    return addons;
}
let y = yargs_1.default.command('hmr', 'Pick/decide which packages should have HMR enabled/disabled', (args) => __awaiter(void 0, void 0, void 0, function* () {
    let addons = getAddons();
    let choices = Object.entries(addons).map(([path, addon]) => {
        var _a, _b, _c, _d;
        let checked = ((_b = (_a = addon) === null || _a === void 0 ? void 0 : _a.pyro) === null || _b === void 0 ? void 0 : _b.hmr) === true || ((_d = (_c = addon) === null || _c === void 0 ? void 0 : _c.pyro) === null || _d === void 0 ? void 0 : _d.HMR) === true;
        return { name: addon.name, checked };
    });
    let pageSize = Math.floor((term_size_1.default().rows / 100) * 70);
    let answers = yield console_input_1.Input.checkbox('HMR', choices, null, { pageSize });
    Object.entries(addons).forEach(([path, addon]) => {
        addon.pyro.hmr = answers.includes(addon.name);
        fs_1.writeFileSync(path, JSON.stringify(addon, null, 4), 'utf-8');
    });
}))
    .showHelpOnFail(true)
    .demandCommand()
    .help();
function cli() {
    y.parse();
}
module.exports = cli;
//# sourceMappingURL=cli.js.map