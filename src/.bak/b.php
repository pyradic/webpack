<?php /** @noinspection RepetitiveMethodCallsInspection */

/** @noinspection PhpFullyQualifiedNameUsageInspection */

namespace Pyro\Webpack {

    use GeneratedHydrator\Configuration;
    use Illuminate\Contracts\Foundation\Application;
    use Laradic\Support\Dot;
    use Pyro\Webpack\Package\Entry;
    use Pyro\Webpack\Package\EntryCollection;
    use Pyro\Webpack\Package\Package;
    use Pyro\Webpack\Package\PackageCollection;

    function makeAddonNamespace($path)
    {
        $vendor = strtolower(basename(dirname($path)));
        $slug   = strtolower(substr(basename($path), 0, strpos(basename($path), '-')));
        $type   = strtolower(substr(basename($path), strpos(basename($path), '-') + 1));

        return "{$vendor}.{$type}.{$slug}";
    }

    class WebpackData extends Dot
    {
        public function __construct($items = [])
        {
            parent::__construct($items);

            $this->map('addons', function ($addon) {
                return Dot::wrap($addon)
                    ->map('entries', function ($entry) {
                        return Dot::wrap($entry)
                            ->set('scripts', collect($entry[ 'scripts' ]))
                            ->set('styles', collect($entry[ 'styles' ]));
                    })
                    ->copy([
                        'composer.name' => 'composerName',
                        'composer.type' => 'composerType',
                    ]);
            });
        }

    }

    interface Hydrator
    {
        function extract($object): array;

        function hydrate(array $data, $object): void;
    }

    class WebpackFactory
    {
        /** @var Hydrator[] */
        protected $hydrators;

        /** @var array|\Pyro\Webpack\WebpackData = \Pyro\Webpack\WebpackDataExample::data() */
        private $data;

        /** @var \Illuminate\Contracts\Foundation\Application */
        private $app;

        /** @var \Pyro\Webpack\Webpack */
        private $webpack;

        /** @var PackageCollection */
        private $packages;

        public function __construct(Application $app)
        {
            $this->app                    = $app;
            $this->hydrators              = [];
            $this->hydrators[ 'webpack' ] = $this->createHydrator(Webpack::class);
            $this->hydrators[ 'package' ] = $this->createHydrator(Package::class);
            $this->hydrators[ 'entry' ]   = $this->createHydrator(Entry::class);
        }

        protected function createHydrator($class)
        {
            $configuration = new Configuration($class);
            $hydratorClass = $configuration->createFactory()->getHydratorClass();
            $hydrator      = new $hydratorClass;
            return $hydrator;
        }

        public static function make(?Application $app = null)
        {
            return new static($app ?: app());
        }

        public function build(string $path = null)
        {
            $this->buildData($path);
            $this->buildWebpack();
            $this->buildPackages();

            return $this->webpack;
        }

        protected function buildData(string $path = null)
        {
            $path = $path ?: $this->app->config->get('webpack.path', 'storage/webpack.json');
            $path = path_is_relative($path) ? base_path($path) : $path;
            $json = file_get_contents($path);
            $data = json_decode($json, true);

            $this->data = new WebpackData($data);
        }

        protected function buildWebpack()
        {
            $this->webpack = new Webpack($this->data);
            $this->webpack->setPackages($this->packages = new PackageCollection);

            $this->hydrators[ 'webpack' ]->hydrate(
                $this->app->config->get('webpack', []),
                $this->webpack
            );
        }

        protected function buildPackages()
        {
            foreach ($this->data[ 'addons' ] as $addon) {
                $package = $this->buildPackage($addon);
                foreach ($addon[ 'entries' ] as $name => $data) {
                    $data[ 'name' ] = $name;
                    $package->getEntries()->add(
                        $this->buildEntry($package, $data)
                    );
                }
                $this->packages->add($package);
            }
        }

        /**
         * @param array|Dot $data = \Pyro\Webpack\WebpackDataExample::addonDot()
         *
         * @return \Pyro\Webpack\Package\Package
         */
        protected function buildPackage($data)
        {

            $package = new Package($this->webpack);
            $this->hydrators[ 'package' ]->hydrate(
                $data->collect()->except([ 'entries' ])->toArray(),
                $package
            );
            $package->setEntries(new EntryCollection);
            return $package;
        }

        /**
         * @param string    $name
         * @param array|Dot $data = \Pyro\Webpack\WebpackDataExample::entry()
         *
         * @return \Pyro\Webpack\Package\Entry
         */
        protected function buildEntry(Package $package, $data)
        {
            $entry = new Entry($package);
            $this->hydrators[ 'entry' ]->hydrate(
                $data->toArray(),
                $entry
            );
            return $entry;
        }

        /**
         * @param \Pyro\Webpack\WebpackData|array $addon = \Pyro\Webpack\WebpackDataExample::addonDot()
         */
        protected function buildAddon($addon)
        {

        }
    }

    class Webpack
    {
        //@formatter:off
        /** @var bool */
        protected $active;
        /** @var bool */
        protected $enabled;
        /** @var string */
        protected $path;
        /** @var string */
        protected $protocol;
        /** @var string */
        protected $host;
        /** @var string */
        protected $port;
        /** @var string */
        protected $namespace;
        /** @var string */
        protected $outputPath;
        //@formatter:on

        /** @var array|\Pyro\Webpack\WebpackData = \Pyro\Webpack\WebpackDataExample::data() */
        protected $data;

        /** @var \Pyro\Webpack\Package\Package[]|\Pyro\Webpack\Package\PackageCollection */
        protected $packages;

        /**
         * @param \Pyro\Webpack\WebpackData|array $data = \Pyro\Webpack\WebpackDataExample::data()
         */
        public function __construct(WebpackData $data)
        {
            $this->data = $data;
        }

        public function getPackages()
        {
            return $this->packages;
        }

        public function setPackages($packages)
        {
            $this->packages = $packages;
            return $this;
        }

        public function isActive()
        {
            return $this->active;
        }

        public function isEnabled()
        {
            return $this->enabled;
        }

        public function getPath()
        {
            return $this->path;
        }

        public function getProtocol()
        {
            return $this->protocol;
        }

        public function getHost()
        {
            return $this->host;
        }

        public function getPort()
        {
            return $this->port;
        }

        public function getNamespace()
        {
            return $this->namespace;
        }

        public function getOutputPath()
        {
            return $this->outputPath;
        }

        // generated

    }
}

namespace Pyro\Webpack\Package {

    use Anomaly\Streams\Platform\Addon\Addon;
    use Illuminate\Support\Str;
    use Laradic\Support\Traits\ArrayAccessibleProperties;

    class Package implements \ArrayAccess
    {
        use ArrayAccessibleProperties;

        //@formatter:off
        /** @var \Pyro\Webpack\Webpack */
        protected $webpack;
        /** @var \Pyro\Webpack\Package\EntryCollection|\Pyro\Webpack\Package\Entry[] */
        protected $entries;
        /** @var \Anomaly\Streams\Platform\Addon\Addon */
        protected $addon;

        /** @var string */
        protected $name;
        /** @var string */
        protected $firstName;
        /** @var string */
        protected $firstNameSnake;
        /** @var string */
        protected $lastName;
        /** @var string */
        protected $lastNameSnake;
        /** @var string */
        protected $exportName;
        /** @var string */
        protected $path;
        /** @var string */
        protected $srcPath;
        /** @var string */
        protected $sorted;

        /** @var string */
        protected $composerName;
        /** @var string */
        protected $composerType;
        //@formatter:on

        /**
         * Package constructor.
         *
         * @param \Pyro\Webpack\Webpack           $webpack
         * @param array|\Laradic\Support\Dot $data
         */
        public function __construct(\Pyro\Webpack\Webpack $webpack)
        {
            $this->webpack = $webpack;
        }

        public function getEntries()
        {
            return $this->entries;
        }

        public function setEntries($entries)
        {
            $this->entries = $entries;
            return $this;
        }

        public function getMainEntry()
        {

        }

        public function hasAddon()
        {
            return $this->addon instanceof Addon;
        }

        public function getAddon()
        {
            return $this->addon;
        }

        public function setAddon($addon)
        {
            $this->addon = $addon;
            return $this;
        }

        public function isComposerStreamAddon()
        {
            return $this->composerType === 'stream-addon';
        }

        // generated

        public function getWebpack()
        {
            return $this->webpack;
        }

        public function getName()
        {
            return $this->name;
        }

        public function getExportName()
        {
            return $this->exportName;
        }

        public function getPath()
        {
            return base_path($this->path);
        }

        public function getSorted()
        {
            return $this->sorted;
        }

        public function getComposerName()
        {
            return $this->composerName;
        }

        public function getComposerType()
        {
            return $this->composerType;
        }



//        public function getFirstName()
//        {
//            return $this->firstName;
//        }
//
//        public function getFirstNameSnake()
//        {
//            return $this->firstNameSnake;
//        }
//
//        public function getLastName()
//        {
//            return $this->lastName;
//        }
//
//        public function getLastNameSnake()
//        {
//            return $this->lastNameSnake;
//        }
    }

    class PackageCollection extends \Illuminate\Support\Collection
    {
        /** @var Package[] */
        protected $items = [];

        /**
         * @param \Pyro\Webpack\Package\Package $package
         *
         * @return $this|\Illuminate\Support\Collection
         */
        public function add($package)
        {
            $this->items[ $package->getName() ] = $package;
            return $this;
        }

        /**
         * @param $namespace
         *
         * @return Package
         */
        public function findByStreamNamespace($namespace)
        {
            foreach ($this->items as $item) {
                if ($item->hasAddon() && $item->getAddon()->getNamespace() === $namespace) {
                    return $item;
                }
            }
            return null;
        }

        /**
         * @param $name
         *
         * @return \Pyro\Webpack\WebpackAddon
         */
        public function findByName($name)
        {
            return $this->firstWhere('name', $name);
        }

        public function hasAddon()
        {
            /** @noinspection PhpUndefinedMethodInspection */
            return $this->filter->hasAddon();
        }

        /** @return \Pyro\Webpack\Package\Package|null */
        public function findByComposerName($name)
        {
            if ($name) {
                foreach ($this->items as $item) {
                    if ($item->getComposerName() === $name) {
                        return $item;
                    }
                }
            }
            return null;
        }

        public function toBase()
        {
            return new \Illuminate\Support\Collection($this->items);
        }

    }

    class Entry
    {
        /** @var Package */
        protected $package;

        /** @var string */
        protected $name;

        /** @var string|null */
        protected $suffix;

        /** @var string */
        protected $path;

        /** @var string */
        protected $provider;

        /** @var \Illuminate\Support\Collection|string[]|array */
        protected $scripts;

        /** @var \Illuminate\Support\Collection|string[]|array */
        protected $styles;

        public function __construct(Package $package)
        {
            $this->package = $package;
        }

        public function isMain()
        {
            return $this->package->getExportName() === $this->name;
        }

        public function isSuffixed()
        {
            return $this->suffix !== null;
        }

        public function matchSuffix($suffix)
        {
            if ($suffix === null) {
                return $this->suffix === null;
            }
            return Str::is($suffix, $this->suffix);
        }

        public function hasScripts()
        {
            return $this->scripts->isNotEmpty();
        }

        public function hasStyles()
        {
            return $this->styles->isNotEmpty();
        }

        // generated

        public function getPackage()
        {
            return $this->package;
        }

        public function getName()
        {
            return $this->name;
        }

        public function getSuffix()
        {
            return $this->suffix;
        }

        public function getPath()
        {
            return $this->path;
        }

        public function getProvider()
        {
            return $this->provider;
        }

        public function getScripts()
        {
            return $this->scripts;
        }

        public function getStyles()
        {
            return $this->styles;
        }

    }

    class EntryCollection extends \Illuminate\Support\Collection
    {
        /** @var Entry[] */
        protected $items = [];

        /**
         * @param \Pyro\Webpack\Package\Entry $entry
         *
         * @return $this
         */
        public function add($entry)
        {
            $this->items[ $entry->getName() ] = $entry;
            return $this;
        }

        /**
         * @return Entry
         */
        public function main()
        {
            foreach ($this->items as $entry) {
                if ($entry->isMain()) {
                    return $entry;
                }
            }
        }

        public function suffixed()
        {
            return $this->filter(function (Entry $entry) {
                return $entry->isSuffixed();
            });
        }

        public function suffix($suffix)
        {
            foreach ($this->items as $entry) {
                if ($entry->matchSuffix($suffix)) {
                    return $entry;
                }
            }
        }

    }
}

namespace Pyro\Webpack {

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
}

