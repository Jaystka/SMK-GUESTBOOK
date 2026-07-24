<?php

namespace App\Services;

use App\Models\FaceEmbedding;
use App\Models\Visitor;
use Illuminate\Support\Facades\DB;

class FaceMatcher
{
    public function findBest(array $embedding): ?array
    {
        if (DB::getDriverName() !== 'pgsql') {
            return $this->findBestInMemory($embedding);
        }

        $literal = $this->vectorLiteral($embedding);
        $row = DB::selectOne(
            'SELECT fe.visitor_id, 1 - (fe.embedding <=> CAST(? AS vector)) AS score
             FROM face_embeddings fe
             INNER JOIN visitors v ON v.id = fe.visitor_id
             WHERE fe.active = true AND v.active = true AND v.deleted_at IS NULL
             ORDER BY fe.embedding <=> CAST(? AS vector)
             LIMIT 1',
            [$literal, $literal]
        );

        if (! $row) {
            return null;
        }

        return $this->buildResult((string) $row->visitor_id, (float) $row->score);
    }

    public function vectorLiteral(array $embedding): string
    {
        return '['.implode(',', array_map(
            static fn ($value) => sprintf('%.10F', (float) $value),
            $embedding
        )).']';
    }

    private function findBestInMemory(array $query): ?array
    {
        $best = null;
        foreach (FaceEmbedding::query()->where('active', true)->get(['visitor_id', 'embedding']) as $row) {
            $candidate = array_map('floatval', explode(',', trim((string) $row->embedding, '[]')));
            if (count($candidate) !== 512) {
                continue;
            }
            $score = $this->cosine($query, $candidate);
            if ($best === null || $score > $best['score']) {
                $best = ['visitor_id' => $row->visitor_id, 'score' => $score];
            }
        }

        return $best ? $this->buildResult($best['visitor_id'], $best['score']) : null;
    }

    private function buildResult(string $visitorId, float $score): ?array
    {
        $threshold = (float) config('services.ai.threshold', 0.48);
        if ($score < $threshold) {
            return ['matched' => false, 'score' => $score, 'threshold' => $threshold];
        }

        $visitor = Visitor::query()->find($visitorId);
        return $visitor
            ? ['matched' => true, 'score' => $score, 'threshold' => $threshold, 'visitor' => $visitor]
            : null;
    }

    private function cosine(array $left, array $right): float
    {
        $dot = 0.0;
        $leftNorm = 0.0;
        $rightNorm = 0.0;
        foreach ($left as $index => $value) {
            $a = (float) $value;
            $b = (float) ($right[$index] ?? 0.0);
            $dot += $a * $b;
            $leftNorm += $a * $a;
            $rightNorm += $b * $b;
        }
        $denominator = sqrt($leftNorm) * sqrt($rightNorm);
        return $denominator > 0.0 ? $dot / $denominator : -1.0;
    }
}
