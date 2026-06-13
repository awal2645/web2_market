<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleListingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $currentYear = (int) date('Y') + 1;

        return [
            'year' => ['required', 'integer', 'min:1900', "max:{$currentYear}"],
            'make' => ['required', 'string', 'max:100'],
            'model' => ['required', 'string', 'max:100'],
            'trim' => ['nullable', 'string', 'max:100'],
            'mileage' => ['required', 'integer', 'min:0', 'max:9999999'],
            'vin' => ['required', 'string', 'size:17', 'regex:/^[A-HJ-NPR-Z0-9]{17}$/i'],
            'title_status' => ['required', 'string', 'max:50'],
            'condition' => ['required', 'string', 'max:50'],
            'exterior_color' => ['required', 'string', 'max:50'],
            'interior_color' => ['required', 'string', 'max:50'],
            'transmission' => ['required', 'string', 'max:50'],
            'fuel_type' => ['required', 'string', 'max:50'],
            'drivetrain' => ['required', 'string', 'max:50'],
            'body_type' => ['required', 'string', 'max:50'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'size:2', 'alpha'],
            'zip_code' => ['required', 'string', 'max:10'],
            'asking_price' => ['required', 'integer', 'min:1', 'max:99999999'],
            'seller_notes' => ['nullable', 'string', 'max:5000'],
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_email' => ['required', 'email', 'max:255'],
            'contact_phone' => ['required', 'string', 'max:30'],
            'images' => ['required', 'array', 'min:1', 'max:20'],
            'images.*' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'vin.size' => 'The VIN must be exactly 17 characters.',
            'vin.regex' => 'The VIN may only contain letters and numbers (no I, O, or Q).',
            'images.required' => 'Please upload at least one photo of your vehicle.',
            'images.min' => 'Please upload at least one photo of your vehicle.',
            'images.*.image' => 'Each upload must be a valid image file.',
            'images.*.max' => 'Each image must be smaller than 10 MB.',
        ];
    }
}
