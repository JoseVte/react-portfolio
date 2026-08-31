<?php

it('lets an exactly matching ip through', function () {
    config(['app.allowed-ips' => '127.0.0.1']);

    $this->get(route('admin'))->assertOk();
});

it('lets an ip inside an allowed cidr range through', function () {
    config(['app.allowed-ips' => '127.0.0.0/24']);

    $this->get(route('admin'))->assertOk();
});

it('accepts a list with surrounding whitespace', function () {
    config(['app.allowed-ips' => ' 10.0.0.1 , 127.0.0.1 ']);

    $this->get(route('admin'))->assertOk();
});

it('blocks an ip that is not on the list', function () {
    config(['app.allowed-ips' => '10.0.0.1']);

    $this->get(route('admin'))->assertUnauthorized();
});

it('blocks everything when no ip is configured', function () {
    config(['app.allowed-ips' => null]);

    $this->get(route('admin'))->assertUnauthorized();
});

it('blocks everything when the configured list is empty', function () {
    config(['app.allowed-ips' => ' , ']);

    $this->get(route('admin'))->assertUnauthorized();
});
