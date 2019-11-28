import { helpers, loaders, plugins, rules, Webpacker } from '@radic/webpacker';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import { JsonPlugin } from './JsonPlugin';
import { PyroBuilder } from './PyroBuilder';
import { map2object } from './utils';

export interface SetupBaseOptions {
    mode: 'development' | 'production'
    rootPath: string
    namespace: string
}

export function setupBase(options: SetupBaseOptions) {
    const { mode, namespace, rootPath } = options;
    const wp                            = new Webpacker({
        mode       : mode,
        path       : rootPath,
        contextPath: rootPath,
        sourceMap  : mode === 'development'
    });
    wp.settings.set('babel', {
        babelrc       : false,
        configFile    : false,
        cacheDirectory: false, //wp.isDev,
        compact       : wp.isProd,
        sourceMaps    : wp.isDev,
        comments      : wp.isDev,
        presets       : [ [ '@vue/babel-preset-app' ] ],
        plugins       : [
            // [ 'component', {
            //     libraryName     : 'element-ui',
            //     styleLibraryName:'~element-ui-theme',
            //     // styleLibrary:{
            //     //     name:  '~element-ui-theme',
            //     //     path: '[module]/lib/index.css'
            //     // },
            //     libDir: 'lib',
            //     style: 'lib/index.css'
            // } ]
        ]
    });

    wp.module.rule('babel').test(/\.(js|mjs|jsx)$/).exclude.add(/node_modules/);
    wp.module.rule('typescript').test(/\.(ts|tsx)$/).exclude.add(/node_modules/);

    wp.resolveLoader.symlinks(true);
    wp.resolve.symlinks(true);


    wp.output
        .library([ namespace, '[addon:exportName]' ] as any)
        .libraryTarget('window')
        .filename('js/[name].js')
        .chunkFilename('js/[name].chunk.[id].js')
        .path(join(rootPath, 'public/assets'))
        .publicPath('/assets')
    ;

    rules.css(wp);
    rules.scss(wp, {
        scss: {
            implementation: require('sass')
        }
    });
    // loaders.saveContent(wp, 'scss', {
    //     name:'a',
    //     outputPath:
    // })
    // wp.module.rule('scss').use('save-content-loader').loader(resolve(rootPath, 'save-content-loader')).options({ name: 'babel' });
    rules.stylus(wp);
    rules.images(wp);
    rules.fonts(wp, { publicPath: '/assets/fonts/' });
    rules.vue(wp)
    //     compiler:''
    //     tsx: ''
    // });
    rules.pug(wp);

    rules.babel(wp);
    // rules.cache(wp, {}, 'typescript')
    // rules.thread(wp, {}, 'typescript')
    // wp.module.rule('typescript').use('save-content-loader').loader(resolve(rootPath, 'save-content-loader')).options({ name: 'babel' });
    rules.babel(wp, {}, 'typescript');
    // wp.module.rule('typescript').use('save-content-loader').loader(resolve(rootPath, 'save-content-loader')).options({    name: 'typescript',});
    rules.typescript(wp, {
        appendTsSuffixTo: [ /.vue$/ ],
        configFile      : 'tsconfig.json',
        transpileOnly   : true,
        // experimentalWatchApi: true,
        // happyPackMode       : true,
        compilerOptions : {
            target        : 'es5' as any,
            module        : 'esnext' as any,
            importHelpers : true,
            // allowJs       : true,
            sourceMap     : wp.isDev,
            removeComments: wp.isProd
        }
    });
    let platformPackagePath = resolve(rootPath, 'packages/pyro/platform');
    let platformVendorPath  = resolve(rootPath, 'vendor/pyro/platform');
    let platformPath        = existsSync(platformVendorPath) ? platformVendorPath : platformPackagePath

    wp.resolve.modules.merge([ resolve(rootPath, 'node_modules') ])
    wp.resolve.alias.merge({
        'jquery$'                            : 'jquery/src/jquery',
        'quasar$'                            : 'quasar/dist/quasar.esm.js',
        // 'vue$'                               : 'vue/dist/vue.esm.js',
        'babel-core$'                        : '@babel/core',
        'select2$'                           : wp.isProd ? 'select2/dist/js/select2.min.js' : 'select2/dist/js/select2.full.js',
        // './../utilities'                     : 'packages/pyradic/platform/lib/vendor/utilities.js'),
        '@c'                                 : join(platformPath, 'lib/classes/'),
        '@u'                                 : join(platformPath, 'lib/utils/'),
        '@'                                  : join(platformPath, 'lib/'),
        '#'                                  : join(platformPath, 'lib/components/'),
        'node_modules/element-theme-scss/lib': resolve(rootPath, 'packages/element-ui-theme/lib'),
        'node_modules/element-theme-scss/src': resolve(rootPath, 'packages/element-ui-theme/src'),
        'streams::'                          : resolve(rootPath, 'vendor/anomaly/streams-platform/resources')
    });

    wp.externals({
        'jquery'                : 'jQuery',
        'vue'                   : 'Vue',
        'vue-class-component'   : 'VueClassComponent',
        'vue-property-decorator': 'vue-property-decorator',
        'bootstrap'             : 'jQuery'
    });

    plugins.define(wp, {
        DEV          : wp.isDev,
        PROD         : wp.isProd,
        HOT          : wp.isHot,
        ENV          : process.env.NODE_ENV,
        NAMESPACE    : namespace,
        'process.env': {
            NODE_ENV: `"#{process.env.NODE_ENV}"`
        }
    } as any);


    if ( wp.isProd ) {
        wp.settings.sourceMap = false;
        wp.devtool(false)
        wp.mode('production');
        wp.optimization.minimize(true)

        helpers.minimizer(wp, {
            terserOptions: {
                // keep_fnames:true
            },
            exclude: [/ServiceProvider/]
        })
        helpers.replaceStyleLoader(wp, 'css')
        helpers.replaceStyleLoader(wp, 'scss')
        plugins.loaderOptions(wp, {
            minimize: true
        })
        // helpers.minimizer(wp)
    }

    plugins.miniCssExtract(wp, {
        filename     : 'css/[name].css',
        // filename     : <any>(()=>{
        //     return '[name].css'
        // }),
        chunkFilename: 'css/[name].chunk.[id].css'
    })

    return wp;
}

export function setupWebpacker(builder: PyroBuilder) {
    const { rootPath, namespace, env, mode, addons } = builder
    const wp                                         = setupBase({ rootPath, namespace, mode })

    plugins.friendlyErrors(wp);
    plugins.bar(wp);
    plugins.bundleAnalyzer(wp, {
        reportFilename: resolve(rootPath, 'bundle-analyzer.html')
    });
    plugins.vueLoader(wp);
    plugins.html(wp, {
        template: resolve(__dirname, '../lib/index.html'),
        filename: 'index.html'
    })
    plugins.extraTemplatedPaths(wp, {
        templates: {
            addon: (c, p) => {
                let addon = addons.find(a => a.exportName === c.chunkName);
                if ( !addon ) {
                    return false;
                }
                if ( !p.hasArg ) {
                    return addon.path;
                }
                if ( typeof addon[ p.arg ] === 'string' ) {
                    return addon[ p.arg ];
                }
                return false;
            }
        }
    });

    rules.expose(wp, 'inversify')
    rules.expose(wp, 'tapable')
    rules.expose(wp, { name: `lodash`, as: '_' })
    // rules.expose(wp, { name: 'vue', as: 'Vue' })
    rules.expose(wp, { name: 'reflect-metadata', as: 'reflect_metadata' });

    JsonPlugin.webpackJson.filePath = resolve(rootPath, process.env.WEBPACK_PATH);
    JsonPlugin.webpackJson.ensureRemoved();

    if ( wp.isDev ) {
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
    if ( wp.isServer ) {
        // wp.devtool('#source-map');

        wp.module.rules.delete('source-map-loader');
        wp.stats(false)
        helpers.devServer(wp)
        helpers.setServerLocation(
            wp,
            process.env.WEBPACK_PROTOCOL as any || 'http',
            process.env.WEBPACK_HOST || 'localhost',
            process.env.WEBPACK_PORT as any || 8179
        );

        wp.devServer
            .contentBase(join(rootPath, 'public/assets'))
            .overlay(true)
            .inline(true)

        wp.devServer.set('writeToDisk', true);
        wp.optimization.minimize(false)
    }

    for ( const addon of addons ) {
        let main = addon.entrypoints.env(wp.store.get('mode')).main();
        wp.entry(addon.exportName).add(main.path);
        wp.externals({
            ...wp.get('externals'),
            [ addon.name ]: [ namespace, addon.exportName ]
        });

        addon.entrypoints.env(wp.store.get('mode')).suffixed().forEach(entrypoint => {
            wp.entry(addon.exportName + entrypoint.suffix).add(entrypoint.path);
            wp.externals({
                ...wp.get('externals'),
                [ addon.name + entrypoint.suffix ]: [ namespace, addon.exportName + entrypoint.suffix ]
            });
        })

        // if ( addon.isSingle ) {
        //     wp.entry(addon.entryName).add(addon.entry.development);
        // } else {
        //     for ( const entry of addon.entrypoints ) {
        //         if ( 'env' in entry === false || entry.env === wp.store.get('mode') ) {
        //             wp.entry(addon.entryName + (entry.suffix || '')).add(entry.path)
        //         }
        //     }
        // }

        if ( addon.hasPyroConfig ) {
            addon.runPyroConfig(builder)
        }
    }

    if ( process.env.WEBPACK_ENABLED ) {

        wp.plugin('json').use(JsonPlugin, [ <JsonPlugin.Options>{
            filePath   : resolve(rootPath, process.env.WEBPACK_PATH),
            data       : {
                server   : wp.isServer,
                mode     : wp.store.get('mode'),
                output   : {},
                devServer: {}
            },
            transformer: (jsonData, _data) => {
                addons.reloadJSONData();
                let data       = _data.getData()
                let entryNames = Object.keys(data);
                entryNames.forEach(entryName => {
                    let addon     = addons.findByExportNames(entryName)
                    let entryData = data[ entryName ]
                    if ( addon ) {
                        addon.addEntry(entryName, entryData);
                        // addon.scripts.push(...entryData.scripts)
                        // addon.styles.push(...entryData.styles)
                    }
                })
                jsonData.output    = map2object(wp.output.store);
                jsonData.devServer = wp.isServer ? map2object(wp.devServer.store) : null
                jsonData.addons    = addons.sortByDependency().map((addon, index) => {
                    addon.sorted = index;
                    return addon.toObject();
                })
                return jsonData;
            },
            done       : (jsonData, _data, stats) => {

                let data       = _data.getData()
                let entryNames = Object.keys(data);
            }
        } ]);
    }

    return wp;
}
