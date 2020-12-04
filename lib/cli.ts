import yargs                                 from 'yargs';
import { Input }                             from '@radic/console-input';
import { resolve }                           from 'path';
import findUp                                from 'find-up';
import { glob }                              from 'glob';
import { CheckboxChoiceMap, DistinctChoice } from 'inquirer';
import termsize                              from 'term-size';
import { PackageJson }                       from './interfaces';
import { writeFileSync }                     from 'fs';

function getAddons(): Record<string, PackageJson> {
    let addons = {};
    let dirs   = [
        findUp.sync('addons', { type: 'directory' }),
        findUp.sync('core', { type: 'directory' }),
        findUp.sync('packages', { type: 'directory' }),
    ];
    for ( const path of dirs ) {
        glob.sync(resolve(path, '**', 'package.json'))
            .forEach(path => {
                let pkg = require(path);
                if ( pkg.pyro !== undefined ) {
                    addons[ path ] = pkg;
                }
            });
    }
    return addons;
}

let y = yargs.command('hmr', 'Pick/decide which packages should have HMR enabled/disabled', async args => {
    let addons  = getAddons();
    let choices = Object.entries(addons).map<DistinctChoice<CheckboxChoiceMap>>(([ path, addon ]) => {
        let checked = addon?.pyro?.hmr === true || addon?.pyro?.HMR === true;
        return { name: addon.name, checked };
    });

    let pageSize = Math.floor((termsize().rows / 100) * 70);

    let answers = await Input.checkbox('HMR', choices, null, { pageSize });

    Object.entries(addons).forEach(([ path, addon ]) => {
        addon.pyro.hmr = answers.includes(addon.name);
        writeFileSync(path, JSON.stringify(addon, null, 4), 'utf-8');
    });
})
    .showHelpOnFail(true)
    .demandCommand()
    .help();

function cli() {
    y.parse();
}


export = cli
