<?php

namespace Pyro\Webpack;

use Anomaly\Streams\Platform\Addon\Event\AddonsHaveRegistered;
use Anomaly\Streams\Platform\View\Event\TemplateDataIsLoading;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Support\ServiceProvider;
use Pyro\Webpack\Command\ResolvePackageAddons;

class WebpackServiceProvider extends ServiceProvider
{
    use DispatchesJobs;

    public function register()
    {
        $this->mergeConfigFrom(dirname(__DIR__) . '/config/webpack.php', 'webpack');
        $this->registerWebpack();
        $this->loadWebpackHotMiddleware();
    }

    protected function registerWebpack()
    {
        $this->app->singleton('webpack', function (Application $app) {
            $factory = WebpackFactory::make($app);
            $webpack = $factory->build($app[ 'config' ][ 'webpack.path' ]);
            return $webpack;
        });
        $this->app->alias('webpack', Webpack::class);

        $this->app->events->listen(AddonsHaveRegistered::class, function (AddonsHaveRegistered $event) {
            $event->getAddons();
            $this->dispatchNow(new ResolvePackageAddons());
        });

        $this->app->events->listen(TemplateDataIsLoading::class, function (TemplateDataIsLoading $event) {
            $event->getTemplate()->set('weback', $this->app->webpack);
            $this->app->view->share('weback', $this->app->webpack);
        });
    }

    protected function loadWebpackHotMiddleware()
    {
        /** @var \Illuminate\Foundation\Http\Kernel $kernel */
        $kernel = $this->app->make(Kernel::class);
        $kernel->prependMiddleware(WebpackHotMiddleware::class);
        $this->app[ 'config' ][ 'webpack.active' ] = true;
    }

    public function boot()
    {
        $this->publishes([ dirname(__DIR__) . '/config/webpack.php' => config_path('webpack.php') ]);
    }
}
