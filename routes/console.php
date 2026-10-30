<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Spatie\Health\Commands\RunHealthChecksCommand;
use Spatie\Health\Commands\ScheduleCheckHeartbeatCommand;
use Spatie\Health\Models\HealthCheckResultHistoryItem;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command(ScheduleCheckHeartbeatCommand::class)->everyMinute();

Schedule::command(RunHealthChecksCommand::class)->everyFiveMinutes();

// `keep_history_for_days` in config/health.php only takes effect when the history gets pruned.
Schedule::command('model:prune', ['--model' => [HealthCheckResultHistoryItem::class]])->daily();
