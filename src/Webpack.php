<?php

namespace Pyro\Webpack;

use Collective\Html\HtmlBuilder;
use InvalidArgumentException;
use Pyro\Webpack\Package\EntryCollection;

class Webpack
{
    //@formatter:off
    /** @var bool */
//    protected $active;
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

    /** @var \Pyro\Webpack\Package\EntryCollection|\Pyro\Webpack\Package\Entry[] */
    protected $enabledEntries;

    /** @var \Collective\Html\HtmlBuilder */
    private $html;

    public function __construct(WebpackData $data, HtmlBuilder $html)
    {
        $this->data           = $data;
        $this->enabledEntries = new EntryCollection();
        $this->html           = $html;
    }

    public function isServer()
    {
        return $this->data[ 'server' ];
    }

    public function getMode()
    {
        return $this->data[ 'mode' ];
    }

    public function isMode($name)
    {
        return $this->data[ 'mode' ] === $name;
    }

    public function getPublicPath(...$parts)
    {
        return path_join($this->data[ 'output.publicPath' ], ...$parts);
    }

    public function findPackage($name)
    {
        if ($entry = $this->getPackages()->findByName($name)) {
            return $entry;
        }
        if ($entry = $this->getPackages()->findByComposerName($name)) {
            return $entry;
        }
        if ($entry = $this->getPackages()->findByStreamNamespace($name)) {
            return $entry;
        }
        throw new InvalidArgumentException("Could not find webpack addon with name '{$name}'");
    }

    public function enableEntry($name, $suffix = null)
    {
        $package = $this->findPackage($name);
        $entries = $package->getEntries();
        $entry   = $suffix === null ? $entries->main() : $entries->suffix($suffix);
        $this->enabledEntries->add($entry);
        return $this;
    }

    public function getEnabledEntries()
    {
        return $this->enabledEntries;
    }

    public function renderScripts()
    {
        $scripts = $this->enabledEntries->map->getScripts()->flatten()->map(function ($script) {
            return $this->html->script($this->getPublicPath($script) );
        })->cast('string')->implode(PHP_EOL);
        return $scripts;
    }

    public function renderStyles()
    {
        $scripts = $this->enabledEntries->map->getStyles()->flatten()->map(function ($style) {
            return $this->html->style($this->getPublicPath($style) );
        })->cast('string')->implode(PHP_EOL);
        return $scripts;
    }

    // generated

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
        return $this->enabled && $this->isServer();
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

}
