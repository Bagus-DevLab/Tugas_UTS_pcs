<?php

namespace App\Http\Controllers;

use App\Services\MetaTagService;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class WelcomeController extends Controller
{
    public function index()
    {
        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'meta' => MetaTagService::forHomepage(),
        ]);
    }
}
