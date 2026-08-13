<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVisitRequest;
use App\Http\Resources\VisitResource;
use App\Models\Employee;
use App\Models\Visit;
use App\Models\Visitor;
use App\Services\AuditService;
use App\Services\ImageStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class VisitController extends Controller
{
    public function index(Request $request)
    {
        $query = Visit::query()->with(['visitor:id,name,institution,phone_last4', 'employee:id,name,department'])->latest('checkin_time');
        if ($request->filled('date_from')) $query->whereDate('checkin_time', '>=', $request->date('date_from'));
        if ($request->filled('date_to')) $query->whereDate('checkin_time', '<=', $request->date('date_to'));
        if ($request->filled('status')) $request->query('status') === 'inside' ? $query->whereNull('checkout_time') : $query->whereNotNull('checkout_time');
        if ($search = trim((string) $request->query('search'))) {
            $query->whereHas('visitor', fn ($q) => $q->where('name', 'ilike', "%{$search}%"));
        }
        return VisitResource::collection($query->paginate(min((int) $request->query('per_page', 20), 100)));
    }

    public function store(StoreVisitRequest $request, ImageStorageService $images, AuditService $audit): JsonResponse
    {
        $data = $request->validated();
        $visitor = Visitor::query()->where('active', true)->findOrFail($data['visitor_id']);
        $employee = isset($data['employee_id']) ? Employee::query()->where('active', true)->findOrFail($data['employee_id']) : null;
        $photoPath = isset($data['visit_photo']) ? $images->storeBase64($data['visit_photo'], 'visits') : null;
        try {
            $visit = Visit::query()->create([
                'visitor_id' => $visitor->id,
                'employee_id' => $employee?->id,
                'purpose' => $data['purpose'],
                'meet_person' => $employee?->name ?? $data['meet_person'] ?? null,
                'visit_photo_path' => $photoPath,
                'confidence_score' => $data['confidence_score'] ?? null,
                'recognition_method' => $data['recognition_method'] ?? 'manual',
                'checkin_time' => now(),
                'created_by' => $request->user()?->id,
                'notes' => $data['notes'] ?? null,
                'is_group' => $data['is_group'] ?? false,
                'group_members' => $data['group_members'] ?? null,
            ]);
        } catch (Throwable $exception) {
            $images->delete($photoPath);
            throw $exception;
        }
        $visitor->forceFill(['last_seen_at' => now()])->save();
        $audit->record($request, 'visit.checkin', $visit, ['visitor_id' => $visitor->id]);
        return response()->json(['id' => $visit->id, 'checkin_time' => $visit->checkin_time->toIso8601String()], 201);
    }

    public function checkout(Request $request, Visit $visit, AuditService $audit): VisitResource
    {
        if (! $visit->checkout_time) $visit->update(['checkout_time' => now()]);
        $audit->record($request, 'visit.checkout', $visit);
        return new VisitResource($visit->fresh(['visitor', 'employee']));
    }
}
