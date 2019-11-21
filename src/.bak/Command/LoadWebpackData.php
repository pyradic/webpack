<?php

namespace Pyro\Webpack\Command;

use Anomaly\Streams\Platform\Support\Hydrator;
use Illuminate\Contracts\Config\Repository;
use Illuminate\Filesystem\Filesystem;
use Laradic\Support\Wrap;
use Pyro\Webpack\WebpackData;
use Pyro\Webpack\WebpackAddon;
use Pyro\Webpack\WebpackAddonCollection;

class LoadWebpackData
{
    /** @var \Pyro\Webpack\WebpackData */
    protected $webpack;

    public function __construct(WebpackData $webpack)
    {
        $this->webpack = $webpack;
    }

    public function handle(Repository $config, Filesystem $fs)
    {
        $path = $config['platform.webpack.path'];
        $path = path_is_relative($path) ? base_path($path) : $path;
        $json = $fs->get($path);
        $data = json_decode($json, true);

        $hydrator = new Hydrator();
        $addons   = new WebpackAddonCollection();
        foreach (data_get($data, 'addons', []) as $addonData) {
            $addons->push($addon = new WebpackAddon($this->webpack));
            $addon->setData($addonData);
        }
        data_set($data, 'addons', $addons);

        return $data;
    }
}
