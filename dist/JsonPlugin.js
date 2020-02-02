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
const path_1 = require("path");
const fs_1 = require("fs");
const lodash_1 = require("lodash");
const webpackJson = {
    filePath: path_1.resolve(__dirname, 'app', 'webpack.json'),
    ensureRemoved: () => fs_1.existsSync(webpackJson.filePath) && fs_1.unlinkSync(webpackJson.filePath),
    write: (data) => fs_1.writeFileSync(webpackJson.filePath, JSON.stringify(data, null, 4), 'utf-8')
};
const createDataObject = () => {
    const obj = {
        _data: {},
        get(path, def) { return lodash_1.get(obj._data, path, def); },
        set(path, value) { return lodash_1.set(obj._data, path, value); },
        push(path, value) { return obj.set(path, obj.get(path, []).concat(Array.isArray(value) ? value : [value])); },
        getData() { return lodash_1.cloneDeep(obj._data); }
    };
    return obj;
};
const _do = createDataObject();
class JsonPlugin {
    constructor(options = {}) {
        this.options = options;
        this.webpackJson = JsonPlugin.webpackJson;
        this.options.data = this.options.data || {};
    }
    apply(compiler) {
        const NAME = this.constructor.name;
        if (this.options.filePath !== undefined) {
            this.webpackJson.filePath = this.options.filePath;
        }
        if (this.options.remove) {
            this.webpackJson.ensureRemoved();
        }
        let jsonData = Object.assign({}, this.options.data);
        let data = createDataObject();
        compiler.hooks.afterEmit.tap(NAME, compilation => {
            let stats = compilation.getStats().toJson({});
            data = createDataObject();
            const publicPath = compiler.options.output.publicPath;
            Array.from(compilation.entrypoints.values()).forEach((entry) => {
                const name = entry.name;
                // const addon = this.options.addons.findBy('entryName', entry.name)
                data.set(name, { scripts: [], styles: [] });
                const chunks = entry.chunks;
                for (const chunk of chunks) {
                    const scripts = chunk.files.filter(file => file.endsWith('.js')); //.map(file => publicPath + file)
                    const styles = chunk.files.filter(file => file.endsWith('.css')); //.map(file => publicPath + file)
                    data.push(name + '.scripts', scripts);
                    data.push(name + '.styles', styles);
                    // addon.scripts.push(...scripts)
                    // addon.styles.push(...styles)
                }
            });
            return compilation;
        });
        compiler.hooks.emit.tap(NAME, compilation => {
        });
        compiler.hooks.done.tap(NAME, (stats) => __awaiter(this, void 0, void 0, function* () {
            if (this.options.remove) {
                this.webpackJson.ensureRemoved();
            }
            jsonData = Object.assign({}, this.options.data);
            if (typeof this.options.transformer === 'function') {
                jsonData = this.options.transformer(jsonData, data);
            }
            this.webpackJson.write(jsonData);
            // this.webpackJson.write({
            //     ...this.options.data,
            //     addons: Arr.make(addons).keyBy('entryName')
            // });
            console.log('File written to ', this.webpackJson.filePath);
            if (typeof this.options.done === 'function') {
                this.options.done(jsonData, data, stats);
            }
        }));
    }
}
exports.JsonPlugin = JsonPlugin;
JsonPlugin.webpackJson = webpackJson;
exports.default = JsonPlugin;
//# sourceMappingURL=JsonPlugin.js.map