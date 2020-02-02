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
Object.defineProperty(exports, "__esModule", { value: true });
const mysqldump_1 = __importDefault(require("mysqldump"));
const json_schema_to_typescript_1 = require("json-schema-to-typescript");
const dotenv_1 = require("dotenv");
const sql_ddl_to_json_schema_1 = __importDefault(require("sql-ddl-to-json-schema"));
const fs_1 = require("fs");
const path_1 = require("path");
const lodash_1 = require("lodash");
const { parsed: env } = dotenv_1.config({});
function generateStreamsTypings(options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        options = lodash_1.merge({
            connection: {
                database: env.DB_DATABASE,
                host: env.DB_HOST,
                password: env.DB_PASSWORD,
                user: env.DB_USERNAME
            }
        }, options);
        const dump = yield mysqldump_1.default({
            connection: options.connection,
            dump: {
                data: false,
                schema: {
                    engine: false,
                    table: {
                        dropIfExist: false,
                        ifNotExist: false
                    }
                }
            }
        });
        const parser = new sql_ddl_to_json_schema_1.default('mysql');
        let typings = {};
        for (const table of dump.tables) {
            const jsonSchemaDocuments = parser.feed(table.schema).toJsonSchemaArray({
                useRef: true,
                indent: 4,
                extension: '.json'
            });
            const schema = jsonSchemaDocuments[0];
            let title = table.name.replace('default_', '');
            typings[title] = yield json_schema_to_typescript_1.compile(schema, title);
            typings[title] = typings[title].replace('export interface Default', 'export interface ');
        }
        // let typings: any = {}
        // for ( const schema of jsonSchemaDocuments ) {
        //     let title = schema.title.replace('default_', '')
        //     console.log('generating', title)
        //     typings[ title ] = await compile(schema, title);
        // }
        let lines = ['export namespace streams {'];
        Object.keys(typings).forEach(title => {
            lines.push(`    export namespace ${title} {`);
            lines.push(typings[title]);
            lines.push(`    }`);
        });
        lines.push('}');
        let result = lines.join('\n');
        if (options.filePath) {
            fs_1.writeFileSync(path_1.resolve(options.filePath), result, 'utf8');
        }
        return result;
    });
}
exports.generateStreamsTypings = generateStreamsTypings;
//# sourceMappingURL=generateStreamsTypings.js.map