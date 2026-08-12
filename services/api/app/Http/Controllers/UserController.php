<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->latest();
        if ($search = trim((string) $request->query('search'))) {
            $query->where(fn($q) => $q->where('name', 'ilike', "%{$search}%")->orWhere('email', 'ilike', "%{$search}%"));
        }
        return UserResource::collection($query->paginate(min((int) $request->query('per_page', 20), 100)));
    }

    public function store(StoreUserRequest $request, AuditService $audit): UserResource
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        $user = User::query()->create($data);
        
        $audit->record($request, 'user.created', $user);
        
        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, User $user, AuditService $audit): UserResource
    {
        $data = $request->validated();
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        
        $user->update($data);
        
        $audit->record($request, 'user.updated', $user);
        
        return new UserResource($user->fresh());
    }

    public function destroy(Request $request, User $user, AuditService $audit): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete yourself'], 400);
        }
        
        $user->update(['active' => false]);
        $user->delete();
        
        $audit->record($request, 'user.deleted', $user);
        
        return response()->json(['message' => 'deleted']);
    }
}
