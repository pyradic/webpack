<?php

namespace Pyro\Webpack;

class WebpackAddonEntry
{
    /** @var \Pyro\Webpack\WebpackAddon */
    protected $addon;

    /** @var string */
    protected $name;

    /** @var \Illuminate\Support\Collection */
    protected $data;

    public function __construct(WebpackAddon $addon, string $name, array $data)
    {
        $this->addon = $addon;
        $this->name  = $name;
        $this->data  = collect($data);
    }

    public function getName()
    {
        return $this->name;
    }

    public function isName($name)
    {
        return $this->name === $name;
    }

    public function isMain()
    {
        return $this->data->has('suffix') === false;
    }

    public function isSuffixed()
    {
        return $this->data->has('suffix') === true;
    }

    public function getSuffix()
    {
        return $this->data[ 'suffix' ];
    }

    public function isSuffix($suffix)
    {
        return $this->data[ 'suffix' ] === $suffix;
    }

    public function getProvider()
    {
        return $this->data[ 'provider' ];
    }

    public function hasProvider()
    {
        return $this->data->has('provider');
    }

    public function isProvider($provider)
    {
        return $this->data[ 'provider' ] === $provider;
    }

    public function getAssets($type, $prependPublicPath = true)
    {
        // $type = scripts | styles
        /** @var \Illuminate\Support\Collection $assets */
        $assets = $this->data->collect($type, []);
        if ($prependPublicPath) {
            $assets = $assets->map(function ($url) {
                return $this->getWebpack()->getPublicPath() . $url;
            });
        }
        return $assets;
    }

    public function getScripts($prependPublicPath = true)
    {
        return $this->getAssets('scripts', $prependPublicPath);
    }

    public function getStyles($prependPublicPath = true)
    {
        return $this->getAssets('styles', $prependPublicPath);
    }

    public function getWebpackAddon()
    {
        return $this->addon;
    }

    public function getWebpack()
    {
        return $this->addon->getWebpackData();
    }
}
