<?php
namespace App\Http\Requests;
use App\Rules\Base64Image;
use Illuminate\Foundation\Http\FormRequest;
class IdentifyFaceRequest extends FormRequest { public function authorize(): bool { return true; } public function rules(): array { return ['image' => ['required', new Base64Image]]; } }
