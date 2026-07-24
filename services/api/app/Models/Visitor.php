<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Visitor extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'name', 'phone', 'phone_hash', 'phone_last4', 'address', 'institution',
        'photo_path', 'active', 'consent_at', 'last_seen_at',
    ];

    protected $hidden = ['phone_hash'];

    protected function casts(): array
    {
        return [
            'phone' => 'encrypted',
            'address' => 'encrypted',
            'active' => 'boolean',
            'consent_at' => 'datetime',
            'last_seen_at' => 'datetime',
        ];
    }

    public function embeddings(): HasMany
    {
        return $this->hasMany(FaceEmbedding::class);
    }

    public function visits(): HasMany
    {
        return $this->hasMany(Visit::class);
    }
}
