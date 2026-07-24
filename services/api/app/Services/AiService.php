<?php

namespace App\Services;

use App\Exceptions\FaceInputException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class AiService
{
    public function embedding(string $base64Image): array
    {
        try {
            $response = Http::baseUrl(rtrim((string) config('services.ai.url'), '/'))
                ->withHeaders(['X-Service-Token' => (string) config('services.ai.token')])
                ->acceptJson()
                ->timeout((int) config('services.ai.timeout', 10))
                ->retry(2, 200, throw: false)
                ->post('/embedding', ['image' => $base64Image]);
        } catch (ConnectionException $exception) {
            throw new RuntimeException('Face service is unavailable: '.$exception->getMessage(), previous: $exception);
        }

        if ($response->clientError()) {
            throw new FaceInputException(
                message: (string) ($response->json('error.message') ?? $response->json('detail') ?? 'Foto wajah tidak dapat diproses.'),
                errorCode: (string) ($response->json('error.code') ?? 'invalid_face_image'),
                statusCode: $response->status() === 413 ? 413 : 422,
            );
        }

        if ($response->serverError()) {
            throw new RuntimeException('Face service returned HTTP '.$response->status().'.');
        }

        $data = $response->json();
        if (! is_array($data) || ! isset($data['embedding']) || count($data['embedding']) !== 512) {
            throw new RuntimeException('Face service returned an invalid embedding.');
        }

        return $data;
    }
}
