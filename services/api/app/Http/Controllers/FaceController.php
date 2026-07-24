<?php

namespace App\Http\Controllers;

use App\Http\Requests\IdentifyFaceRequest;
use App\Services\AiService;
use App\Services\AuditService;
use App\Services\FaceMatcher;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class FaceController extends Controller
{
    public function identify(IdentifyFaceRequest $request, AiService $ai, FaceMatcher $matcher, AuditService $audit): JsonResponse
    {
        try {
            $aiResult = $ai->embedding((string) $request->string('image'));
        } catch (RuntimeException $exception) {
            return response()->json(['message' => 'Layanan pengenalan wajah tidak tersedia.', 'error' => $exception->getMessage()], 503);
        }
        $result = $matcher->findBest($aiResult['embedding']);
        if (! $result || ! ($result['matched'] ?? false)) {
            $audit->record($request, 'face.identify_unmatched', metadata: ['score' => $result['score'] ?? null]);
            return response()->json([
                'matched' => false,
                'confidence' => $result['score'] ?? null,
                'threshold' => $result['threshold'] ?? config('services.ai.threshold'),
                'quality' => $aiResult['quality'] ?? null,
            ]);
        }
        $visitor = $result['visitor'];
        $visitor->forceFill(['last_seen_at' => now()])->save();
        $audit->record($request, 'face.identify_matched', $visitor, ['score' => $result['score']]);
        return response()->json([
            'matched' => true,
            'visitor_id' => $visitor->id,
            'name' => $visitor->name,
            'institution' => $visitor->institution,
            'confidence' => round($result['score'], 5),
            'threshold' => $result['threshold'],
            'quality' => $aiResult['quality'] ?? null,
        ]);
    }
}
