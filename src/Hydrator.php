<?php

namespace Pyro\Webpack;

interface Hydrator
{
    function extract($object): array;

    function hydrate(array $data, $object): void;
}
