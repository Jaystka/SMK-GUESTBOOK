<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class UpdateVisitorRequest extends FormRequest
{
 public function authorize(): bool { return true; }
 public function rules(): array { return [
  'name' => ['sometimes','required','string','max:200'], 'phone' => ['sometimes','required','string','max:30'],
  'address' => ['nullable','string','max:2000'], 'institution' => ['nullable','string','max:200'],
  'active' => ['sometimes','boolean'],
 ]; }
}
