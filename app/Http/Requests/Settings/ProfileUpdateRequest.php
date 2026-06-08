<?php

namespace App\Http\Requests\Settings;

use App\Concerns\ProfileValidationRules;
use App\Support\PhoneNumber;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules;

    protected function prepareForValidation(): void
    {
        if ($this->has('phone')) {
            $this->merge([
                'phone' => PhoneNumber::normalize((string) $this->input('phone')),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->profileUpdateRules($this->user()->id);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.required' => 'A mobile number is required.',
            'avatar.mimes' => 'Profile pictures must be a JPEG, PNG, or WebP image.',
            'avatar.max' => 'Profile pictures may not be larger than 2 MB.',
            'avatar.dimensions' => 'Profile pictures must be at least 100×100 pixels.',
        ];
    }
}
