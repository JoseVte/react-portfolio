<?php

use Illuminate\Console\Application;
use Illuminate\Console\Scheduling\Event;
use Illuminate\Console\Scheduling\Schedule;
use Spatie\CpuLoadHealthCheck\CpuLoadCheck;
use Spatie\Health\Checks\Check;
use Spatie\Health\Checks\Checks\CacheCheck;
use Spatie\Health\Checks\Checks\DatabaseCheck;
use Spatie\Health\Checks\Checks\DebugModeCheck;
use Spatie\Health\Checks\Checks\EnvironmentCheck;
use Spatie\Health\Checks\Checks\OptimizedAppCheck;
use Spatie\Health\Checks\Checks\RedisCheck;
use Spatie\Health\Checks\Checks\ScheduleCheck;
use Spatie\Health\Checks\Checks\UsedDiskSpaceCheck;
use Spatie\Health\Enums\Status;
use Spatie\Health\Facades\Health;
use Spatie\SecurityAdvisoriesHealthCheck\SecurityAdvisoriesCheck;
use VictoRD11\SslCertificationHealthCheck\SslCertificationExpiredCheck;
use VictoRD11\SslCertificationHealthCheck\SslCertificationValidCheck;

it('shows the health results to an allowed ip', function () {
    allowLocalIp();

    $this->get(route('admin.health'))
        ->assertOk()
        ->assertViewIs('health::list');
});

it('hides the health results from an ip that is not allowed', function () {
    config(['app.allowed-ips' => '10.0.0.1']);

    $this->get(route('admin.health'))->assertUnauthorized();
});

it('hides the health results when no ip is configured', function () {
    config(['app.allowed-ips' => null]);

    $this->get(route('admin.health'))->assertUnauthorized();
});

it('registers the expected checks', function () {
    $registered = collect(Health::registeredChecks())
        ->map(fn (Check $check): string => $check::class)
        ->all();

    expect($registered)->toEqualCanonicalizing([
        EnvironmentCheck::class,
        DebugModeCheck::class,
        CpuLoadCheck::class,
        UsedDiskSpaceCheck::class,
        DatabaseCheck::class,
        ScheduleCheck::class,
        CacheCheck::class,
        RedisCheck::class,
        OptimizedAppCheck::class,
        SecurityAdvisoriesCheck::class,
        SslCertificationExpiredCheck::class,
        SslCertificationValidCheck::class,
    ]);
});

it('schedules the heartbeat every minute and the checks every five minutes', function () {
    $expressions = collect(app(Schedule::class)->events())
        ->mapWithKeys(fn (Event $event): array => [$event->command => $event->expression]);

    $command = fn (string $name): string => Application::formatCommandString($name);

    expect($expressions->get($command('health:schedule-check-heartbeat')))->toBe('* * * * *')
        ->and($expressions->get($command('health:check')))->toBe('*/5 * * * *');
});

it('tolerates a heartbeat as old as one check interval', function () {
    $scheduleCheck = collect(Health::registeredChecks())
        ->first(fn (Check $check): bool => $check instanceof ScheduleCheck);

    cache()->put($scheduleCheck->getCacheKey(), now()->subMinutes(4)->timestamp);

    expect($scheduleCheck->run()->status)->toEqual(Status::ok());

    cache()->put($scheduleCheck->getCacheKey(), now()->subMinutes(6)->timestamp);

    expect($scheduleCheck->run()->status)->toEqual(Status::failed());
});
