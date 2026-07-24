<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'service' => 'school-guestbook-api',
    'version' => '1.0.0',
]));
