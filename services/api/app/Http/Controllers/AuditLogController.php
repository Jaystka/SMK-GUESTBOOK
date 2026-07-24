<?php
namespace App\Http\Controllers;
use App\Models\AuditLog; use Illuminate\Http\Request;
class AuditLogController extends Controller { public function index(Request $request) { $query=AuditLog::query()->with('user:id,name,email')->latest('created_at'); if($request->filled('action'))$query->where('action',$request->query('action')); return $query->paginate(min((int)$request->query('per_page',30),100)); } }
