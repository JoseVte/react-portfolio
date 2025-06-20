<?php

use Inertia\Testing\AssertableInertia;

it('homepage returns a successful response', function () {
    $response = $this->get(route('homepage'));

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page->component('homepage'));
});

it('about page returns a successful response', function () {
    $response = $this->get(route('about'));

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page->component('about'));
});

it('projects page returns a successful response', function () {
    $response = $this->get(route('projects'));

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page->component('projects'));
});

it('admin page returns a successful response if ip is allowed', function () {
    config(['app.allowed-ips' => '127.0.0.1']);
    $response = $this->get(route('admin'));

    $response->assertStatus(200);
    $response->assertInertia(fn (AssertableInertia $page) => $page->component('admin'));
});

it('admin page returns a unauthorized response if ip is not allowed', function () {
    config(['app.allowed-ips' => '127.0.0.2']);
    $response = $this->get(route('admin'));

    $response->assertStatus(401);
});
