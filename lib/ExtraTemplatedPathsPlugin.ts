
import { ChunkData, compilation, Compiler, Plugin }           from 'webpack';
import { SyncBailHook, SyncHook, SyncWaterfallHook, Tapable } from 'tapable';
import _                                                      from 'lodash';


const NAME = 'ExtraTemplatedPathsPlugin';


export namespace ExtraTemplatedPathsPlugin {


    export interface ReplacerContext {
        compilation: compilation.Compilation
        path: string
        module?: compilation.Module
        chunk: compilation.Chunk
        chunkData: ChunkData
        chunkId?: string
        chunkName?: string
        chunkHash?: string
        chunkHashWithLength?: string
        contentHashType?: string
        contentHash?: string
        contentHashWithLength?: string
        moduleId?: string
        moduleHash?: string
        moduleHashWithLength?: string

    }

    export type ReplacerStringValue = string
    export type ReplacerCallbackValue = (context: ReplacerContext, parsed: Parsed) => string | false
    export type ReplacerValue = ReplacerStringValue | ReplacerCallbackValue

    export type ReplacerKey = string
    export type Replacers = ReplacerValue | Record<ReplacerKey, ReplacerValue>
    export type ReplacerDict = Record<ReplacerKey, ReplacerCallbackValue>


    export interface Options {

        templates: Record<string, ReplacerCallbackValue>
    }
}

export class ExtraTemplatedPathsPlugin {
    templates: Array<{ parser: TemplatedPathParser, key: string, replace: ExtraTemplatedPathsPlugin.ReplacerCallbackValue }> = [];

    constructor(options: ExtraTemplatedPathsPlugin.Options) {
        Object.keys(options.templates).forEach(key => {

            this.templates.push({ key, replace: options.templates[ key ], parser: new TemplatedPathParser(key, options.templates[ key ]) });
        });
    }

    apply(compiler: Compiler|any) {
        compiler.hooks.compilation.tap(NAME, compilation => {
            const mainTemplate = compilation.mainTemplate;

            let data = {};

            const push = (path: string, value) => {
                let parent = _.get(data, path, []);
                parent.push(value);
                _.set(data, path, parent);
            };

            mainTemplate.hooks.assetPath.tap({ name: NAME, stage: 2 } as any, (path, data: ChunkData, assetInfo) => {
                // mainTemplate.hooks.assetPath.tap(NAME, (path, data: ChunkData, assetInfo) => {
                const chunk                 = data.chunk;
                const chunkId               = chunk && chunk.id;
                const chunkName             = chunk && (chunk.name || chunk.id);
                const chunkHash             = chunk && (chunk.renderedHash || chunk.hash);
                const chunkHashWithLength   = chunk && chunk.hashWithLength;
                const contentHashType       = data.contentHashType;
                const contentHash           = (chunk && chunk.contentHash && chunk.contentHash[ contentHashType ]) || data.contentHash;
                const contentHashWithLength =
                          (chunk &&
                              chunk.contentHashWithLength &&
                              chunk.contentHashWithLength[ contentHashType ]) ||
                          data.contentHashWithLength;
                const module               :any = data.module;
                const moduleId             :any = module && module.id;
                const moduleHash           :any = module && (module.renderedHash || module.hash);
                const moduleHashWithLength :any = module && module.hashWithLength;

                let context: ExtraTemplatedPathsPlugin.ReplacerContext = <ExtraTemplatedPathsPlugin.ReplacerContext|any>{
                    compilation,
                    path,
                    chunk,
                    chunkData: data,
                    chunkId, chunkName, chunkHash, chunkHashWithLength, contentHashType,
                    contentHash, contentHashWithLength,
                    module, moduleId, moduleHash, moduleHashWithLength,
                } as any;
                for ( let tpl of this.templates ) {
                    if ( !tpl.parser.matches(path) ) continue;
                    let parsed = tpl.parser.parse(path);
                    parsed.forEach(p => {
                        let result = tpl.replace(context, p);
                        if ( result === false && p.hasFallback ) {
                            result = p.fallbackType === 'templated' ? `[${p.fallback}]` : p.fallback.replace(/^"|'/, '').replace(/"|'$/, '');
                        }
                        if ( result !== false ) { // JSON.parse(chunk.contentHashWithLength.javascript().replace(/^"\s\+\s/, '').replace(/\[chunkId\].*$/,''))
                            path = path.replace(p.template, result);
                        }
                    });
                }
                return path;
            });

        });
    }
}


export class Parsed {
    public template?: string;
    public arg?: string;
    public fallback?: string;
    public fallbackType?: 'templated' | 'string';

    get ignore() {return this.template === undefined;}

    get hasArg() {return this.arg !== undefined;}

    get hasFallback() {return this.fallback !== undefined;}

    constructor(public string: string) {}
}

export class TemplatedPathParser {
    matchers = {
        arg     : /^:[\w\d_-]+/gi,
        fallback: /^\|.+/gi,
    };

    constructor(protected key: string, protected replacer?: ExtraTemplatedPathsPlugin.ReplacerCallbackValue) {}

    exp() {return new RegExp('\\[' + this.key + '(.*?)?\]', 'gi'); }

    parse(string: string): Parsed[] {
        let results = [];
        if ( !this.matches(string) ) {
            return results;
        }
        // let [ template, rest, ...other ] = this.exp().exec(string);
        let matches;
        let exp = this.exp();
        while ( (matches = exp.exec(string)) !== null ) {
            let [ template, rest ] = matches;
            const parsed           = new Parsed(string);
            parsed.template        = template;
            if ( rest ) {
                let count = 0;
                while ( rest.length || count > 10 ) {
                    if ( rest.match(this.matchers.arg) ) {
                        let matches = rest.match(this.matchers.arg);
                        rest        = rest.slice(matches[ 0 ].length);
                        parsed.arg  = matches[ 0 ].slice(1);
                    } else if ( rest.match(this.matchers.fallback) ) {
                        let matches         = rest.match(this.matchers.fallback);
                        rest                = rest.slice(matches[ 0 ].length);
                        parsed.fallback     = matches[ 0 ].slice(1);
                        parsed.fallbackType = parsed.fallback.startsWith('"') || parsed.fallback.startsWith('\'') ? 'string' : 'templated';
                    }
                    count ++;
                }
            }

            results.push(parsed);
        }
        return results;
    }

    matches(string: string) {return string.match(this.exp());}
}

export default ExtraTemplatedPathsPlugin ;