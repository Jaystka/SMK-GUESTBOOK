<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request, AuditService $audit): JsonResponse
    {
        $user = User::query()->where('email', strtolower((string) $request->string('email')))->first();
        if (! $user || ! $user->active || ! Hash::check((string) $request->string('password'), $user->password)) {
            throw ValidationException::withMessages(['email' => ['Kredensial tidak valid.']]);
        }
        $token = $user->createToken((string) $request->string('device_name', 'web-admin'), [$user->role])->plainTextToken;
        $audit->record($request, 'auth.login', $user);
        return response()->json(['token' => $token, 'user' => $this->userPayload($user)]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->userPayload($request->user())]);
    }

    public function logout(Request $request, AuditService $audit): JsonResponse
    {
        $audit->record($request, 'auth.logout', $request->user());
        $request->user()->currentAccessToken()?->delete();
        return response()->json(['message' => 'logged_out']);
    }

    private function userPayload(User $user): array
    {
        return ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'role' => $user->role];
    }
}
