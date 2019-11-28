<?php

namespace Pyro\Webpack\Package;


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

    public function sorted()
    {
        return $this->sortBy->getSorted();
    }
}
