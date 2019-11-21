<?php

namespace Pyro\Webpack;

class WebpackDataExample
{
    public static function data(int $i = null, int $ii = null)
    {
        return [
            'server'    => true,
            'mode'      => 'development',
            'output'    =>
                [
                    'path'                                  => '/home/radic/projects/pyro/public/assets',
                    'filename'                              => 'js/[name].js',
                    'chunkFilename'                         => 'js/[name].chunk.[id].js',
                    'publicPath'                            => 'http://pyro.local:8079/',
                    'libraryTarget'                         => 'window',
                    'library'                               =>
                        [
                            0 => 'pyro',
                            1 => '[addon:exportName]',
                        ],
                    'devtoolFallbackModuleFilenameTemplate' => 'webpack:///[resource-path]?[hash]',
                ],
            'devServer' =>
                [
                    'headers'            =>
                        [
                            'Access-Control-Allow-Origin' => '*',
                        ],
                    'contentBase'        => '/home/radic/projects/pyro/public/assets',
                    'historyApiFallback' => true,
                    'noInfo'             => false,
                    'compress'           => true,
                    'quiet'              => false,
                    'host'               => 'pyro.local',
                    'port'               => '8079',
                    'disableHostCheck'   => true,
                    'stats'              => 'none',
                    'https'              => false,
                    'overlay'            => true,
                    'inline'             => true,
                    'writeToDisk'        => true,
                ],
            'addons'    => [ $i => static::addonDot(), $ii => new Dot(static::addonDot()) ],
        ];
    }

    public static function entry()
    {
        return [
            'suffix'   => '_foo',
            'path'     => '/home/radic/projects/pyro/packages/pyro/platform/lib/index.ts',
            'provider' => 'PlatformServiceProvider',
            'scripts'  => [ 'js/pyro__platform.js' ],
            'styles'   => [],
            'env'      => '',
        ];
    }

    public static function addonDot(int $i = null)
    {
        $entrypoints = [ $i => [ 'path' => 'index.ts', 'provider' => 'PlatformServiceProvider', 'env' => '' ] ];
        return [
            'name'                                    => '@pyro/platform',
            'firstName'                               => '@pyro',
            'firstNameSnake'                          => 'pyro',
            'lastName'                                => 'platform',
            'lastNameSnake'                           => 'platform',
            'exportName'                              => 'pyro__platform',
            'srcPath'                                 => '/home/radic/projects/pyro/packages/pyro/platform/lib',
            'pkg'                                     => [
                'name'             => '@pyro/platform',
                'version'          => '1.0.0',
                'main'             => 'lib/index.ts',
                'types'            => 'lib/index.ts',
                'typings'          => 'lib/index.ts',
                'private'          => true,
                'scripts'          => [],
                'pyro.srcPath'     => 'lib',
                'pyro.entrypoints' => $entrypoints,
                'dependencies'     => [],
                'devDependencies'  => [],
            ],
            'pkg.name'                                => '@pyro/platform',
            'pkg.version'                             => '1.0.0',
            'pkg.main'                                => 'lib/index.ts',
            'pkg.types'                               => 'lib/index.ts',
            'pkg.typings'                             => 'lib/index.ts',
            'pkg.private'                             => true,
            'pkg.scripts'                             => [],
            'pkg.pyro.srcPath'                        => 'lib',
            'pkg.pyro.entrypoints'                    => $entrypoints,
            'pkg.dependencies'                        => [],
            'pkg.devDependencies'                     => [],
            'pkgPath'                                 => 'packages/pyro/platform/package.json',
            'composerPath'                            => 'packages/pyro/platform/composer.json',
            'pyroConfigPath'                          => 'packages/pyro/platform/pyro.config.ts',
            'path'                                    => 'packages/pyro/platform',
            'sorted'                                  => 0,
            'composer'                                => [
                'name'                           => 'pyro/platform',
                'require'                        => [],
                'autoload.files'                 => [],
                'autoload.psr-4'                 => [],
                'autoload.exclude-from-classmap' => [],
                'extra.branch-alias.dev-master'  => '1.1.x-dev',
            ],
            'composer.name'                           => 'pyro/platform',
            'composer.require'                        => [],
            'composer.autoload.files'                 => [],
            'composer.autoload.psr-4'                 => [],
            'composer.autoload.exclude-from-classmap' => [],
            'composer.extra.branch-alias.dev-master'  => '1.1.x-dev',
            'entries'                                 => [
                $i => static::entry(),
            ],

        ];
    }
}
