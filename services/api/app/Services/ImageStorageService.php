<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

class ImageStorageService
{
    public function storeBase64(string $value, string $directory): string
    {
        $payload = str_contains($value, ',') ? explode(',', $value, 2)[1] : $value;
        $binary = base64_decode($payload, true);
        if ($binary === false) throw new InvalidArgumentException('Invalid base64 image.');
        $info = getimagesizefromstring($binary);
        if ($info === false) throw new InvalidArgumentException('Invalid image data.');
        $extension = match ($info['mime']) { 'image/png' => 'png', 'image/webp' => 'webp', default => 'jpg' };
        $path = trim($directory, '/').'/'.now()->format('Y/m').'/'.str()->uuid().'.'.$extension;
        Storage::disk(config('filesystems.default'))->put($path, $binary, ['visibility' => 'private', 'ContentType' => $info['mime']]);
        return $path;
    }

    public function delete(?string $path): void
    {
        if ($path) Storage::disk(config('filesystems.default'))->delete($path);
    }
}
