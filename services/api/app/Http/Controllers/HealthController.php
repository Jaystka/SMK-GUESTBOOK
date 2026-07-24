<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        DB::select('SELECT 1');
        return response()->json(['status' => 'ok', 'service' => 'school-guestbook-api', 'time' => now()->toIso8601String()]);
    }
}
