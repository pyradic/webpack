<?php

namespace Pyro\Webpack;

use Anomaly\Streams\Platform\Addon\AddonCollection;
use Anomaly\Streams\Platform\Addon\Event\AddonsHaveRegistered;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Support\ServiceProvider;
use Pyro\Webpack\Command\LoadWebpackData;

class WebpackServiceProvider extends ServiceProvider
{
    use DispatchesJobs;

    public function boot()
    {

        $this->publishes([
            dirname(__DIR__) . '/config/webpack.php' => $this->app->configPath('webpack.php')
        ]);
    }

    public function register()
    {
        $this->mergeConfigFrom(dirname(__DIR__) . '/config/webpack.php', 'webpack');
        $this->registerWebpack();
        $this->registerWebpackData();
        $this->loadWebpackStreamAddons();

        if ($this->app[ 'config' ][ 'webpack.enabled' ]) {
            $this->loadWebpackHotMiddleware();
        }
    }

    protected function loadWebpackHotMiddleware()
    {
        /** @var \Illuminate\Foundation\Http\Kernel $kernel */
        $kernel = $this->app->make(Kernel::class);
        $kernel->prependMiddleware(WebpackHotMiddleware::class);
        $this->app[ 'config' ][ 'webpack.active' ] = true;
    }

    protected function registerWebpack()
    {
        $this->app->singleton('webpack', function ($app) {
            return new Webpack($app['webpack.data']);
        });
        $this->app->alias('webpack', Webpack::class);
    }

    protected function registerWebpackData()
    {
        $this->app->singleton('webpack.data', function ($app) {
            $webpackData = new WebpackData();
            $data    = $this->dispatchNow(new LoadWebpackData($webpackData));
            $webpackData->merge($data);
            return $webpackData;
        });
        $this->app->alias('webpack.data', WebpackData::class);
    }

    protected function loadWebpackStreamAddons()
    {

        $this->app->events->listen(AddonsHaveRegistered::class, function (AddonsHaveRegistered $event) {
            /** @var AddonCollection|\Anomaly\Streams\Platform\Addon\Addon[] $addons */
            $addons  = $event->getAddons()->enabled();
            $modules = $this->app->webpack->getAddons();
            foreach ($addons as $addon) {
                $composerName = $addon->getComposerJson()[ 'name' ];
                if ($module = $modules->findByComposerName($composerName)) {
                    $module->setStreamAddon($addon);
                }
            }
        });
    }
}
