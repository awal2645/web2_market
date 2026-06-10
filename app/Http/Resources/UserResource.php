<?php

namespace App\Http\Resources;

use App\Models\User;

class UserResource
{
    /**
     * @return array<string, mixed>
     */
    public static function make(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
        ];
    }
}
