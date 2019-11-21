<?php

namespace Pyro\Webpack;

use Illuminate\Support\Collection;

/**
 * @method \Pyro\Webpack\WebpackAddonEntry get($name)
 * @method \Pyro\Webpack\WebpackAddonEntry[] all()
 */
class WebpackAddonEntryCollection extends Collection
{
    /** @var WebpackAddonEntry[] */
    protected $items = [];

    /**
     * @return \Pyro\Webpack\WebpackAddonEntry
     */
    public function main()
    {
        foreach($this->items as $entry){
            if($entry->isMain()){
                return $entry;
            }
        }
    }

    /**
     * @return \Pyro\Webpack\WebpackAddonEntryCollection|\Pyro\Webpack\WebpackAddonEntry
     */
    public function suffixed()
    {
        return $this->filter(function(WebpackAddonEntry $entry){
            return $entry->isSuffixed();
        });
    }

    /**
     * @param $suffix
     *
     * @return \Pyro\Webpack\WebpackAddonEntry
     */
    public function suffix($suffix)
    {
        foreach($this->items as $entry){
            if($entry->isSuffix($suffix)){
                return $entry;
            }
        }
    }
}
