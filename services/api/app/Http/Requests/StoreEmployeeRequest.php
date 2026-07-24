<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreEmployeeRequest extends FormRequest { public function authorize(): bool { return true; } public function rules(): array { return ['name'=>['required','string','max:200'],'department'=>['nullable','string','max:200'],'position'=>['nullable','string','max:200'],'active'=>['sometimes','boolean']]; } }
