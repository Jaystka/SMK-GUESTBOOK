<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditService
{
    public function record(Request $request, string $action, Model|string|null $subject = null, array $metadata = []): AuditLog
    {
        return AuditLog::query()->create([
            'user_id' => $request->user()?->id,
            'action' => $action,
            'subject_type' => $subject instanceof Model ? $subject::class : null,
            'subject_id' => $subject instanceof Model ? $subject->getKey() : (is_string($subject) ? $subject : null),
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 500),
            'metadata' => $metadata,
            'created_at' => now(),
        ]);
    }
}
