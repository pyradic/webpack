<?php

namespace Pyro\Webpack;

use Illuminate\Support\Collection;


class WebpackAddonCollection extends Collection
{
    /** @var \Pyro\Webpack\WebpackAddon[] */
    protected $items = [];

    /**
     * @param $namespace
     *
     * @return \Pyro\Webpack\WebpackAddon
     */
    public function findByStreamNamespace($namespace)
    {
        foreach($this->items as $item){
            if($item->isStreamNamespace($namespace)){
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

    /**
     * @return static
     */
    public function streamAddons()
    {
        return $this->filter->isStreamAddon();
    }

    /** @return \Pyro\Webpack\WebpackAddon */
    public function findByComposerName($name)
    {
        return $this->firstWhere('composerName', $name);
    }

    public function toBase()
    {
        return new Collection($this->items);
    }
}
