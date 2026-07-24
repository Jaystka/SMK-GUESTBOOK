<?php
namespace Tests\Feature;
use App\Models\User; use Illuminate\Foundation\Testing\RefreshDatabase; use Tests\TestCase;
class AuthTest extends TestCase { use RefreshDatabase; public function test_user_can_login(): void { $user=User::factory()->create(['password'=>'secret123','active'=>true]); $this->postJson('/api/v1/auth/login',['email'=>$user->email,'password'=>'secret123'])->assertOk()->assertJsonStructure(['token','user'=>['id','name','email','role']]); } }
