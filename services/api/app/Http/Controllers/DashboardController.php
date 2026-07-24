<?php

namespace App\Http\Controllers;

use App\Models\Visit;
use App\Models\Visitor;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function today(): JsonResponse
    {
        $start = now()->startOfDay(); $end = now()->endOfDay();
        $visits = Visit::query()->whereBetween('checkin_time', [$start, $end]);
        $total = (clone $visits)->count();
        $newVisitors = Visitor::query()->whereBetween('created_at', [$start, $end])->count();
        $inside = (clone $visits)->whereNull('checkout_time')->count();
        $hourly = Visit::query()->selectRaw("EXTRACT(HOUR FROM checkin_time)::int AS hour, COUNT(*)::int AS total")->whereBetween('checkin_time',[$start,$end])->groupByRaw('EXTRACT(HOUR FROM checkin_time)')->orderBy('hour')->get();
        $recent = Visit::query()->with(['visitor:id,name,institution','employee:id,name'])->whereBetween('checkin_time',[$start,$end])->latest('checkin_time')->limit(10)->get();
        return response()->json(['total'=>$total,'new_visitors'=>$newVisitors,'returning_visitors'=>max(0,$total-$newVisitors),'currently_inside'=>$inside,'hourly'=>$hourly,'recent'=>\App\Http\Resources\VisitResource::collection($recent)->resolve()]);
    }
}
