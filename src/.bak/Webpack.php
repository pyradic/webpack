<?php

namespace Pyro\Webpack;

use Illuminate\Support\Collection;
use InvalidArgumentException;

class Webpack
{
    /** @var \Pyro\Webpack\WebpackData */
    protected $data;

    /** @var \Illuminate\Support\Collection */
    protected $entriest;


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
    protected $outputPath;


    public function __construct(WebpackData $data)
    {
        $this->data    = $data;
        $this->entries = new Collection();
    }

    public function addWebpackEntry($name, $suffix = null)
    {
        $addon   = $this->findAddon($name);
        $entries = $addon->getEntries();
        $entry   = $suffix === null ? $entries->main() : $entries->suffix($suffix);
        $this->entries->put($entry->getName(), $entry);
        return $this;
    }

    public function findAddon($name)
    {
        if ($entry = $this->data->getAddons()->findByName($name)) {
            return $entry;
        }
        if ($entry = $this->data->getAddons()->findByComposerName($name)) {
            return $entry;
        }
        if ($entry = $this->data->getAddons()->findByStreamNamespace($name)) {
            return $entry;
        }
        throw new InvalidArgumentException("Could not find webpack addon with name '{$name}'");
    }

    public function getData()
    {
        return $this->data;
    }

    public function setData(WebpackData $data)
    {
        $this->data = $data;
        return $this;
    }

    public function getEntries()
    {
        return $this->entries;
    }

    public function setEntries(Collection $entries)
    {
        $this->entries = $entries;
        return $this;
    }

    public function getEntriest()
    {
        return $this->entriest;
    }

    public function setEntriest(\Illuminate\Support\Collection $entriest): Webpack
    {
        $this->entriest = $entriest;
        return $this;
    }

    public function isActive()
    {
        return $this->active;
    }

    public function setActive(bool $active): Webpack
    {
        $this->active = $active;
        return $this;
    }

    public function isEnabled()
    {
        return $this->enabled;
    }

    public function setEnabled(bool $enabled): Webpack
    {
        $this->enabled = $enabled;
        return $this;
    }

    public function getPath()
    {
        return $this->path;
    }

    public function setPath(string $path): Webpack
    {
        $this->path = $path;
        return $this;
    }

    public function getProtocol()
    {
        return $this->protocol;
    }

    public function setProtocol(string $protocol): Webpack
    {
        $this->protocol = $protocol;
        return $this;
    }

    public function getHost()
    {
        return $this->host;
    }

    public function setHost(string $host): Webpack
    {
        $this->host = $host;
        return $this;
    }

    public function getPort()
    {
        return $this->port;
    }

    public function setPort(string $port): Webpack
    {
        $this->port = $port;
        return $this;
    }

    public function getOutputPath()
    {
        return $this->outputPath;
    }

    public function setOutputPath(string $outputPath): Webpack
    {
        $this->outputPath = $outputPath;
        return $this;
    }


}
