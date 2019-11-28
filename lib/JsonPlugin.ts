import { compilation, Compiler, Stats } from 'webpack';
import { resolve } from 'path';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { cloneDeep, get, set } from 'lodash';
import { AddonArray } from './AddonArray';


const webpackJson = {
    filePath     : resolve(__dirname, 'app', 'webpack.json'),
    ensureRemoved: () => existsSync(webpackJson.filePath) && unlinkSync(webpackJson.filePath),
    write        : (data: object) => writeFileSync(webpackJson.filePath, JSON.stringify(data, null, 4), 'utf-8')
}

const createDataObject = () => {
    const obj = {
        _data: {},
        get<T>(path, def?) {return get<T>(obj._data as any, path, def)},
        set(path, value) {return set(obj._data, path, value)},
        push(path, value) {return obj.set(path, obj.get<any[]>(path, []).concat(Array.isArray(value) ? value : [ value ]))},
        getData() {return cloneDeep(obj._data)}
    }
    return obj;
}
const _do              = createDataObject()

export namespace JsonPlugin {
    export interface Options {
        filePath?: string
        addons?: AddonArray
        data?: any
        transformer?: (jsonData: any, data: typeof _do & Record<string, any>) => any
        done?: (jsonData: any, data: typeof _do & Record<string, any>, stats:Stats) => any
        remove?:boolean
    }
}

export class JsonPlugin {
    public static webpackJson: typeof webpackJson = webpackJson
    protected webpackJson: typeof webpackJson     = JsonPlugin.webpackJson

    constructor(protected options: JsonPlugin.Options = {}) {
        this.options.data = this.options.data || {}
    }

    apply(compiler: Compiler): void {
        const NAME = this.constructor.name;
        if ( this.options.filePath !== undefined ) {
            this.webpackJson.filePath = this.options.filePath
        }
        if(this.options.remove) {
            this.webpackJson.ensureRemoved();
        }
        let jsonData: any = { ...this.options.data }
        let data       = createDataObject();

        compiler.hooks.afterEmit.tap(NAME, compilation => {
            let stats        = compilation.getStats().toJson({})
            data       = createDataObject();
            const publicPath = compiler.options.output.publicPath
            Array.from(compilation.entrypoints.values()).forEach((entry) => {
                const name = entry.name;
                // const addon = this.options.addons.findBy('entryName', entry.name)
                data.set(name, { scripts: [], styles: [] });
                const chunks = entry.chunks as compilation.Chunk[];
                for ( const chunk of chunks ) {
                    const scripts = chunk.files.filter(file => file.endsWith('.js'))//.map(file => publicPath + file)
                    const styles  = chunk.files.filter(file => file.endsWith('.css'))//.map(file => publicPath + file)
                    data.push(name + '.scripts', scripts)
                    data.push(name + '.styles', styles)
                    // addon.scripts.push(...scripts)
                    // addon.styles.push(...styles)
                }
            })
            return compilation;

        })
        compiler.hooks.emit.tap(NAME, compilation => {

        })
        compiler.hooks.done.tap(NAME, async (stats) => {
            if(this.options.remove) {
                this.webpackJson.ensureRemoved();
            }
            jsonData = { ...this.options.data }
            if ( typeof this.options.transformer === 'function' ) {
                jsonData = this.options.transformer(jsonData, data)
            }
            this.webpackJson.write(jsonData);
            // this.webpackJson.write({
            //     ...this.options.data,
            //     addons: Arr.make(addons).keyBy('entryName')
            // });
            console.log('File written to ', this.webpackJson.filePath);
            if(typeof this.options.done === 'function'){
                this.options.done(jsonData, data,stats)
            }
        })
    }
}

export default JsonPlugin
