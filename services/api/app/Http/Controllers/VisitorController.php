<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVisitorRequest;
use App\Http\Requests\UpdateVisitorRequest;
use App\Http\Resources\VisitorResource;
use App\Models\Visitor;
use App\Services\AuditService;
use App\Services\PhoneService;
use App\Services\VisitorRegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VisitorController extends Controller
{
    public function index(Request $request)
    {
        $query = Visitor::query()->withCount('visits')->latest();
        if ($search = trim((string) $request->query('search'))) {
            $query->where(fn ($q) => $q->where('name', 'ilike', "%{$search}%")->orWhere('institution', 'ilike', "%{$search}%")->orWhere('phone_last4', $search));
        }
        if ($request->has('active')) $query->where('active', $request->boolean('active'));
        return VisitorResource::collection($query->paginate(min((int) $request->query('per_page', 20), 100)));
    }

    public function store(StoreVisitorRequest $request, VisitorRegistrationService $registration, PhoneService $phones, AuditService $audit): JsonResponse
    {
        $data = $request->validated();
        $existing = Visitor::query()->where('phone_hash', $phones->hash($data['phone']))->where('active', true)->first();
        if ($existing) {
            return response()->json(['message' => 'Nomor telepon telah terdaftar.', 'visitor_id' => $existing->id], 409);
        }
        $visitor = $registration->register($data);
        $audit->record($request, 'visitor.registered', $visitor);
        return response()->json(['id' => $visitor->id, 'name' => $visitor->name, 'message' => 'registered'], 201);
    }

    public function show(Visitor $visitor): VisitorResource
    {
        return new VisitorResource($visitor->loadCount('visits')->load(['visits' => fn ($q) => $q->latest('checkin_time')->limit(10)]));
    }

    public function update(UpdateVisitorRequest $request, Visitor $visitor, PhoneService $phones, AuditService $audit): VisitorResource
    {
        $data = $request->validated();
        if (isset($data['phone'])) {
            $data['phone'] = $phones->normalize($data['phone']);
            $data['phone_hash'] = $phones->hash($data['phone']);
            $data['phone_last4'] = $phones->last4($data['phone']);
        }
        $visitor->update($data);
        $audit->record($request, 'visitor.updated', $visitor, ['fields' => array_keys($data)]);
        return new VisitorResource($visitor->fresh());
    }

    public function destroy(Request $request, Visitor $visitor, AuditService $audit): JsonResponse
    {
        $visitor->update(['active' => false]);
        $visitor->embeddings()->update(['active' => false]);
        $visitor->delete();
        $audit->record($request, 'visitor.deleted', $visitor);
        return response()->json(['message' => 'deleted']);
    }

    public function searchByPhone(Request $request, PhoneService $phones): JsonResponse
    {
        $validated = $request->validate(['phone' => ['required','string','max:30']]);
        $visitor = Visitor::query()->where('phone_hash', $phones->hash($validated['phone']))->where('active', true)->first();
        return $visitor
            ? response()->json(['found' => true, 'id' => $visitor->id, 'name' => $visitor->name, 'institution' => $visitor->institution])
            : response()->json(['found' => false], 404);
    }
}
