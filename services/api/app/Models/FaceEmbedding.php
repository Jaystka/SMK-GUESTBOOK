<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FaceEmbedding extends Model
{
    use HasUuids;

    public $timestamps = false;
    protected $fillable = ['visitor_id', 'embedding', 'model_version', 'is_primary', 'active', 'quality'];
    protected $hidden = ['embedding'];

    protected function casts(): array
    {
        return ['is_primary' => 'boolean', 'active' => 'boolean', 'quality' => 'array', 'created_at' => 'datetime'];
    }

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(Visitor::class);
    }
}
