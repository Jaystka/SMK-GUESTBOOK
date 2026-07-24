<?php

namespace App\Http\Controllers;

use App\Models\Visit;
use App\Models\Visitor;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MediaController extends Controller
{
    public function visitorPhoto(Visitor $visitor): StreamedResponse
    {
        abort_unless($visitor->photo_path, 404);
        return Storage::disk(config('filesystems.default'))->response($visitor->photo_path);
    }
    public function visitPhoto(Visit $visit): StreamedResponse
    {
        abort_unless($visit->visit_photo_path, 404);
        return Storage::disk(config('filesystems.default'))->response($visit->visit_photo_path);
    }
}
