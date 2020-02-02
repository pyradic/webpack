"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webpacker_1 = require("@radic/webpacker");
const path_1 = require("path");
const JsonPlugin_1 = require("./JsonPlugin");
const utils_1 = require("./utils");
const EntrypointPathPlugin_1 = __importDefault(require("./EntrypointPathPlugin"));
const clean_webpack_plugin_1 = require("clean-webpack-plugin");
function setupBase(options) {
    const { mode, namespace, rootPath, outputPath } = options;
    const wp = new webpacker_1.Webpacker({
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
    wp.module.rule('babel').test(/\.(js|mjs|jsx)$/).exclude.add(/node_modules/);
    wp.module.rule('typescript').test(/\.(ts|tsx)$/).exclude.add(/node_modules/);
    wp.resolveLoader.symlinks(true);
    wp.resolve.symlinks(true);
    wp.output
        .library([namespace, '[addon:exportName]'])
        .libraryTarget('window')
        .filename('js/[name].js')
        .chunkFilename('js/[entrypoint].chunk.[name].js')
        .path(path_1.join(rootPath, outputPath))
        .publicPath('/assets')
        .pathinfo(wp.isDev);
    webpacker_1.rules.css(wp);
    webpacker_1.rules.scss(wp, {
        scss: {
            implementation: require('sass'),
        },
    });
    webpacker_1.rules.stylus(wp);
    webpacker_1.rules.images(wp);
    webpacker_1.rules.fonts(wp, { publicPath: '/assets/fonts/' });
    webpacker_1.rules.vue(wp);
    webpacker_1.plugins.vueLoader(wp);
    webpacker_1.rules.pug(wp);
    webpacker_1.rules.babel(wp);
    // rules.cache(wp, {}, 'typescript')
    // rules.thread(wp, {}, 'typescript')
    // wp.module.rule('typescript').use('save-content-loader').loader(resolve(rootPath, 'save-content-loader')).options({ name: 'babel' });
    webpacker_1.rules.babel(wp, {}, 'typescript');
    // wp.module.rule('typescript').use('save-content-loader').loader(resolve(rootPath, 'save-content-loader')).options({    name: 'typescript',});
    webpacker_1.rules.typescript(wp, {
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
    wp.blocks.rules.typescriptImport(wp, [
        wp.blocks.rules.typescriptImportPresets.lodash,
    ]);
    wp.resolve.modules.merge([path_1.resolve(rootPath, 'node_modules')]);
    wp.resolve.alias.merge({
        'jquery$': 'jquery/src/jquery',
        // 'vue$'                               : 'vue/dist/vue.esm.js',
        'babel-core$': '@babel/core',
    });
    wp.externals({
        'jquery': 'jQuery',
        'vue': 'Vue',
        'vue-class-component': 'VueClassComponent',
        'vue-property-decorator': 'vue-property-decorator',
        'bootstrap': 'jQuery',
    });
    webpacker_1.plugins.define(wp, {
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
    if (wp.isProd) {
        wp.settings.sourceMap = false;
        wp.devtool(false);
        wp.mode('production');
        wp.optimization.minimize(true);
        webpacker_1.helpers.minimizer(wp, {
            terserOptions: {
                keep_classnames: /.*ServiceProvider.*/,
                keep_fnames: /.*ServiceProvider.*/,
            },
        });
        /* replace style-loader with MiniCssExtract.loader */
        webpacker_1.helpers.replaceStyleLoader(wp, 'css');
        webpacker_1.helpers.replaceStyleLoader(wp, 'scss');
        webpacker_1.plugins.loaderOptions(wp, {
            minimize: true,
        });
        // helpers.minimizer(wp)
    }
    webpacker_1.plugins.miniCssExtract(wp, {
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
    webpacker_1.plugins.size(wp);
    webpacker_1.plugins.friendlyErrors(wp);
    /* Show progress bar */
    webpacker_1.plugins.bar(wp);
    /* Generates a detailed compilation report */
    webpacker_1.plugins.bundleAnalyzer(wp, {
        reportFilename: path_1.resolve(options.rootPath, options.outputPath, 'bundle-analyzer.html'),
    });
    webpacker_1.plugins.html(wp, {
        template: path_1.resolve(__dirname, '../index.html'),
        filename: 'index.html',
    });
    /* Provides the '[addon:<name>]' tag in output configuration */
    webpacker_1.plugins.extraTemplatedPaths(wp, {
        templates: {
            addon: (c, p) => {
                let addon = addons.find(a => a.exportName === c.chunkName);
                if (!addon) {
                    return false;
                }
                if (!p.hasArg) {
                    return addon.path;
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
    webpacker_1.rules.expose(wp, 'inversify');
    webpacker_1.rules.expose(wp, 'tapable');
    webpacker_1.rules.expose(wp, { name: `lodash`, as: '_' });
    // rules.expose(wp, { name: 'vue', as: 'Vue' })
    webpacker_1.rules.expose(wp, { name: 'reflect-metadata', as: 'reflect_metadata' });
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
    //
    // wp.extendConfig(config => {
    //     let o          = config.optimization;
    //     o.chunkIds     = 'named';
    //     o.moduleIds    = 'named';
    //     o.namedChunks  = true;
    //     o.namedModules = true;
    // });
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
    if (wp.isServer) {
        /* Setup webpack-dev-server */
        wp.module.rules.delete('source-map-loader');
        wp.stats(false);
        webpacker_1.helpers.devServer(wp);
        webpacker_1.helpers.setServerLocation(wp, options.protocol || 'http', options.host || 'localhost', options.port || 8179);
        wp.devServer
            .contentBase(path_1.join(options.rootPath, options.outputPath))
            .overlay(true)
            .inline(true);
        wp.devServer.set('writeToDisk', true);
        wp.optimization.minimize(false);
    }
    /* Handle addons: Adds all addon entrypoints, Adds references to externals */
    for (const addon of addons) {
        let main = addon.entrypoints.env(wp.store.get('mode')).main();
        wp.entry(addon.exportName).add(main.path);
        wp.externals(Object.assign(Object.assign({}, wp.get('externals')), { [addon.name]: [options.namespace, addon.exportName] }));
        addon.entrypoints.env(wp.store.get('mode')).suffixed().forEach(entrypoint => {
            wp.entry(addon.exportName + entrypoint.suffix).add(entrypoint.path);
            wp.externals(Object.assign(Object.assign({}, wp.get('externals')), { [addon.name + entrypoint.suffix]: [options.namespace, addon.exportName + entrypoint.suffix] }));
        });
        // if ( addon.isSingle ) {
        //     wp.entry(addon.entryName).add(addon.entry.development);
        // } else {
        //     for ( const entry of addon.entrypoints ) {
        //         if ( 'env' in entry === false || entry.env === wp.store.get('mode') ) {
        //             wp.entry(addon.entryName + (entry.suffix || '')).add(entry.path)
        //         }
        //     }
        // }
    }
    return wp;
}
exports.setupWebpacker = setupWebpacker;
//# sourceMappingURL=setup.js.map