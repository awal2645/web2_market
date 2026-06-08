<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\AuthSync;
use App\Support\AuthSyncToken;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class AuthSyncController extends Controller
{
    /**
     * Accept a signed token from web2autos-next and establish a Laravel session.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $secret = config('auth_sync.secret');
        if (! is_string($secret) || $secret === '') {
            abort(404);
        }

        $token = $request->string('token')->toString();
        $payload = AuthSyncToken::verify($token, $secret);

        if ($payload === null) {
            abort(403, 'Invalid or expired sync token.');
        }

        $user = User::query()->find($payload['sub']);

        if (
            $user === null
            || Str::lower($user->email) !== $payload['email']
        ) {
            abort(403, 'User not found.');
        }

        Auth::login($user);
        $request->session()->regenerate();

        $return = AuthSync::sanitizeReturnUrl($request->string('return')->toString())
            ?? url('/dashboard');

        return redirect()->away($return);
    }
}
