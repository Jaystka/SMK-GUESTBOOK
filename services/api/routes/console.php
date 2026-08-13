<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('guestbook:status', function (): void {
    $this->info('School guestbook API is installed.');
});

Schedule::command('sanctum:prune-expired --hours=24')->daily();
Schedule::command('queue:prune-batches --hours=48')->daily();

Schedule::call(function () {
    $visits = \App\Models\Visit::query()
        ->whereNull('checkout_time')
        ->whereNotNull('expected_checkout_time')
        ->where('expected_checkout_time', '<=', now())
        ->get();

    foreach ($visits as $visit) {
        $visit->update(['checkout_time' => now()]);
        \App\Models\AuditLog::query()->create([
            'action' => 'visit.auto_checkout',
            'subject_type' => $visit::class,
            'subject_id' => $visit->id,
            'metadata' => ['reason' => 'time_limit'],
            'created_at' => now(),
        ]);
    }
})->everyMinute();
