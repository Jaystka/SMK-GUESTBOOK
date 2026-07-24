<?php
use Illuminate\Database\Migrations\Migration; use Illuminate\Database\Schema\Blueprint; use Illuminate\Support\Facades\DB; use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void {
  if (DB::getDriverName()==='pgsql') DB::statement('CREATE EXTENSION IF NOT EXISTS vector');
  Schema::create('face_embeddings', function(Blueprint $t){$t->uuid('id')->primary();$t->uuid('visitor_id');$t->string('model_version',50);$t->boolean('is_primary')->default(false);$t->boolean('active')->default(true)->index();$t->json('quality')->nullable();$t->timestamp('created_at')->useCurrent();$t->foreign('visitor_id')->references('id')->on('visitors')->cascadeOnDelete();$t->index(['visitor_id','active']); if(DB::getDriverName()!=='pgsql')$t->text('embedding');});
  if (DB::getDriverName()==='pgsql') {DB::statement('ALTER TABLE face_embeddings ADD COLUMN embedding vector(512) NOT NULL');DB::statement('CREATE INDEX face_embeddings_embedding_hnsw ON face_embeddings USING hnsw (embedding vector_cosine_ops)');}
 }
 public function down(): void {Schema::dropIfExists('face_embeddings');}
};
