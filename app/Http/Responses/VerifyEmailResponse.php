<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\VerifyEmailResponse as VerifyEmailResponseContract;

class VerifyEmailResponse implements VerifyEmailResponseContract
{
    public function toResponse($request): RedirectResponse
    {
        $user = $request->user();

        if ($user && $user->needsListingPrompt()) {
            return redirect()->route('onboarding.list-vehicle', ['verified' => 1]);
        }

        return redirect()->intended(route('dashboard').'?verified=1');
    }
}
