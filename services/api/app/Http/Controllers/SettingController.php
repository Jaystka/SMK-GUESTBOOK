<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key')->map(function($val) {
            return json_decode($val, true);
        });
        return response()->json($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'radius_enabled' => ['required', 'boolean'],
            'radius_lat' => ['nullable', 'numeric'],
            'radius_lng' => ['nullable', 'numeric'],
            'radius_meters' => ['nullable', 'numeric', 'min:1'],
        ]);

        foreach ($data as $key => $value) {
            Setting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => json_encode($value)] // Store as JSON so booleans remain boolean
            );
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }
}
