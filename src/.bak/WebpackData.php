<?php

namespace Pyro\Webpack;

use Anomaly\Streams\Platform\Support\Hydrator;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Collection;
use InvalidArgumentException;
use Laradic\Support\Dot;

class WebpackData extends Dot
{
    public function getNamespace()
    {
        return $this[ 'output.library.0' ];
    }

    public function getPublicPath()
    {
        return $this[ 'output.publicPath' ];
    }

    /**
     * @return \Pyro\Webpack\WebpackAddonCollection|\Pyro\Webpack\WebpackAddon[]
     */
    public function getAddons()
    {
        return $this[ 'addons' ];
    }

    public function setAddons($addons)
    {
        $addons = Collection::unwrap($addons);
        $addons = WebpackAddonCollection::wrap($addons);
        $this->set('addons', $addons);
        return $this;
    }

    public function isServer()
    {
        return $this['server'] === true;
    }

    public function getMode()
    {
        return $this['mode'];
    }

    public function isMode($mode)
    {
        return $this['mode'] === $mode;
    }

    public function isDevelopment()
    {
        return $this->isMode('development');
    }

    public function isProduction()
    {
        return $this->isMode('production');
    }

}
