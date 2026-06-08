<?php

namespace App\Concerns;

use App\Models\User;
use App\Rules\ValidPhoneNumber;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function profileRules(?int $userId = null): array
    {
        return [
            'name' => $this->nameRules(),
            'email' => $this->emailRules($userId),
        ];
    }

    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function profileUpdateRules(?int $userId = null): array
    {
        return [
            ...$this->profileRules($userId),
            'phone' => $this->phoneRules(),
            'avatar' => $this->avatarRules(),
        ];
    }

    /**
     * Get the validation rules used to validate user names.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function nameRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    /**
     * Get the validation rules used to validate user emails.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function emailRules(?int $userId = null): array
    {
        return [
            'required',
            'string',
            'email',
            'max:255',
            $userId === null
                ? Rule::unique(User::class)
                : Rule::unique(User::class)->ignore($userId),
        ];
    }

    /**
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function phoneRules(): array
    {
        return ['required', 'string', 'max:20', new ValidPhoneNumber];
    }

    /**
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function avatarRules(): array
    {
        return [
            'nullable',
            'image',
            'mimes:jpeg,jpg,png,webp',
            'max:2048',
            'dimensions:min_width=100,min_height=100,max_width=4096,max_height=4096',
        ];
    }
}
