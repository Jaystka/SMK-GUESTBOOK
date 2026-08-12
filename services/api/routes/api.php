<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\FaceController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\VisitController;
use App\Http\Controllers\VisitorController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', HealthController::class);
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:auth');
    Route::post('/face/identify', [FaceController::class, 'identify'])->middleware('throttle:face-identify');
    Route::post('/visitors', [VisitorController::class, 'store'])->middleware('throttle:public-write');
    Route::get('/visitors/search', [VisitorController::class, 'searchByPhone'])->middleware('throttle:public-write');
    Route::post('/visits', [VisitController::class, 'store'])->middleware('throttle:public-write');
    Route::get('/employees/options', [EmployeeController::class, 'options']);
    Route::get('/settings', [\App\Http\Controllers\SettingController::class, 'index']);

    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function (): void {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        
        // Users Management
        Route::get('/users', [\App\Http\Controllers\UserController::class, 'index'])->middleware('role:super_admin');
        Route::post('/users', [\App\Http\Controllers\UserController::class, 'store'])->middleware('role:super_admin');
        Route::patch('/users/{user}', [\App\Http\Controllers\UserController::class, 'update'])->middleware('role:super_admin');
        Route::delete('/users/{user}', [\App\Http\Controllers\UserController::class, 'destroy'])->middleware('role:super_admin');

        // Settings Management
        Route::patch('/settings', [\App\Http\Controllers\SettingController::class, 'update'])->middleware('role:super_admin');

        Route::get('/dashboard/today', [DashboardController::class, 'today'])->middleware('role:super_admin,operator,security');
        Route::get('/visitors', [VisitorController::class, 'index'])->middleware('role:super_admin,operator,security');
        Route::get('/visitors/{visitor}', [VisitorController::class, 'show'])->middleware('role:super_admin,operator,security');
        Route::patch('/visitors/{visitor}', [VisitorController::class, 'update'])->middleware('role:super_admin,operator');
        Route::delete('/visitors/{visitor}', [VisitorController::class, 'destroy'])->middleware('role:super_admin');
        Route::get('/visits', [VisitController::class, 'index'])->middleware('role:super_admin,operator,security');
        Route::patch('/visits/{visit}/checkout', [VisitController::class, 'checkout'])->middleware('role:super_admin,operator,security');
        Route::get('/employees', [EmployeeController::class, 'index'])->middleware('role:super_admin,operator');
        Route::post('/employees', [EmployeeController::class, 'store'])->middleware('role:super_admin,operator');
        Route::patch('/employees/{employee}', [EmployeeController::class, 'update'])->middleware('role:super_admin,operator');
        Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy'])->middleware('role:super_admin');
        Route::get('/reports/visits.csv', [ReportController::class, 'visitsCsv'])->middleware('role:super_admin,operator');
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('role:super_admin');
        Route::get('/media/visitors/{visitor}/photo', [MediaController::class, 'visitorPhoto'])->name('media.visitor-photo')->middleware('role:super_admin,operator,security');
        Route::get('/media/visits/{visit}/photo', [MediaController::class, 'visitPhoto'])->name('media.visit-photo')->middleware('role:super_admin,operator,security');
    });
});
