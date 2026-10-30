<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Spatie\CpuLoadHealthCheck\CpuLoadCheck;
use Spatie\Health\Checks\Checks\CacheCheck;
use Spatie\Health\Checks\Checks\DatabaseCheck;
use Spatie\Health\Checks\Checks\DebugModeCheck;
use Spatie\Health\Checks\Checks\EnvironmentCheck;
use Spatie\Health\Checks\Checks\OptimizedAppCheck;
use Spatie\Health\Checks\Checks\RedisCheck;
use Spatie\Health\Checks\Checks\ScheduleCheck;
use Spatie\Health\Checks\Checks\UsedDiskSpaceCheck;
use Spatie\Health\Facades\Health;
use Spatie\SecurityAdvisoriesHealthCheck\SecurityAdvisoriesCheck;
use VictoRD11\SslCertificationHealthCheck\SslCertificationExpiredCheck;
use VictoRD11\SslCertificationHealthCheck\SslCertificationValidCheck;

class HealthServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        Health::checks([
            EnvironmentCheck::new(),
            DebugModeCheck::new(),
            CpuLoadCheck::new()
                ->failWhenLoadIsHigherInTheLast5Minutes(15)
                ->failWhenLoadIsHigherInTheLast15Minutes(15),
            UsedDiskSpaceCheck::new()
                ->warnWhenUsedSpaceIsAbovePercentage(90)
                ->failWhenUsedSpaceIsAbovePercentage(95),
            DatabaseCheck::new(),
            // The heartbeat runs every minute and the checks every five, so a heartbeat older
            // than one check interval means the scheduler stopped.
            ScheduleCheck::new()->heartbeatMaxAgeInMinutes(5),
            CacheCheck::new(),
            RedisCheck::new(),
            OptimizedAppCheck::new()
                ->checkConfig()
                ->checkRoutes(),
            SecurityAdvisoriesCheck::new(),
            SslCertificationExpiredCheck::new()->url(config('app.url'))
                ->warnWhenSslCertificationExpiringDay(15)
                ->failWhenSslCertificationExpiringDay(10),
            SslCertificationValidCheck::new()->url(config('app.url')),
        ]);
    }
}
