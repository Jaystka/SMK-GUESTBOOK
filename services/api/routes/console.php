<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('guestbook:status', function (): void {
    $this->info('School guestbook API is installed.');
});

Schedule::command('sanctum:prune-expired --hours=24')->daily();
Schedule::command('queue:prune-batches --hours=48')->daily();
