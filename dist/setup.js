"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("@radic/webpacker/lib");
const path_1 = require("path");
const JsonPlugin_1 = require("./JsonPlugin");
const utils_1 = require("./utils");
const EntrypointPathPlugin_1 = __importDefault(require("./EntrypointPathPlugin"));
const clean_webpack_plugin_1 = require("clean-webpack-plugin");
const ts_import_plugin_1 = __importDefault(require("ts-import-plugin"));
function setupBase(options) {
    const { mode, namespace, rootPath, outputPath } = options;
    const wp = new lib_1.Webpacker({
        mode: mode,
        path: rootPath,
        contextPath: rootPath,
        sourceMap: mode === 'development',
    });
    wp.settings.set('babel', {
        babelrc: false,
        configFile: false,
        cacheDirectory: false,
        compact: wp.isProd,
        sourceMaps: wp.isDev,
        comments: wp.isDev,
        presets: [['@vue/babel-preset-app']],
        plugins: [
            ['import', { libraryName: 'lodash', libraryDirectory: '', camel2DashComponentName: false }],
        ],
    });
    wp.module.rule('babel').test(/\.(js|mjs|jsx)$/).exclude.add(file => (/node_modules/.test(file)
        && !/\.vue\.js/.test(file)));
    wp.module.rule('typescript').test(/\.(ts|tsx)$/).exclude.add(/node_modules/);
    wp.resolveLoader.symlinks(true);
    wp.resolve.symlinks(true);
    wp.output
        .library([namespace, '[addon:exportName]'])
        .libraryTarget('window')
        .filename('js/[name].js')
        .chunkFilename('js/[entrypoint].chunk.[contenthash].js')
        .path(path_1.join(rootPath, outputPath))
        .publicPath('/assets/')
        .pathinfo(wp.isDev);
    lib_1.rules.css(wp);
    lib_1.rules.scss(wp, {
        scss: { implementation: require('sass') },
    });
    lib_1.rules.stylus(wp);
    lib_1.rules.images(wp);
    lib_1.rules.fonts(wp, { publicPath: '/assets/fonts/' });
    lib_1.rules.vue(wp);
    lib_1.plugins.vueLoader(wp);
    lib_1.rules.pug(wp);
    lib_1.rules.babel(wp);
    // rules.cache(wp, {}, 'typescript')
    // rules.thread(wp, {}, 'typescript')
    // wp.module.rule('typescript').use('save-content-loader').loader(resolve(rootPath, 'save-content-loader')).options({ name: 'babel' });
    lib_1.rules.babel(wp, {}, 'typescript');
    // wp.module.rule('typescript').use('save-content-loader').loader(resolve(rootPath, 'save-content-loader')).options({    name: 'typescript',});
    lib_1.rules.typescript(wp, {
        appendTsxSuffixTo: [/.vue$/],
        configFile: 'tsconfig.json',
        transpileOnly: true,
        // experimentalWatchApi: true,
        // happyPackMode       : true,
        compilerOptions: {
            target: 'es5',
            module: 'esnext',
            importHelpers: true,
            sourceMap: wp.isDev,
            removeComments: wp.isProd,
        },
    });
    wp.blocks.rules['typescriptImport'] = lib_1.Webpacker.wrap((wp, importOptions, ruleName = 'typescript') => {
        // options = [ { libraryName: 'lodash', libraryDirectory: null, camel2DashComponentName: false } ];
        return wp.module.rule(ruleName)
            .use('ts-loader')
            .tap((options) => {
            let otherTransformers = () => ({});
            if (typeof options.getCustomTransformers === 'function') {
                otherTransformers = options.getCustomTransformers;
            }
            options.getCustomTransformers = (...params) => {
                let { before, after, afterDeclarations } = otherTransformers(...params);
                return {
                    before: [...(before || []), ts_import_plugin_1.default(importOptions)],
                    after: [...(after || [])],
                    afterDeclarations: [...(afterDeclarations || [])],
                };
            };
            return options;
        });
    });
    wp.blocks.rules.typescriptImport(wp, [
        wp.blocks.rules.typescriptImportPresets.lodash,
    ]);
    wp.resolve.modules.merge([path_1.resolve(rootPath, 'node_modules')]);
    wp.resolve.alias.merge({
        'jquery$': 'jquery/src/jquery',
        'babel-core$': '@babel/core',
        'node_modules/element-theme-scss/lib': path_1.resolve(rootPath, 'packages/element-ui-theme/lib'),
        'node_modules/element-theme-scss/src': path_1.resolve(rootPath, 'packages/element-ui-theme/src'),
        'streams::': path_1.resolve(rootPath, 'vendor/anomaly/streams-platform/resources'),
    });
    wp.externals({
        'jquery': 'jQuery',
        'vue': 'Vue',
        'vue-class-component': 'VueClassComponent',
        'vue-property-decorator': 'VuePropertyDecorator',
        'bootstrap': 'jQuery',
    });
    lib_1.plugins.define(wp, {
        DEV: wp.isDev,
        PROD: wp.isProd,
        HOT: wp.isHot,
        ENV: process.env.NODE_ENV,
        NAMESPACE: namespace,
        'process.env': {
            NODE_ENV: `"#{process.env.NODE_ENV}"`,
        },
    });
    wp.plugin('clean').use(clean_webpack_plugin_1.CleanWebpackPlugin, [{
            cleanOnceBeforeBuildPatterns: [wp.output.store.get('path')],
            verbose: true,
        }]);
    wp.optimization
        .merge({
        chunkIds: 'named',
        moduleIds: 'named',
    })
        .namedChunks(true)
        .namedModules(true);
    lib_1.plugins.miniCssExtract(wp, {
        filename: 'css/[name].css',
        chunkFilename: 'css/[name].chunk.[id].css',
    });
    return wp;
}
exports.setupBase = setupBase;
function setupWebpacker(builder) {
    const { env, options, addons } = builder;
    const wp = setupBase(options);
    wp.stats(false);
    /* Report file sizes after compilation */
    lib_1.plugins.size(wp);
    lib_1.plugins.friendlyErrors(wp);
    /* Show progress bar */
    lib_1.plugins.bar(wp);
    /* Generates a detailed compilation report */
    lib_1.plugins.bundleAnalyzer(wp, {
        reportFilename: path_1.resolve(options.rootPath, options.outputPath, 'bundle-analyzer.html'),
    });
    lib_1.plugins.html(wp, {
        template: path_1.resolve(__dirname, '../lib/index.html'),
        filename: 'index.html',
    });
    /* Provides the '[addon:<name>]' tag in output configuration */
    lib_1.plugins.extraTemplatedPaths(wp, {
        templates: {
            addon: (c, p) => {
                let addon = addons.find(a => a.exportNames.includes(c.chunkName));
                if (!addon) {
                    if (c.chunkName) {
                        return c.chunkName;
                    }
                    return false;
                }
                if (!p.hasArg) {
                    if (c.chunkName) {
                        return c.chunkName;
                    }
                    return addon.relativePath;
                }
                // @todo fix this properly, this is just a quick fix
                if (p.arg === 'exportName' && addon.exportName !== c.chunkName) {
                    // suffixed
                    if (c.chunkName.startsWith(addon.exportName)) {
                        // let suffix = c.chunkName.replace(addon.exportName)
                        return c.chunkName;
                    }
                    else {
                        throw new Error('Super duper invalid extra templated addon path in setuyp.ts');
                    }
                }
                if (typeof addon[p.arg] === 'string') {
                    return addon[p.arg];
                }
                return false;
            },
        },
    });
    /* Provides the '[entrypoint]' tag in output configuration */
    wp.plugin('entrypoint-path').use(EntrypointPathPlugin_1.default);
    /* expose assigns a library to global/window */
    lib_1.rules.expose(wp, 'inversify');
    lib_1.rules.expose(wp, 'tapable');
    lib_1.rules.expose(wp, { name: `lodash`, as: '_' });
    // rules.expose(wp, { name: 'vue', as: 'Vue' })
    lib_1.rules.expose(wp, { name: 'reflect-metadata', as: 'reflect_metadata' });
    /* JsonPlugin creates the webpack.json file */
    JsonPlugin_1.JsonPlugin.webpackJson.filePath = path_1.resolve(options.rootPath, options.manifestPath);
    JsonPlugin_1.JsonPlugin.webpackJson.ensureRemoved();
    wp.plugin('json').use(JsonPlugin_1.JsonPlugin, [{
            filePath: path_1.resolve(options.rootPath, options.manifestPath),
            data: {
                server: wp.isServer,
                mode: wp.store.get('mode'),
                output: {},
                devServer: {},
            },
            transformer: (jsonData, _data) => {
                addons.reloadJSONData();
                let data = _data.getData();
                let entryNames = Object.keys(data);
                entryNames.forEach(entryName => {
                    let addon = addons.findByExportNames(entryName);
                    let entryData = data[entryName];
                    if (addon) {
                        addon.addEntry(entryName, entryData);
                        // addon.scripts.push(...entryData.scripts)
                        // addon.styles.push(...entryData.styles)
                    }
                });
                jsonData.output = utils_1.map2object(wp.output.store);
                jsonData.output.path = jsonData.output.path.replace(options.rootPath + '/', '');
                jsonData.devServer = wp.isServer ? utils_1.map2object(wp.devServer.store) : null;
                jsonData.addons = addons.sortByDependency().map((addon, index) => {
                    addon.sorted = index;
                    const obj = addon.toObject();
                    obj.srcPath = obj.srcPath.replace(options.rootPath + '/', '');
                    for (const key of Object.keys(obj.entries)) {
                        obj.entries[key].path = obj.entries[key].path.replace(options.rootPath + '/', '');
                    }
                    return obj;
                });
                return jsonData;
            },
            done: (jsonData, _data, stats) => {
                let data = _data.getData();
                let entryNames = Object.keys(data);
            },
        }]);
    if (wp.isServer) {
        /* Setup webpack-dev-server */
        wp.module.rules.delete('source-map-loader');
        wp.stats(false);
        lib_1.helpers.devServer(wp);
        lib_1.helpers.setServerLocation(wp, options.protocol || 'http', options.host || 'localhost', options.port || 8179);
        wp.devServer
            .contentBase(path_1.join(options.rootPath, options.outputPath))
            .overlay(true)
            .inline(true)
            .writeToDisk(true);
        wp.optimization.minimize(false);
    }
    if (wp.isDev) {
        wp.devtool('#source-map');
        wp.output
            .devtoolModuleFilenameTemplate(info => {
            var $filename = 'sources://' + info.resourcePath;
            $filename = 'webpack:///' + info.resourcePath; // +'?' + info.hash;
            if (info.resourcePath.match(/\.vue$/) && !info.allLoaders.match(/type=script/) && !info.query.match(/type=script/)) {
                $filename = 'webpack-generated:///' + info.resourcePath; // + '?' + info.hash;
            }
            return $filename;
        })
            .devtoolFallbackModuleFilenameTemplate('webpack:///[resource-path]?[hash]');
    }
    if (wp.isProd) {
        wp.settings.sourceMap = false;
        wp.devtool(false);
        wp.mode('production');
        wp.optimization.minimize(true);
        lib_1.helpers.minimizer(wp, {
            terserOptions: {
                keep_classnames: /.*ServiceProvider.*/,
                keep_fnames: /.*ServiceProvider.*/,
            },
        });
        /* replace style-loader with MiniCssExtract.loader */
        lib_1.helpers.replaceStyleLoader(wp, 'css');
        lib_1.helpers.replaceStyleLoader(wp, 'scss');
        lib_1.plugins.loaderOptions(wp, {
            minimize: true,
        });
        // helpers.minimizer(wp)
        /* Move all common vendor libraries into 1 vendor chunk */
        wp.optimization
            .splitChunks({
            cacheGroups: {
                vendors: {
                    name: 'vendors',
                    test: /[\\/]node_modules[\\/](inversify|reflect-metadata|core-js|axios|tapable|util|lodash|element-ui|tslib|process|debug|regenerator-runtime|@babel\/runtime)/,
                    enforce: true,
                    chunks: 'initial',
                },
            },
        });
    }
    /* Handle addons: Adds all addon entrypoints, Adds references to externals */
    for (const addon of addons) {
        let main = addon.entrypoints.env(wp.store.get('mode')).main();
        wp.entry(addon.exportName).add(main.path);
        if (addon.useHMR) {
            wp.entry(addon.exportName)
                .prepend('webpack/hot/only-dev-server')
                .prepend('webpack-dev-server/client?http://localhost:8079');
        }
        wp.externals(Object.assign(Object.assign({}, wp.get('externals')), { [addon.name]: [options.namespace, addon.exportName] }));
        addon.entrypoints.env(wp.store.get('mode')).suffixed().forEach(entrypoint => {
            wp.entry(addon.exportName + entrypoint.suffix).add(entrypoint.path);
            wp.externals(Object.assign(Object.assign({}, wp.get('externals')), { [addon.name + entrypoint.suffix]: [options.namespace, addon.exportName + entrypoint.suffix] }));
        });
    }
    return wp;
}
exports.setupWebpacker = setupWebpacker;
//# sourceMappingURL=setup.js.map