<?php
namespace Tests\Feature;
use Illuminate\Foundation\Testing\RefreshDatabase; use Tests\TestCase;
class HealthTest extends TestCase { use RefreshDatabase; public function test_health_endpoint_is_available(): void { $this->getJson('/api/v1/health')->assertOk()->assertJsonPath('status','ok'); } }
