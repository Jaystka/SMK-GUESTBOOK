<?php

namespace App\Services;

class PhoneService
{
    public function normalize(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';
        if (str_starts_with($digits, '62')) return '0'.substr($digits, 2);
        if (str_starts_with($digits, '8')) return '0'.$digits;
        return $digits;
    }

    public function hash(string $phone): string
    {
        return hash_hmac('sha256', $this->normalize($phone), (string) config('services.privacy.phone_hash_key'));
    }

    public function last4(string $phone): string
    {
        return substr($this->normalize($phone), -4);
    }
}
