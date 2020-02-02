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
Object.defineProperty(exports, "__esModule", { value: true });
// noinspection ES6UnusedImports
const quicktype_1 = require("quicktype");
function generatePlatformTypings(jsonFilePath, outputFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        // let argv         = `-s json -l ts -o data.ts storage/platform_json.data.json --just-types`.split(' ')
        // let argv2        = `-s json -l ts -o ${outputFilePath}/lib/interfaces/platform.${type}.generated.ts ${jsonFilePath} --just-types`.split(' ');
        let argv = [
            '-s', 'json',
            '-l', 'ts',
            '--just-types',
            '-o', outputFilePath,
            jsonFilePath
        ];
        const cliOptions = quicktype_1.parseCLIOptions(argv);
        cliOptions.topLevel = cliOptions.topLevel.replace('.generated', '');
        yield quicktype_1.main(cliOptions);
    });
}
exports.generatePlatformTypings = generatePlatformTypings;
//# sourceMappingURL=generatePlatformTypings.js.map