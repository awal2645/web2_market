<?php

namespace App\Http\Requests;

use App\Enums\ListingApprovalMode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMarketSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'listing_approval_mode' => ['required', Rule::enum(ListingApprovalMode::class)],
        ];
    }
}
