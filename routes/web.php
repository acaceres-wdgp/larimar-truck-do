<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\OperationsController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\TruckController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::patch('trips/{trip}/status', [TripController::class, 'updateStatus'])->name('trips.updateStatus');
    Route::patch('trips/{trip}/assign', [TripController::class, 'assign'])->name('trips.assign');
    Route::resource('trips', TripController::class)
        ->only(['create', 'store', 'edit', 'update'])
        ->names([
            'create' => 'trips.create',
            'store' => 'trips.store',
            'edit' => 'trips.edit',
            'update' => 'trips.update',
        ]);
    Route::get('operations', [OperationsController::class, 'index'])->name('operations');
    Route::get('orders', [OrderController::class, 'index'])->name('orders');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('orders/{order}/complete', [OrderController::class, 'complete'])->name('orders.complete');
    Route::resource('clients', ClientController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy', 'show'])
        ->names([
            'index' => 'clients.index',
            'create' => 'clients.create',
            'store' => 'clients.store',
            'edit' => 'clients.edit',
            'update' => 'clients.update',
            'destroy' => 'clients.destroy',
            'show' => 'clients.show',
        ]);
    Route::resource('trucks', TruckController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy', 'show'])
        ->names([
            'index' => 'trucks.index',
            'create' => 'trucks.create',
            'store' => 'trucks.store',
            'edit' => 'trucks.edit',
            'update' => 'trucks.update',
            'destroy' => 'trucks.destroy',
            'show' => 'trucks.show',
        ]);
    Route::resource('drivers', DriverController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy', 'show'])
        ->names([
            'index' => 'drivers.index',
            'create' => 'drivers.create',
            'store' => 'drivers.store',
            'edit' => 'drivers.edit',
            'update' => 'drivers.update',
            'destroy' => 'drivers.destroy',
            'show' => 'drivers.show',
        ]);
    Route::get('invoices', [\App\Http\Controllers\InvoiceController::class, 'index'])->name('invoices');
    Route::get('invoices/create', [\App\Http\Controllers\InvoiceController::class, 'create'])->name('invoices.create');
    Route::post('invoices', [\App\Http\Controllers\InvoiceController::class, 'store'])->name('invoices.store');
    Route::get('invoices/{invoice}', [\App\Http\Controllers\InvoiceController::class, 'show'])->name('invoices.show');
    Route::get('invoices/{invoice}/pdf', [\App\Http\Controllers\InvoiceController::class, 'pdf'])->name('invoices.pdf');
    Route::patch('invoices/{invoice}/mark-sent', [\App\Http\Controllers\InvoiceController::class, 'markSent'])->name('invoices.markSent');
    Route::patch('invoices/{invoice}/mark-paid', [\App\Http\Controllers\InvoiceController::class, 'markPaid'])->name('invoices.markPaid');
    Route::get('payroll', [\App\Http\Controllers\PayrollController::class, 'index'])->name('payroll');
    Route::get('payroll/create', [\App\Http\Controllers\PayrollController::class, 'create'])->name('payroll.create');
    Route::post('payroll', [\App\Http\Controllers\PayrollController::class, 'store'])->name('payroll.store');
    Route::patch('payroll-items/{item}/deduction', [\App\Http\Controllers\PayrollController::class, 'updateDeduction'])->name('payroll.items.deduction');
    Route::get('payroll/{run}', [\App\Http\Controllers\PayrollController::class, 'show'])->name('payroll.show');
    Route::patch('payroll/{run}/approve', [\App\Http\Controllers\PayrollController::class, 'approve'])->name('payroll.approve');
    Route::patch('payroll/{run}/mark-paid', [\App\Http\Controllers\PayrollController::class, 'markPaid'])->name('payroll.markPaid');
    Route::get('payroll/{run}/pdf', [\App\Http\Controllers\PayrollController::class, 'pdf'])->name('payroll.pdf');
    Route::get('reports', [ReportsController::class, 'index'])->name('reports');
});

require __DIR__.'/settings.php';
