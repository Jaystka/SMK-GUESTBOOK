<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaceInputException extends Exception
{
    public function __construct(
        string $message,
        public readonly string $errorCode = 'invalid_face_image',
        public readonly int $statusCode = 422,
    ) {
        parent::__construct($message);
    }

    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'errors' => ['image' => [$this->getMessage()]],
            'code' => $this->errorCode,
        ], $this->statusCode);
    }
}
