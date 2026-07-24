<?php

return [
    'privacy' => [
        'phone_hash_key' => env('PHONE_HASH_KEY', env('APP_KEY')),
    ],
    'ai' => [
        'url' => env('AI_SERVICE_URL', 'http://insightface-service:8000'),
        'token' => env('AI_SERVICE_TOKEN'),
        'timeout' => (int) env('AI_REQUEST_TIMEOUT', 10),
        'threshold' => (float) env('AI_MATCH_THRESHOLD', 0.48),
    ],
];
