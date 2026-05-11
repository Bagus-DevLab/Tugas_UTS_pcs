<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'email_verified_at' => $request->user()->email_verified_at,
                    'two_factor_enabled' => ! is_null($request->user()->two_factor_secret),
                    'two_factor_confirmed' => ! is_null($request->user()->two_factor_confirmed_at),

                    // Permission flags for frontend
                    'permissions' => [
                        'canManageKnowledgeBase' => $request->user()->canManageKnowledgeBase(),
                        'canManageSystem' => $request->user()->canManageSystem(),
                        'canViewAllDetections' => $request->user()->isAtLeastAdmin(),
                    ],
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
