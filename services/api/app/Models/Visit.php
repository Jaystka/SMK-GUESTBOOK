<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Visit extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'visitor_id', 'employee_id', 'purpose', 'meet_person', 'visit_photo_path',
        'confidence_score', 'recognition_method', 'checkin_time', 'checkout_time',
        'created_by', 'notes', 'is_group', 'group_members',
    ];

    protected function casts(): array
    {
        return [
            'confidence_score' => 'decimal:4',
            'checkin_time' => 'datetime',
            'checkout_time' => 'datetime',
            'is_group' => 'boolean',
            'group_members' => 'array',
        ];
    }

    public function visitor(): BelongsTo { return $this->belongsTo(Visitor::class); }
    public function employee(): BelongsTo { return $this->belongsTo(Employee::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
}
