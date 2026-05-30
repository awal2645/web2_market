<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class AuthRedirectResponse implements LoginResponseContract, RegisterResponseContract
{
    public function toResponse($request): RedirectResponse
    {
        $user = $request->user();

        if ($user && ! $user->hasVerifiedEmail()) {
            return redirect()->route('verification.notice');
        }

        if ($user && $user->needsListingPrompt()) {
            return redirect()->route('onboarding.list-vehicle');
        }

        return redirect()->intended(route('dashboard'));
    }
}
