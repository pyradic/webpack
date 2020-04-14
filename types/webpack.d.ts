// noinspection ES6UnusedImports
import webpack, {  ChunkTemplateHooks, compilation }             from 'webpack';
import { HookMap, SyncBailHook, SyncHook, SyncWaterfallHook, Tapable } from 'tapable';
import * as acorn                                                      from 'acorn';

declare module 'webpack' {

    interface ChunkData {
        contentHash?: any
        module?: compilation.Module
        hash: string
        hashWithLength: string
        filename: string
        basename: string
        query?: string
    }

    namespace util {

        class StackedSetMap<K = any, V = any, PK = any, PV = any> {
            map: Map<K, V>;
            stack?: StackedSetMap<PK, PV>;

            add(item: K)

            set(item: K, value: V)

            delete(item: K)

            has(item: K)

            get(item: K)

            asArray(): Array<V> //return Array.from(this.map.entries(), pair => pair[0]);

            asSet(): Set<V>

            asPairArray(): Array<[ K, V ]> //return Array.from(this.map.entries(), pair => /** @type {[TODO, TODO]} */ (pair[1] === UNDEFINED_MARKER ? [pair[0], undefined] : pair)

            asMap(): Map<K, V>

            get size(): number

            createChild(): StackedSetMap
        }
    }

    namespace compilation {

        class MultiModule extends compilation.Module {}

        interface Chunk {

            filenameTemplate: string;
            hash: string;
            hashWithLength: string;
            contentHashWithLength?: any

        }

        interface ChunkGroup {
            name: string;

            getParents(): ChunkGroup[]
        }

        interface ChunkTemplate {
            hooks: ChunkTemplateHooks;
        }

        interface Module {
            renderedHash: string;
            hash: string;
            hashWithLength: string;
            name: string;
        }

        interface MainTemplateHooks {
            jsonpScript?: SyncWaterfallHook<string, Chunk, string>;
            requireExtensions: SyncWaterfallHook<string, Chunk, string>;
            requireEnsure: SyncWaterfallHook<string, Chunk, string>;
            localVars: SyncWaterfallHook<string, Chunk, string>;
            renderManifest: SyncWaterfallHook
            modules: SyncWaterfallHook
            moduleObj: SyncWaterfallHook
            bootstrap: SyncWaterfallHook
            require: SyncWaterfallHook
            beforeStartup: SyncWaterfallHook
            startup: SyncWaterfallHook
            render: SyncWaterfallHook
            renderWithEntry: SyncWaterfallHook
            moduleRequire: SyncWaterfallHook
            addModule: SyncWaterfallHook
            currentHash: SyncWaterfallHook
            assetPath: SyncWaterfallHook
            hash: SyncWaterfallHook
            hashForChunk: SyncHook
            globalHashPaths: SyncWaterfallHook
            globalHash: SyncBailHook
            hotBootstrap: SyncWaterfallHook
        }

        interface MyMainTemplate extends Tapable, compilation.MainTemplate {
            hooks: MainTemplateHooks;
            outputOptions: {
                publicPath: string
                filename: string
                chunkFilename: string
            };
        }

        interface ParserHooks {
            evaluateTypeof: HookMap<SyncBailHook<string>>,
            evaluate: HookMap
            evaluateIdentifier: HookMap
            evaluateDefinedIdentifier: HookMap
            evaluateCallExpressionMember: HookMap
            statement: SyncBailHook<any>
            statementIf: SyncBailHook<any>
            label: HookMap
            import: SyncBailHook<any, any>
            importSpecifier: SyncBailHook<any, any, any, any>
            export: SyncBailHook<any>
            exportImport: SyncBailHook<any, any>
            exportDeclaration: SyncBailHook<any, any>
            exportExpression: SyncBailHook<any, any>
            exportSpecifier: SyncBailHook<any, any, any, any>
            exportImportSpecifier: SyncBailHook<any, any, any, any>
            varDeclaration: HookMap
            varDeclarationLet: HookMap
            varDeclarationConst: HookMap
            varDeclarationVar: HookMap
            canRename: HookMap
            rename: HookMap
            assigned: HookMap
            assign: HookMap
            typeof: HookMap
            importCall: SyncBailHook<CallExpression>
            call: HookMap
            callAnyMember: HookMap
            new: HookMap
            expression: HookMap
            expressionAnyMember: HookMap
            expressionConditionalOperator: SyncBailHook<any>
            expressionLogicalOperator: SyncBailHook<any>
            program: SyncBailHook<any, any>
        }

        interface CallExpression extends acorn.Node {
            arguments: Array<acorn.Node | any>
        }
        interface DependenciesBlock {
            dependencies:compilation.Dependency[]
            blocks:AsyncDependenciesBlock[]
            // variables:DependenciesBlockVariable[]
            hasDependencies(filter:any):boolean
            addBlock(block)
        }
        interface AsyncDependenciesBlock extends compilation.DependenciesBlock {
            groupOptions: {name:string|null}
            chunkGroup :ChunkGroup
            module?:NormalModule
            loc?:acorn.SourceLocation
            request?:string
            parent?:DependenciesBlock&NormalModule
            chunkName?:string
        }

        interface ImportDependenciesBlock extends AsyncDependenciesBlock {
range:[number,number]
        }

        interface Parser {
            hooks: ParserHooks

            parseCommentOptions(range: [ number, number ]): { options: any, errors: any[] }

            evaluateExpression(exp: any): BasicEvaluatedExpression

            state: {
                blocks:ImportDependenciesBlock
                current: NormalModule
                module: NormalModule
                compilation: Compilation
                options: Configuration
                harmonySpecifier: Map<string, { source: string, id: string, sourceOrder: number }>
                harmonyNamedExports: Set<string>
                harmonyStarExports: HarmonyExportImportedSpecifierDependency[]
            }
            scope: {
                topLevelScope: boolean
                inTry: boolean
                inShorthand: boolean
                isStrict: boolean
                definitions: util.StackedSetMap
                renames: util.StackedSetMap
            }
            comments: Array<{
                type: string;
                value: string;
                start: number;
                end: number;
                loc: acorn.SourceLocation
                range: [ number, number ];
            }>
        }

        interface NormalModule extends compilation.Module {

        }

        interface ModuleDependency extends compilation.Dependency {
            getResourceIdentifier(): string
        }

        interface DependencyReference {

        }

        interface HarmonyImportDependency extends ModuleDependency {
            getReference(): DependencyReference

            getImportVar(): string
        }

        interface HarmonyExportImportedSpecifierDependency extends HarmonyImportDependency {

        }

        class BasicEvaluatedExpression {
            type:number // = TypeUnknown;
            range:any // = null;
            falsy:boolean // = false;
            truthy:boolean // = false;
            bool:boolean // = null;
            number:any // = null;
            regExp:any // = null;
            string:any // = null;
            quasis:any // = null;
            parts:any // = null;
            array:any // = null;
            items:any // = null;
            options:any // = null;
            prefix:any // = null;
            postfix:any // = null;
            wrappedInnerExpressions:any // = null;
            expression:any // = null;

            isNull() :boolean

            isString() :boolean

            isNumber() :boolean

            isBoolean() :boolean

            isRegExp() :boolean

            isConditional():boolean

            isArray():boolean
            isConstArray():boolean
            isIdentifier():boolean
            isWrapped():boolean

            isTemplateString():boolean

            isTruthy():boolean
            isFalsy() :boolean

            asBool():boolean|undefined

            asString() :string|undefined

            setString(string) :this

            setNull():this

            setNumber(number):this

            setBoolean(bool) :this

            setRegExp(regExp) :this

            setIdentifier(identifier):this

            setWrapped(prefix, postfix, innerExpressions):this

            setOptions(options):this

            addOptions(options):this

            setItems(items):this

            setArray(array) :this

            setTemplateString(quasis, parts, kind) :this

            setTruthy() :this

            setFalsy() :this

            setRange(range) :this

            setExpression(expression):this
        }

    }


    interface ChunkTemplateHooks {
        hash: SyncHook
        hashForChunk: SyncHook
        modules: SyncWaterfallHook
        render: SyncWaterfallHook
        renderManifest: SyncWaterfallHook
        renderWithEntry: SyncWaterfallHook
    }


    class ChunkGroup extends compilation.ChunkGroup {
        name: string;

        getParents(): ChunkGroup[]
    }

    interface CompilationHooks extends compilation.CompilationHooks {
        compilation: SyncHook<Compilation>
    }


    interface Compiler extends Tapable {
        // hooks?: CompilationHooks;
    }

    class Compilation extends compilation.Compilation {
        chunkTemplate: compilation.ChunkTemplate;
        mainTemplate: compilation.MyMainTemplate;
    }


    type OptionsItemCallback<T> = (chunk: compilation.Chunk) => T
    type OptionsItemTest = string | RegExp | OptionsItemCallback<boolean>
    type OptionsItemFilenameTemplate = string | OptionsItemCallback<string>

    interface OptionsItem {
        test: OptionsItemTest
        filenameTemplate?: OptionsItemFilenameTemplate
        custom?: OptionsItemCallback<void>
    }

    interface Options {
        items?: OptionsItem[]
    }


    interface IData {
        chunk?: compilation.Chunk
        module?: compilation.Module
        hash: string
        hashWithLength: string
        filename: string
        basename: string
        noChunkHash?: boolean
        query?: string
    }

}
