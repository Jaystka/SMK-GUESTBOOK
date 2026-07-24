<?php
namespace App\Http\Requests;
use App\Rules\Base64Image;
use Illuminate\Foundation\Http\FormRequest;
class StoreVisitorRequest extends FormRequest
{
 public function authorize(): bool { return true; }
 public function rules(): array { return [
  'name' => ['required','string','max:200'], 'phone' => ['required','string','max:30'],
  'address' => ['nullable','string','max:2000'], 'institution' => ['nullable','string','max:200'],
  'photo' => ['required', new Base64Image], 'consent' => ['accepted'],
 ]; }
}
