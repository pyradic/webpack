// noinspection ES6UnusedImports
import { CLIOptions, jsonInputForTargetLanguage, main, makeQuicktypeOptions, parseCLIOptions, writeOutput } from 'quicktype'


export async function generatePlatformTypings(jsonFilePath, outputFilePath) {
    // let argv         = `-s json -l ts -o data.ts storage/platform_json.data.json --just-types`.split(' ')
    // let argv2        = `-s json -l ts -o ${outputFilePath}/lib/interfaces/platform.${type}.generated.ts ${jsonFilePath} --just-types`.split(' ');
    let argv         = [
        '-s', 'json',
        '-l', 'ts',
        '--just-types',
        '-o', outputFilePath, //`${}/lib/interfaces/platform.${type}.generated.ts`,
        jsonFilePath
    ];
    const cliOptions = parseCLIOptions(argv);
    cliOptions.topLevel = cliOptions.topLevel.replace('.generated','');
    await main(cliOptions);
}
