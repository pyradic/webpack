import { dirname, extname, isAbsolute, relative, resolve } from 'path'
import glob from 'glob'
import { readFileSync, writeFileSync } from 'fs';
import { flatten, merge } from 'lodash';

interface Task {
    from: string[],
    imports: string[],
    to: string,
    exclude?: Array<string | RegExp>,
    typeName?: string
    typeTo?: string
}

let tasks: Task[] = [
    {
        typeName: 'PlatformStyleVariables',
        from    : [
            'packages/pyro/platform/lib/styling/base.scss'
        ],
        imports : [
            'packages/pyro/platform/lib/styling/base.scss'
        ],
        to      : 'packages/pyro/platform/lib/styling/export.scss',
        exclude : []
    },
    {
        typeName: 'AdminThemeStyleVariables',
        from    : [
            'addons/shared/pyro/admin-theme/lib/styling/_base.scss',
            'addons/shared/pyro/admin-theme/lib/styling/_variables.scss',
            // 'addons/shared/pyro/admin-theme/lib/styling/_colors.scss'
        ],
        imports : [
            'addons/shared/pyro/admin-theme/lib/styling/_base.scss'
        ],
        to      : 'addons/shared/pyro/admin-theme/lib/styling/export.scss',
        exclude : [ /material-colors/ ]
    }
]
tasks             = tasks.map(task => merge({ from: [], imports: [], exclude: [] }, task));

const exp            = () => /^[\s\t]*\$(.*?)[\s\t]*?:/gm
const ensureAbsolute = path => isAbsolute(path) ? path : resolve(process.cwd(), path)
const resolveGlob    = path => glob.sync(path, {})


for ( const task of tasks ) {
    let paths = flatten(
        task.from
            .map(ensureAbsolute)
            .map(resolveGlob)
    );

    let vars = [];
    for ( const path of paths ) {
        const content = readFileSync(path, 'utf8');
        let matches: RegExpExecArray;
        let regexp    = exp()
        while ( (matches = regexp.exec(content)) !== null ) {
            let v       = matches[ 1 ]
            let include = true;
            for ( let exclude of task.exclude ) {
                if ( typeof exclude === 'string' && v === exclude ) {
                    include = false;
                } else if ( exclude instanceof RegExp && exclude.test(v) ) {
                    include = false;
                }
            }
            if ( include ) {
                vars.push(v);
            }
            matches.index ++
        }
    }

    let to      = ensureAbsolute(task.to)
    let imports = task.imports.map(path => {
        let rel = relative(dirname(to), ensureAbsolute(path))
        return `@import "${rel}";`
    }).join('\n')

    let exports = vars.map(v => `\t${v}: \$${v};`).join('\n')

    let result = `
${imports}

:export {
${exports}
}
    `
    console.log(result);

    writeFileSync(to, result, 'utf8');
    console.log(`Written export to: ${to}`)

    let platformPath = ensureAbsolute('packages/pyro/platform')

    if ( task.typeName ) {
        let configImport = to.startsWith(platformPath) ? '../classes/Config' : '@pyro/platform';
        let typeResult = [
            `import {Config} from '${configImport}';`,
            `export interface ${task.typeName} {`,
            `${vars.map(v => `\t'${v}'?:string`).join('\n')}`,
            `}`,
            `import _styleVars from  './export.scss'`,
            `export const styleVars = Config.proxied<${task.typeName}>(_styleVars)`
        ].join('\n')

        let typeTo = task.typeTo ? ensureAbsolute(task.typeTo) : to.replace(extname(to), '.ts');
        writeFileSync(typeTo, typeResult, 'utf8')
        console.log(`Written type export to: ${typeTo}`)
        ;
    }
}