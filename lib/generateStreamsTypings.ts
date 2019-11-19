import mysqldump, { ConnectionOptions } from 'mysqldump';
import { compile } from 'json-schema-to-typescript'
import { config } from 'dotenv'
import Parser from 'sql-ddl-to-json-schema';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { merge } from 'lodash';

const { parsed: env } = config({});

export interface GenerateStreamsTypingsOptions {
    filePath?: string
    connection?: Partial<ConnectionOptions>
}

export async function generateStreamsTypings(options: GenerateStreamsTypingsOptions = {} as any) {
    options    = merge({
        connection: {
            database: env.DB_DATABASE,
            host    : env.DB_HOST,
            password: env.DB_PASSWORD,
            user    : env.DB_USERNAME
        }
    }, options)
    const dump = await mysqldump({
        connection: options.connection as any,
        dump      : {
            data  : false,
            schema: {
                engine: false,
                table : {
                    dropIfExist: false,
                    ifNotExist : false
                }
            }
        }

    })

    const parser = new Parser('mysql');

    let typings: any = {}
    for ( const table of dump.tables ) {
        const jsonSchemaDocuments = parser.feed(table.schema).toJsonSchemaArray({
            useRef   : true,
            indent   : 4,
            extension: '.json'
        });
        const schema              = jsonSchemaDocuments[ 0 ];
        let title                 = table.name.replace('default_', '')
        typings[ title ]          = await compile(schema, title);
        typings[title]=typings[title].replace('export interface Default', 'export interface ')
    }

    // let typings: any = {}
    // for ( const schema of jsonSchemaDocuments ) {
    //     let title = schema.title.replace('default_', '')
    //     console.log('generating', title)
    //     typings[ title ] = await compile(schema, title);
    // }

    let lines = [ 'export namespace streams {' ];
    Object.keys(typings).forEach(title => {
        lines.push(`    export namespace ${title} {`)
        lines.push(typings[ title ]);
        lines.push(`    }`)
    })
    lines.push('}')

    let result = lines.join('\n');

    if ( options.filePath ) {
        writeFileSync(resolve(options.filePath), result, 'utf8');
    }
    return result;

}
