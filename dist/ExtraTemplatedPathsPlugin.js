"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const NAME = 'ExtraTemplatedPathsPlugin';
class ExtraTemplatedPathsPlugin {
    constructor(options) {
        this.templates = [];
        Object.keys(options.templates).forEach(key => {
            this.templates.push({ key, replace: options.templates[key], parser: new TemplatedPathParser(key, options.templates[key]) });
        });
    }
    apply(compiler) {
        compiler.hooks.compilation.tap(NAME, compilation => {
            const mainTemplate = compilation.mainTemplate;
            let data = {};
            const push = (path, value) => {
                let parent = lodash_1.default.get(data, path, []);
                parent.push(value);
                lodash_1.default.set(data, path, parent);
            };
            mainTemplate.hooks.assetPath.tap({ name: NAME, stage: 2 }, (path, data, assetInfo) => {
                // mainTemplate.hooks.assetPath.tap(NAME, (path, data: ChunkData, assetInfo) => {
                const chunk = data.chunk;
                const chunkId = chunk && chunk.id;
                const chunkName = chunk && (chunk.name || chunk.id);
                const chunkHash = chunk && (chunk.renderedHash || chunk.hash);
                const chunkHashWithLength = chunk && chunk.hashWithLength;
                const contentHashType = data.contentHashType;
                const contentHash = (chunk && chunk.contentHash && chunk.contentHash[contentHashType]) || data.contentHash;
                const contentHashWithLength = (chunk &&
                    chunk.contentHashWithLength &&
                    chunk.contentHashWithLength[contentHashType]) ||
                    data.contentHashWithLength;
                const module = data.module;
                const moduleId = module && module.id;
                const moduleHash = module && (module.renderedHash || module.hash);
                const moduleHashWithLength = module && module.hashWithLength;
                let context = {
                    compilation,
                    path,
                    chunk,
                    chunkData: data,
                    chunkId, chunkName, chunkHash, chunkHashWithLength, contentHashType,
                    contentHash, contentHashWithLength,
                    module, moduleId, moduleHash, moduleHashWithLength,
                };
                for (let tpl of this.templates) {
                    if (!tpl.parser.matches(path))
                        continue;
                    let parsed = tpl.parser.parse(path);
                    parsed.forEach(p => {
                        let result = tpl.replace(context, p);
                        if (result === false && p.hasFallback) {
                            result = p.fallbackType === 'templated' ? `[${p.fallback}]` : p.fallback.replace(/^"|'/, '').replace(/"|'$/, '');
                        }
                        if (result !== false) { // JSON.parse(chunk.contentHashWithLength.javascript().replace(/^"\s\+\s/, '').replace(/\[chunkId\].*$/,''))
                            path = path.replace(p.template, result);
                        }
                    });
                }
                return path;
            });
        });
    }
}
exports.ExtraTemplatedPathsPlugin = ExtraTemplatedPathsPlugin;
class Parsed {
    constructor(string) {
        this.string = string;
    }
    get ignore() { return this.template === undefined; }
    get hasArg() { return this.arg !== undefined; }
    get hasFallback() { return this.fallback !== undefined; }
}
exports.Parsed = Parsed;
class TemplatedPathParser {
    constructor(key, replacer) {
        this.key = key;
        this.replacer = replacer;
        this.matchers = {
            arg: /^:[\w\d_-]+/gi,
            fallback: /^\|.+/gi,
        };
    }
    exp() { return new RegExp('\\[' + this.key + '(.*?)?\]', 'gi'); }
    parse(string) {
        let results = [];
        if (!this.matches(string)) {
            return results;
        }
        // let [ template, rest, ...other ] = this.exp().exec(string);
        let matches;
        let exp = this.exp();
        while ((matches = exp.exec(string)) !== null) {
            let [template, rest] = matches;
            const parsed = new Parsed(string);
            parsed.template = template;
            if (rest) {
                let count = 0;
                while (rest.length || count > 10) {
                    if (rest.match(this.matchers.arg)) {
                        let matches = rest.match(this.matchers.arg);
                        rest = rest.slice(matches[0].length);
                        parsed.arg = matches[0].slice(1);
                    }
                    else if (rest.match(this.matchers.fallback)) {
                        let matches = rest.match(this.matchers.fallback);
                        rest = rest.slice(matches[0].length);
                        parsed.fallback = matches[0].slice(1);
                        parsed.fallbackType = parsed.fallback.startsWith('"') || parsed.fallback.startsWith('\'') ? 'string' : 'templated';
                    }
                    count++;
                }
            }
            results.push(parsed);
        }
        return results;
    }
    matches(string) { return string.match(this.exp()); }
}
exports.TemplatedPathParser = TemplatedPathParser;
exports.default = ExtraTemplatedPathsPlugin;
//# sourceMappingURL=ExtraTemplatedPathsPlugin.js.map