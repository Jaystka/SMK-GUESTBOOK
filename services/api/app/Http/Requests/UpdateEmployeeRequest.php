<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class UpdateEmployeeRequest extends FormRequest { public function authorize(): bool { return true; } public function rules(): array { return ['name'=>['sometimes','required','string','max:200'],'department'=>['nullable','string','max:200'],'position'=>['nullable','string','max:200'],'active'=>['sometimes','boolean']]; } }
