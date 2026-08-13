<?php

namespace App\Http\Controllers;

use App\Models\Visit;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function visitsCsv(Request $request): StreamedResponse
    {
        $query = Visit::query()->with(['visitor', 'employee'])->orderBy('checkin_time');
        if ($request->filled('date_from')) $query->whereDate('checkin_time','>=',$request->query('date_from'));
        if ($request->filled('date_to')) $query->whereDate('checkin_time','<=',$request->query('date_to'));
        return response()->streamDownload(function () use ($query): void {
            $out = fopen('php://output','w');
            fputcsv($out,['ID','Nama Tamu','Institusi','Tujuan','Bertemu','Metode','Confidence','Check-in','Check-out','Keterangan']);
            $query->chunkById(500, function ($visits) use ($out): void {
                foreach ($visits as $visit) {
                    $notes = $visit->notes ?? '';
                    if ($visit->is_group && !empty($visit->group_members)) {
                        $memberNames = collect($visit->group_members)->pluck('name')->implode(', ');
                        $groupInfo = "Rombongan: " . $memberNames;
                        $notes = $notes ? $notes . " | " . $groupInfo : $groupInfo;
                    }
                    fputcsv($out,[$visit->id,$visit->visitor?->name,$visit->visitor?->institution,$visit->purpose,$visit->employee?->name ?? $visit->meet_person,$visit->recognition_method,$visit->confidence_score,$visit->checkin_time?->toDateTimeString(),$visit->checkout_time?->toDateTimeString(),$notes]);
                }
            }, 'id');
            fclose($out);
        }, 'visits-'.now()->format('Ymd-His').'.csv', ['Content-Type'=>'text/csv; charset=UTF-8']);
    }
}
