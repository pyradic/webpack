import { ChunkData, compilation, Compiler } from 'webpack';
export declare namespace ExtraTemplatedPathsPlugin {
    interface ReplacerContext {
        compilation: compilation.Compilation;
        path: string;
        module?: compilation.Module;
        chunk: compilation.Chunk;
        chunkData: ChunkData;
        chunkId?: string;
        chunkName?: string;
        chunkHash?: string;
        chunkHashWithLength?: string;
        contentHashType?: string;
        contentHash?: string;
        contentHashWithLength?: string;
        moduleId?: string;
        moduleHash?: string;
        moduleHashWithLength?: string;
    }
    type ReplacerStringValue = string;
    type ReplacerCallbackValue = (context: ReplacerContext, parsed: Parsed) => string | false;
    type ReplacerValue = ReplacerStringValue | ReplacerCallbackValue;
    type ReplacerKey = string;
    type Replacers = ReplacerValue | Record<ReplacerKey, ReplacerValue>;
    type ReplacerDict = Record<ReplacerKey, ReplacerCallbackValue>;
    interface Options {
        templates: Record<string, ReplacerCallbackValue>;
    }
}
export declare class ExtraTemplatedPathsPlugin {
    templates: Array<{
        parser: TemplatedPathParser;
        key: string;
        replace: ExtraTemplatedPathsPlugin.ReplacerCallbackValue;
    }>;
    constructor(options: ExtraTemplatedPathsPlugin.Options);
    apply(compiler: Compiler | any): void;
}
export declare class Parsed {
    string: string;
    template?: string;
    arg?: string;
    fallback?: string;
    fallbackType?: 'templated' | 'string';
    get ignore(): boolean;
    get hasArg(): boolean;
    get hasFallback(): boolean;
    constructor(string: string);
}
export declare class TemplatedPathParser {
    protected key: string;
    protected replacer?: ExtraTemplatedPathsPlugin.ReplacerCallbackValue;
    matchers: {
        arg: RegExp;
        fallback: RegExp;
    };
    constructor(key: string, replacer?: ExtraTemplatedPathsPlugin.ReplacerCallbackValue);
    exp(): RegExp;
    parse(string: string): Parsed[];
    matches(string: string): RegExpMatchArray;
}
export default ExtraTemplatedPathsPlugin;
