<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VisitorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $canViewSensitive = $user && in_array($user->role, [User::ROLE_SUPER_ADMIN, User::ROLE_OPERATOR], true);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $canViewSensitive ? $this->phone : ($this->phone_last4 ? '******'.$this->phone_last4 : null),
            'phone_last4' => $this->phone_last4,
            'address' => $canViewSensitive ? $this->address : null,
            'institution' => $this->institution,
            'active' => $this->active,
            'consent_at' => $this->consent_at?->toIso8601String(),
            'last_seen_at' => $this->last_seen_at?->toIso8601String(),
            'visits_count' => $this->whenCounted('visits'),
            'recent_visits' => VisitResource::collection($this->whenLoaded('visits')),
            'photo_url' => $user ? route('media.visitor-photo', $this->id) : null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
