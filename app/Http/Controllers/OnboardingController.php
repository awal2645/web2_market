<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function listVehiclePrompt(Request $request): Response|RedirectResponse
    {
        if (! $request->user()->needsListingPrompt()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('onboarding/list-vehicle');
    }

    public function skipListingPrompt(Request $request): RedirectResponse
    {
        $request->user()->update([
            'listing_prompt_completed_at' => now(),
        ]);

        return redirect()->route('onboarding.congratulations');
    }

    public function congratulations(Request $request): Response|RedirectResponse
    {
        if ($request->user()->needsListingPrompt()) {
            return redirect()->route('onboarding.list-vehicle');
        }

        return Inertia::render('onboarding/congratulations');
    }
}
