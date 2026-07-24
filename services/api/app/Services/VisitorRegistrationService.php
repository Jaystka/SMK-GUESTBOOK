<?php

namespace App\Services;

use App\Models\FaceEmbedding;
use App\Models\Visitor;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class VisitorRegistrationService
{
    public function __construct(
        private readonly AiService $ai,
        private readonly ImageStorageService $images,
        private readonly PhoneService $phones,
        private readonly FaceMatcher $matcher,
    ) {}

    public function register(array $data): Visitor
    {
        $aiResult = $this->ai->embedding($data['photo']);
        $existingFace = $this->matcher->findBest($aiResult['embedding']);
        if ($existingFace && ($existingFace['matched'] ?? false)) {
            throw ValidationException::withMessages(['photo' => ['Wajah ini sudah terdaftar sebagai '.$existingFace['visitor']->name.'.']]);
        }
        $photoPath = $this->images->storeBase64($data['photo'], 'visitors');

        try {
            return DB::transaction(function () use ($data, $aiResult, $photoPath): Visitor {
                $phone = $this->phones->normalize($data['phone']);
                $visitor = Visitor::query()->create([
                    'name' => $data['name'],
                    'phone' => $phone,
                    'phone_hash' => $this->phones->hash($phone),
                    'phone_last4' => $this->phones->last4($phone),
                    'address' => $data['address'] ?? null,
                    'institution' => $data['institution'] ?? null,
                    'photo_path' => $photoPath,
                    'active' => true,
                    'consent_at' => now(),
                ]);
                FaceEmbedding::query()->create([
                    'visitor_id' => $visitor->id,
                    'embedding' => $this->matcher->vectorLiteral($aiResult['embedding']),
                    'model_version' => $aiResult['model_version'] ?? 'unknown',
                    'is_primary' => true,
                    'active' => true,
                    'quality' => $aiResult['quality'] ?? null,
                    'created_at' => now(),
                ]);
                return $visitor;
            });
        } catch (Throwable $exception) {
            $this->images->delete($photoPath);
            throw $exception;
        }
    }
}
