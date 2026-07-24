<?php
use Illuminate\Database\Migrations\Migration; use Illuminate\Database\Schema\Blueprint; use Illuminate\Support\Facades\Schema;
return new class extends Migration { public function up(): void {Schema::create('employees',function(Blueprint $t){$t->uuid('id')->primary();$t->string('name',200)->index();$t->string('department',200)->nullable()->index();$t->string('position',200)->nullable();$t->boolean('active')->default(true)->index();$t->timestamps();$t->softDeletes();});} public function down(): void {Schema::dropIfExists('employees');} };
