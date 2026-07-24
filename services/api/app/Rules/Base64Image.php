<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Base64Image implements ValidationRule
{
    public function __construct(private readonly int $maxBytes = 8_388_608) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail("The {$attribute} field must be a base64 image.");
            return;
        }
        $payload = str_contains($value, ',') ? explode(',', $value, 2)[1] : $value;
        $binary = base64_decode($payload, true);
        if ($binary === false || $binary === '') {
            $fail("The {$attribute} field is not valid base64.");
            return;
        }
        if (strlen($binary) > $this->maxBytes) {
            $fail("The {$attribute} image may not exceed 8 MB.");
            return;
        }
        $info = @getimagesizefromstring($binary);
        if ($info === false || ! in_array($info['mime'], ['image/jpeg', 'image/png', 'image/webp'], true)) {
            $fail("The {$attribute} field must contain a JPEG, PNG, or WebP image.");
        }
    }
}
