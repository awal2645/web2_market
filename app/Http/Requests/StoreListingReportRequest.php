<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreListingReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'reason' => [
                'required',
                'string',
                Rule::in([
                    'Suspected fraud',
                    'Incorrect information',
                    'Vehicle already sold',
                    'Offensive content',
                    'Other',
                ]),
            ],
            'details' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
