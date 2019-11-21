<?php

namespace Pyro\Webpack;

use Anomaly\Streams\Platform\Addon\Addon;
use Laradic\Support\Dot;

class WebpackAddon extends Dot
{
    protected $entries;

    /** @var string */
    protected $streamNamespace;

    /** @var \Anomaly\Streams\Platform\Addon\Addon */
    protected $streamAddon;

    /** @var \Laradic\Support\Dot */
    protected $data;

    /** @var \Pyro\Webpack\WebpackData */
    protected $webpackData;

    /**
     * WebpackAddon constructor.
     *
     * @param \Pyro\Webpack\WebpackData $webpack
     */
    public function __construct(WebpackData $webpack)
    {
        parent::__construct();
        $this->webpackData = $webpack;
    }

    public function setData(array $data)
    {
        $this->merge($data);

        if ($this->isStreamAddon()) {
            $this->setStreamNamespace($this->makeAddonNamespace($this->data[ 'path' ]));
        }
        $entries = new WebpackAddonEntryCollection();
        foreach ($this->get('entries', []) as $name => $entry) {
            $entries->put($name, new WebpackAddonEntry($this, $name, $entry));
        }
        $this['entries'] = $entries;
        return $this;
    }

    /**
     * @return \Pyro\Webpack\WebpackAddonEntryCollection|\Pyro\Webpack\WebpackAddonEntry[]
     */
    public function getEntries()
    {
        return $this['entries'];
    }

    public function getComposerName()
    {
        return $this[ 'composer.name' ];
    }

    public function getComposerType()
    {
        return $this[ 'composer.type' ];
    }

    public function isComposerType($composerType)
    {
        return $this->getComposerType() === $composerType;
    }

    public function isStreamAddon()
    {
        return $this->isComposerType('stream-addon');
    }

    public function getName()
    {
        return $this[ 'name' ];
    }

    public function getFirstName()
    {
        return $this[ 'firstName' ];
    }

    public function getFirstNameSnake()
    {
        return $this[ 'firstNameSnake' ];
    }

    public function getLastName()
    {
        return $this[ 'lastName' ];
    }

    public function getLastNameSnake()
    {
        return $this[ 'lastNameSnake' ];
    }

    public function getExportName()
    {
        return $this[ 'exportName' ];
    }

    public function getSorted()
    {
        return $this[ 'sorted' ];
    }

    public function getPath()
    {
        return base_path($this[ 'path' ]);
    }

    public function getStreamNamespace()
    {
        return $this->streamNamespace;
    }

    public function setStreamNamespace(?string $streamNamespace)
    {
        $this->streamNamespace = $streamNamespace;
        return $this;
    }

    public function isStreamNamespace($streamNamespace)
    {
        return $this->streamNamespace === $streamNamespace;
    }

    public function getStreamAddon()
    {
        return $this->streamAddon;
    }

    public function setStreamAddon(Addon $streamAddon)
    {
        $this->streamAddon = $streamAddon;
        return $this;
    }

    public function getWebpackData()
    {
        return $this->webpackData;
    }

    public function setWebpackData(WebpackData $webpack)
    {
        $this->webpackData = $webpack;
        return $this;
    }

    public function toArray()
    {
        return collect($this->arrayableProperties)->mapWithKeys(function ($property) {
            return [ $property => $this->{$property} ];
        })->toArray();
    }

    protected function makeAddonNamespace($path)
    {
        $vendor = strtolower(basename(dirname($path)));
        $slug   = strtolower(substr(basename($path), 0, strpos(basename($path), '-')));
        $type   = strtolower(substr(basename($path), strpos(basename($path), '-') + 1));

        return "{$vendor}.{$type}.{$slug}";
    }

    public function hasStreamAddon()
    {
        return $this->streamAddon instanceof Addon;
    }

}
