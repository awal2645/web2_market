<?php

namespace App\Http\Responses;

use App\Support\AuthSync;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class AuthRedirectResponse implements LoginResponseContract, RegisterResponseContract
{
    public function toResponse($request): RedirectResponse
    {
        $user = $request->user();

        $destination = $user && $user->needsListingPrompt()
            ? route('onboarding.list-vehicle')
            : $request->session()->pull('url.intended', route('dashboard'));

        $returnUrl = str_starts_with($destination, 'http')
            ? $destination
            : url($destination);

        if ($user && ($handshake = AuthSync::partnerHandshakeUrl($user, $returnUrl))) {
            return redirect()->away($handshake);
        }

        return redirect($destination);
    }
}
