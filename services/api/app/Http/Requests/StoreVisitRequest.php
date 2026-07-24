<?php
namespace App\Http\Requests;
use App\Rules\Base64Image;
use Illuminate\Foundation\Http\FormRequest;
class StoreVisitRequest extends FormRequest
{
 public function authorize(): bool { return true; }
 public function rules(): array { return [
  'visitor_id' => ['required','uuid','exists:visitors,id'], 'purpose' => ['required','string','max:1000'],
  'employee_id' => ['nullable','uuid','exists:employees,id'], 'meet_person' => ['nullable','string','max:200','required_without:employee_id'],
  'visit_photo' => ['nullable', new Base64Image], 'confidence_score' => ['nullable','numeric','between:-1,1'],
  'recognition_method' => ['nullable','in:face,phone,manual,new_registration'], 'notes' => ['nullable','string','max:1000'],
 ]; }
}
