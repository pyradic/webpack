// noinspection ES6UnusedImports
import webpack, { ChunkTemplateHooks, compilation,  } from 'webpack';
import { SyncBailHook, SyncHook, SyncWaterfallHook, Tapable }          from 'tapable';


declare module 'webpack' {
    interface ChunkData {
        contentHash?:any
        contentHashType?:any
        contentHashWithLength?:any
        module?: compilation.Module
        hash: string
        hashWithLength: string
        filename: string
        basename: string
        query?: string
    }

    namespace compilation {
        class MultiModule extends compilation.Module {}
        interface Chunk {

            filenameTemplate: string;
            hash: string;
            hashWithLength: string;
            contentHashWithLength?:any

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
            renderManifest: SyncWaterfallHook
            modules: SyncWaterfallHook
            moduleObj: SyncWaterfallHook
            requireEnsure: SyncWaterfallHook
            bootstrap: SyncWaterfallHook
            localVars: SyncWaterfallHook
            require: SyncWaterfallHook
            requireExtensions: SyncWaterfallHook
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
            jsonpScript: SyncWaterfallHook
        }

        interface MyMainTemplate extends Tapable, compilation.MainTemplate {
            hooks: MainTemplateHooks;
            outputOptions: {
                publicPath: string
                filename: string
                chunkFilename: string
            };
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