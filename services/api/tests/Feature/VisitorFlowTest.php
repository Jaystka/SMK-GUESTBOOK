<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class VisitorFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_visitor_can_register_and_be_identified(): void
    {
        config(['filesystems.default' => 'local']);
        Storage::fake('local');

        $embedding = array_fill(0, 512, 0.0);
        $embedding[0] = 1.0;
        Http::fake([
            '*/embedding' => Http::response([
                'embedding' => $embedding,
                'dimensions' => 512,
                'model_version' => 'test-model',
                'quality' => ['blur_score' => 100, 'face_width' => 120, 'face_height' => 120, 'detection_score' => 0.99],
            ]),
        ]);

        $image = 'data:image/png;base64,'.base64_encode(base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII='
        ));

        $registration = $this->postJson('/api/v1/visitors', [
            'name' => 'Ahmad',
            'phone' => '08123456789',
            'address' => 'Yogyakarta',
            'institution' => 'Dinas Pendidikan',
            'photo' => $image,
            'consent' => true,
        ])->assertCreated();

        $this->postJson('/api/v1/face/identify', ['image' => $image])
            ->assertOk()
            ->assertJson([
                'matched' => true,
                'visitor_id' => $registration->json('id'),
                'name' => 'Ahmad',
            ]);
    }
}
