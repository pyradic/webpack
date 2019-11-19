<?php namespace Pyro\Webpack;

use Barryvdh\Debugbar\LaravelDebugbar;
use Closure;
use Illuminate\Contracts\Config\Repository;
use Illuminate\Contracts\Container\Container;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class WebpackHotMiddleware
{
    /**
     * The App container
     *
     * @var Container
     */
    protected $container;

    /** @var \Illuminate\Contracts\Config\Repository */
    protected $config;

    /** @var \Pyro\Webpack\WebpackData */
    protected $webpack;

    /**
     * Create a new middleware instance.
     *
     * @param Container       $container
     * @param LaravelDebugbar $debugbar
     */
    public function __construct(Container $container, Repository $config, WebpackData $webpack)
    {
        $this->container = $container;
        $this->config    = $config;
        $this->webpack = $webpack;
    }

    /**
     * Modify the response and inject the debugbar (or data in headers)
     *
     * @param \Symfony\Component\HttpFoundation\Request  $request
     * @param \Symfony\Component\HttpFoundation\Response $response
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function modifyResponse(Response $response)
    {
        $content = $response->getContent();
        if (stristr($content, '<!--WEBPACK_HERE_PLEASE-->') === false) {
            return $response;
        }

        $renderedContent = '';
        foreach ($this->webpack->getAddons() as $addon) {
            foreach($addon->getEntries() as $entry) {

                foreach ($entry->getStyles() as $style) {
                    $renderedContent .= "\n<link rel='stylesheet' type='text/css' href='{$style}'></link>";
                }
                foreach ($entry->getScripts() as $script) {
                    $renderedContent .= "\n<script src='{$script}'></script>";
                }
            }
        }

        $pos = strripos($content, '<!--WEBPACK_HERE_PLEASE-->');
        if (false !== $pos) {
            $content = substr($content, 0, $pos) . $renderedContent . substr($content, $pos);
        } else {
            $content = $content . $renderedContent;
        }

        // Update the new content and reset the content length
        $response->setContent($content);
        $response->headers->remove('Content-Length');
        return $response;
    }

    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     *
     * @return mixed
     */
    public function handle($request, Closure $next)
    {

        $enabled = $this->config->get('webpack.enabled');

        if (
            $enabled !== true
            || $this->webpack->isServer() !== true
            || $this->webpack->getAddons()->isEmpty()
        ) {
            return $next($request);
        }
        if ($this->webpack->getAddons()->isEmpty()) {
            return $next($request);
        }

        $response = $next($request);
        $this->modifyResponse($response);
        return $response;
    }

    protected function getPath()
    {
        return base_path($this->config->get('webpack.path'));
    }

    protected function getBundles()
    {
        $path = $this->getPath();
        if (file_exists($path)) {
            return json_decode(file_get_contents($path), true);
        }
        return [];
    }
}
