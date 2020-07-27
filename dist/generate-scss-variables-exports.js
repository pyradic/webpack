"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const glob_1 = __importDefault(require("glob"));
const fs_1 = require("fs");
const lodash_1 = require("lodash");
let tasks = [
    {
        typeName: 'PlatformStyleVariables',
        from: [
            'packages/pyro/platform/lib/styling/base.scss',
        ],
        imports: [
            'packages/pyro/platform/lib/styling/base.scss',
        ],
        to: 'packages/pyro/platform/lib/styling/export.scss',
        exclude: [],
    },
    {
        typeName: 'AdminThemeStyleVariables',
        from: [
            'addons/shared/pyro/admin-theme/lib/styling/_base.scss',
            'addons/shared/pyro/admin-theme/lib/styling/_variables.scss',
        ],
        imports: [
            'addons/shared/pyro/admin-theme/lib/styling/_base.scss',
        ],
        to: 'addons/shared/pyro/admin-theme/lib/styling/export.scss',
        exclude: [/material-colors/],
    },
];
tasks = tasks.map(task => lodash_1.merge({ from: [], imports: [], exclude: [] }, task));
const exp = () => /^[\s\t]*\$(.*?)[\s\t]*?:/gm;
const ensureAbsolute = path => path_1.isAbsolute(path) ? path : path_1.resolve(process.cwd(), path);
const resolveGlob = path => glob_1.default.sync(path, {});
for (const task of tasks) {
    let paths = lodash_1.flatten(task.from
        .map(ensureAbsolute)
        .map(resolveGlob));
    let vars = [];
    for (const path of paths) {
        const content = fs_1.readFileSync(path, 'utf8');
        let matches;
        let regexp = exp();
        while ((matches = regexp.exec(content)) !== null) {
            let v = matches[1];
            let include = true;
            for (let exclude of task.exclude) {
                if (typeof exclude === 'string' && v === exclude) {
                    include = false;
                }
                else if (exclude instanceof RegExp && exclude.test(v)) {
                    include = false;
                }
            }
            if (include) {
                vars.push(v);
            }
            matches.index++;
        }
    }
    let to = ensureAbsolute(task.to);
    let imports = task.imports.map(path => {
        let rel = path_1.relative(path_1.dirname(to), ensureAbsolute(path));
        return `@import "${rel}";`;
    }).join('\n');
    let exports = vars.map(v => `\t${v}: \$${v};`).join('\n');
    let result = `
${imports}

:export {
${exports}
}
    `;
    console.log(result);
    fs_1.writeFileSync(to, result, 'utf8');
    console.log(`Written export to: ${to}`);
    let platformPath = ensureAbsolute('packages/pyro/platform');
    if (task.typeName) {
        let configImport = to.startsWith(platformPath) ? '../classes/Config' : '@crvs/platform';
        let typeResult = [
            `import {Config} from '${configImport}';`,
            `export interface ${task.typeName} {`,
            `${vars.map(v => `\t'${v}'?:string`).join('\n')}`,
            `}`,
            `import _styleVars from  './export.scss'`,
            `export const styleVars = Config.proxied<${task.typeName}>(_styleVars)`,
        ].join('\n');
        let typeTo = task.typeTo ? ensureAbsolute(task.typeTo) : to.replace(path_1.extname(to), '.ts');
        fs_1.writeFileSync(typeTo, typeResult, 'utf8');
        console.log(`Written type export to: ${typeTo}`);
    }
}
//# sourceMappingURL=generate-scss-variables-exports.js.map