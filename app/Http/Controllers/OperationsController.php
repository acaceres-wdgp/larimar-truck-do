<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Trip;
use App\Models\Truck;
use Inertia\Inertia;
use Inertia\Response;

class OperationsController extends Controller
{
    public function index(): Response
    {
        $today = now()->toDateString();
        $tomorrow = now()->addDay()->toDateString();

        $trips = Trip::with(['truck', 'driver', 'shippingLine'])
            ->where(function ($q) use ($today, $tomorrow) {
                $q->whereDate('date', $today)->orWhereDate('date', $tomorrow);
            })
            ->get()
            ->map(fn (Trip $t) => [
                'id'       => $t->id,
                'day'      => $t->date->toDateString() === $today ? 0 : 1,
                'type'     => $t->type,
                'client'   => $t->client,
                'line'     => $t->line,
                'from'     => $t->from_location,
                'to'       => $t->to_location,
                'truck_id' => $t->truck_id,
                'truck'    => $t->truck?->plate,
                'driver_id' => $t->driver_id,
                'driver'   => $t->driver ? "{$t->driver->first_name} {$t->driver->last_name}" : null,
                'status'   => $t->status,
            ]);

        $trucks  = Truck::whereNotIn('status', ['out_of_service', 'in_maintenance'])
            ->orderBy('plate')
            ->get()
            ->map(fn (Truck $t) => ['id' => $t->id, 'plate' => $t->plate]);
        $drivers = Driver::where('status', '!=', 'inactive')
            ->orderBy('last_name')
            ->get()
            ->map(fn (Driver $d) => ['id' => $d->id, 'name' => "{$d->first_name} {$d->last_name}"]);

        return Inertia::render('operations', [
            'dbTrips' => $trips,
            'trucks'  => $trucks,
            'drivers' => $drivers,
        ]);
    }
}
