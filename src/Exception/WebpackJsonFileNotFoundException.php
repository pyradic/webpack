<?php

namespace Pyro\Webpack\Exception;

class WebpackJsonFileNotFoundException extends \UnexpectedValueException
{
    public function __construct($path)
    {
        parent::__construct("Could not find the webpack.json file. You should run [yarn build:dev], [yarn build:prod] or [yarn serve] first. \n\nChecked path: {$path} ", 0, null);
    }

}
