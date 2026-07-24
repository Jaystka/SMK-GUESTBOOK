<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function options()
    {
        return EmployeeResource::collection(Employee::query()->where('active', true)->orderBy('name')->get());
    }
    public function index(Request $request)
    {
        $query = Employee::query()->latest();
        if ($search = trim((string) $request->query('search'))) $query->where(fn($q) => $q->where('name','ilike',"%{$search}%")->orWhere('department','ilike',"%{$search}%"));
        return EmployeeResource::collection($query->paginate(min((int) $request->query('per_page',20),100)));
    }
    public function store(StoreEmployeeRequest $request, AuditService $audit): EmployeeResource
    {
        $employee = Employee::query()->create($request->validated()); $audit->record($request,'employee.created',$employee); return new EmployeeResource($employee);
    }
    public function update(UpdateEmployeeRequest $request, Employee $employee, AuditService $audit): EmployeeResource
    {
        $employee->update($request->validated()); $audit->record($request,'employee.updated',$employee); return new EmployeeResource($employee->fresh());
    }
    public function destroy(Request $request, Employee $employee, AuditService $audit): JsonResponse
    {
        $employee->update(['active'=>false]); $employee->delete(); $audit->record($request,'employee.deleted',$employee); return response()->json(['message'=>'deleted']);
    }
}
