<?php

use App\Http\Controllers\Settings\CatalogController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\UserController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('settings/users', [UserController::class, 'index'])->name('users.index');
    Route::get('settings/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('settings/users', [UserController::class, 'store'])->name('users.store');
    Route::get('settings/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('settings/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('settings/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::patch('settings/users/{user}/suspend', [UserController::class, 'suspend'])->name('users.suspend');

    Route::get('settings/catalogs', [CatalogController::class, 'index'])->name('catalogs.index');
    Route::post('settings/catalogs/lines', [CatalogController::class, 'storeLine'])->name('catalogs.lines.store');
    Route::patch('settings/catalogs/lines/{line}', [CatalogController::class, 'updateLine'])->name('catalogs.lines.update');
    Route::delete('settings/catalogs/lines/{line}', [CatalogController::class, 'destroyLine'])->name('catalogs.lines.destroy');
    Route::patch('settings/catalogs/lines/{line}/toggle', [CatalogController::class, 'toggleLine'])->name('catalogs.lines.toggle');

    Route::post('settings/catalogs/cities', [CatalogController::class, 'storeCity'])->name('catalogs.cities.store');
    Route::patch('settings/catalogs/cities/{city}', [CatalogController::class, 'updateCity'])->name('catalogs.cities.update');
    Route::delete('settings/catalogs/cities/{city}', [CatalogController::class, 'destroyCity'])->name('catalogs.cities.destroy');
    Route::patch('settings/catalogs/cities/{city}/toggle', [CatalogController::class, 'toggleCity'])->name('catalogs.cities.toggle');

    Route::post('settings/catalogs/ports', [CatalogController::class, 'storePort'])->name('catalogs.ports.store');
    Route::patch('settings/catalogs/ports/{port}', [CatalogController::class, 'updatePort'])->name('catalogs.ports.update');
    Route::delete('settings/catalogs/ports/{port}', [CatalogController::class, 'destroyPort'])->name('catalogs.ports.destroy');
    Route::patch('settings/catalogs/ports/{port}/toggle', [CatalogController::class, 'togglePort'])->name('catalogs.ports.toggle');

    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});

Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
