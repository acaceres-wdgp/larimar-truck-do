<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\Client;
use App\Models\Driver;
use App\Models\Order;
use App\Models\Port;
use App\Models\ShippingLine;
use App\Models\Trip;
use App\Models\Truck;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TripController extends Controller
{
    private function formData(?Trip $trip = null): array
    {
        $today = now()->toDateString();
        $nextOrder = 'TRP-'.(1000 + Trip::count() + 1);

        return [
            'trip' => $trip ? $this->tripRow($trip) : null,
            'next_order' => $nextOrder,
            'clients' => Client::where('status', 'Active')->orderBy('name')->get()->map(fn ($c) => ['id' => $c->id, 'name' => $c->name]),
            'shipping_lines' => ShippingLine::where('active', true)->orderBy('name')->get()->map(fn ($l) => ['id' => $l->id, 'name' => $l->name]),
            'cities' => City::where('active', true)->orderBy('name')->get()->map(fn ($c) => ['id' => $c->id, 'name' => $c->name, 'km' => $c->km_from_base]),
            'ports' => Port::where('active', true)->orderBy('name')->get()->map(fn ($p) => ['id' => $p->id, 'name' => $p->name, 'km' => $p->km_from_base]),
            'trucks' => Truck::whereNotIn('status', ['out_of_service', 'in_maintenance'])->orderBy('plate')->get()->map(fn ($t) => ['id' => $t->id, 'plate' => $t->plate]),
            'drivers' => Driver::where('status', '!=', 'inactive')->orderBy('last_name')->get()->map(fn ($d) => ['id' => $d->id, 'name' => "{$d->first_name} {$d->last_name}"]),
            'active_trips' => Trip::whereNotIn('status', ['Completed', 'Cancelled'])
                ->whereNotNull('truck_id')
                ->get()
                ->map(fn (Trip $t) => [
                    'trip_id' => $t->id,
                    'truck_id' => $t->truck_id,
                    'driver_id' => $t->driver_id,
                    'date' => $t->date->toDateString(),
                    'type' => $t->type,
                    'origin_type' => $t->origin_type,
                    'origin_id' => $t->origin_id,
                    'destination_type' => $t->destination_type,
                    'destination_id' => $t->destination_id,
                ]),
            'today' => $today,
        ];
    }

    private function tripRow(Trip $t): array
    {
        return [
            'id' => $t->id,
            'order_number' => $t->order_number,
            'direction' => $t->type,
            'trip_date' => $t->date?->format('Y-m-d'),
            'client_id' => $t->client_id,
            'shipping_line_id' => $t->shipping_line_id,
            'origin_type' => $t->origin_type,
            'origin_id' => $t->origin_id,
            'destination_type' => $t->destination_type,
            'destination_id' => $t->destination_id,
            'distance_km' => $t->km,
            'status' => $t->status,
            'container_number' => $t->container_number,
            'container_size' => $t->container_size ?? "40'",
            'cargo_type' => $t->cargo_type ?? 'Dry',
            'weight_tons' => $t->weight_tons,
            'truck_id' => $t->truck_id,
            'driver_id' => $t->driver_id,
            'rate' => $t->rate,
            'fuel_cost' => $t->fuel_cost,
            'toll_cost' => $t->toll_cost,
            'driver_pay' => $t->driver_pay,
        ];
    }

    // ── Truck availability check ──────────────────────────────────────────────

    private function truckConflict(
        int $truckId,
        string $date,
        string $type,
        string $originType,
        int $originId,
        string $destType,
        int $destId,
        ?int $excludeTripId = null,
    ): ?string {
        $conflicts = Trip::where('truck_id', $truckId)
            ->whereDate('date', $date)
            ->whereNotIn('status', ['Completed', 'Cancelled'])
            ->when($excludeTripId, fn ($q) => $q->where('id', '!=', $excludeTripId))
            ->get();

        foreach ($conflicts as $existing) {
            // Same trip type on the same day → never allowed
            if ($existing->type === $type) {
                return "This truck is already assigned to another {$type} trip on {$date}.";
            }

            // Different types (import + export): allowed only when they share the same port.
            // Import origin = port; Export destination = port.
            $newPort = $type === 'import'
                ? ($originType === 'port' ? $originId : null)
                : ($destType === 'port' ? $destId : null);

            $existPort = $existing->type === 'import'
                ? ($existing->origin_type === 'port' ? $existing->origin_id : null)
                : ($existing->destination_type === 'port' ? $existing->destination_id : null);

            if ($newPort && $existPort && $newPort === $existPort) {
                continue; // Same port — the import/export back-haul combo is valid
            }

            return "This truck is already in use on {$date}. An import and export can share a truck only when they use the same port.";
        }

        return null;
    }

    // ── Driver availability check ─────────────────────────────────────────────

    private function driverConflict(
        int $driverId,
        string $date,
        string $type,
        ?int $excludeTripId = null,
    ): ?string {
        $conflict = Trip::where('driver_id', $driverId)
            ->whereDate('date', $date)
            ->where('type', $type)
            ->whereNotIn('status', ['Completed', 'Cancelled'])
            ->when($excludeTripId, fn ($q) => $q->where('id', '!=', $excludeTripId))
            ->exists();

        if ($conflict) {
            return "This driver is already assigned to another {$type} trip on {$date}.";
        }

        return null;
    }

    // ── Sync truck status after a trip status change ──────────────────────────

    private function syncTruckStatus(Trip $trip, string $newTripStatus): void
    {
        if (! $trip->truck_id) {
            return;
        }

        if (in_array($newTripStatus, ['Completed', 'Cancelled'])) {
            // Only mark the truck available if it has no other active trips
            $stillBusy = Trip::where('truck_id', $trip->truck_id)
                ->where('id', '!=', $trip->id)
                ->whereNotIn('status', ['Completed', 'Cancelled'])
                ->exists();

            if (! $stillBusy) {
                Truck::where('id', $trip->truck_id)->update(['status' => 'available']);
            }
        } else {
            Truck::where('id', $trip->truck_id)->update(['status' => 'on_trip']);
        }
    }

    public function updateStatus(Request $request, Trip $trip): JsonResponse
    {
        abort_unless($request->user()->canDo('trips', 'edit'), 403, "You don't have permission to do that");

        $request->validate([
            'status' => ['required', Rule::in(Trip::STATUSES)],
        ]);

        $this->syncTruckStatus($trip, $request->status);
        $trip->update(['status' => $request->status]);

        $order = Order::where('trip_id', $trip->id)->first();
        if ($order) {
            $newStatus = $request->status;
            if ($newStatus === 'Completed') {
                $order->update(['status' => 'ready', 'completed_at' => now()]);
            } elseif ($newStatus === 'Cancelled') {
                $order->update(['status' => 'cancelled']);
            } elseif (in_array($newStatus, ['Scheduled', 'At port', 'On the road', 'Paused', 'Delayed'])) {
                if (in_array($order->status, ['cancelled', 'ready'])) {
                    $order->update(['status' => 'open', 'completed_at' => null]);
                }
            }
        }

        return response()->json(['ok' => true]);
    }

    public function create(): Response
    {
        return Inertia::render('trips/form', $this->formData());
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->canDo('trips', 'create'), 403, "You don't have permission to do that");

        $validated = $request->validate([
            'order_number' => ['nullable', 'string', 'max:30'],
            'direction' => ['required', 'in:import,export'],
            'trip_date' => ['required', 'date'],
            'client_id' => ['required', 'exists:clients,id'],
            'shipping_line_id' => ['required', 'exists:shipping_lines,id'],
            'origin_type' => ['required', 'in:city,port'],
            'origin_id' => ['required', 'integer'],
            'destination_type' => ['required', 'in:city,port'],
            'destination_id' => ['required', 'integer'],
            'distance_km' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string'],
            'container_number' => ['nullable', 'string', 'max:30'],
            'container_size' => ['nullable', 'string', 'max:20'],
            'cargo_type' => ['nullable', 'string', 'max:30'],
            'weight_tons' => ['nullable', 'numeric', 'min:0'],
            'truck_id' => ['required', 'exists:trucks,id'],
            'driver_id' => ['required', 'exists:drivers,id'],
            'rate' => ['nullable', 'numeric', 'min:0'],
            'fuel_cost' => ['nullable', 'numeric', 'min:0'],
            'toll_cost' => ['nullable', 'numeric', 'min:0'],
            'driver_pay' => ['nullable', 'numeric', 'min:0'],
        ]);

        if ($validated['origin_type'] === $validated['destination_type'] &&
            (int) $validated['origin_id'] === (int) $validated['destination_id']) {
            return back()->withErrors(['destination_id' => "Origin and destination can't be the same place."]);
        }

        $conflict = $this->truckConflict(
            (int) $validated['truck_id'],
            $validated['trip_date'],
            $validated['direction'],
            $validated['origin_type'],
            (int) $validated['origin_id'],
            $validated['destination_type'],
            (int) $validated['destination_id'],
        );
        if ($conflict) {
            return back()->withErrors(['truck_id' => $conflict]);
        }

        $driverConflict = $this->driverConflict(
            (int) $validated['driver_id'],
            $validated['trip_date'],
            $validated['direction'],
        );
        if ($driverConflict) {
            return back()->withErrors(['driver_id' => $driverConflict]);
        }

        $originName = $validated['origin_type'] === 'city'
            ? City::find($validated['origin_id'])?->name
            : Port::find($validated['origin_id'])?->name;
        $destinationName = $validated['destination_type'] === 'city'
            ? City::find($validated['destination_id'])?->name
            : Port::find($validated['destination_id'])?->name;

        $client = Client::find($validated['client_id']);
        $line = ShippingLine::find($validated['shipping_line_id']);

        // Auto-calculate driver_pay if driver has pay_rate and driver_pay not set
        $driverPay = $validated['driver_pay'] ?? null;
        if (! $driverPay && $validated['driver_id']) {
            $driver = Driver::find($validated['driver_id']);
            if ($driver && $driver->pay_rate) {
                $driverPay = $driver->pay_type === 'percentage'
                    ? round(($validated['rate'] ?? 0) * ($driver->pay_rate / 100), 2)
                    : $driver->pay_rate;
            }
        }

        $trip = Trip::create([
            'order_number' => $validated['order_number'] ?: 'TRP-'.(1000 + Trip::count() + 1),
            'type' => $validated['direction'],
            'date' => $validated['trip_date'],
            'client_id' => $validated['client_id'],
            'client' => $client?->name ?? '',
            'shipping_line_id' => $validated['shipping_line_id'],
            'line' => $line?->name ?? '',
            'origin_type' => $validated['origin_type'],
            'origin_id' => $validated['origin_id'],
            'destination_type' => $validated['destination_type'],
            'destination_id' => $validated['destination_id'],
            'from_location' => $originName ?? '',
            'to_location' => $destinationName ?? '',
            'km' => $validated['distance_km'] ?? 0,
            'status' => $validated['status'] ?? 'Scheduled',
            'container_number' => $validated['container_number'],
            'container_size' => $validated['container_size'] ?? "40'",
            'cargo_type' => $validated['cargo_type'] ?? 'Dry',
            'weight_tons' => $validated['weight_tons'],
            'truck_id' => $validated['truck_id'],
            'driver_id' => $validated['driver_id'],
            'rate' => $validated['rate'],
            'fuel_cost' => $validated['fuel_cost'],
            'toll_cost' => $validated['toll_cost'],
            'driver_pay' => $driverPay,
        ]);

        Order::create([
            'trip_id' => $trip->id,
            'client_id' => $trip->client_id,
            'client' => $trip->client,
            'date' => $trip->date,
            'status' => 'open',
        ]);

        // Mark truck as on_trip
        if ($trip->truck_id && ! in_array($trip->status, ['Completed', 'Cancelled'])) {
            Truck::where('id', $trip->truck_id)->update(['status' => 'on_trip']);
        }

        $today = now()->toDateString();
        $tomorrow = now()->addDay()->toDateString();
        $tripDate = $validated['trip_date'];

        if ($tripDate === $today || $tripDate === $tomorrow) {
            Inertia::flash('toast', ['type' => 'success', 'message' => "Trip scheduled — {$client?->name} added to the board"]);
        } else {
            Inertia::flash('toast', ['type' => 'success', 'message' => "Trip scheduled for {$tripDate}"]);
        }

        return redirect()->route('dashboard');
    }

    public function edit(Trip $trip): Response
    {
        return Inertia::render('trips/form', $this->formData($trip));
    }

    public function update(Request $request, Trip $trip): RedirectResponse
    {
        abort_unless($request->user()->canDo('trips', 'edit'), 403, "You don't have permission to do that");

        $validated = $request->validate([
            'order_number' => ['nullable', 'string', 'max:30'],
            'direction' => ['required', 'in:import,export'],
            'trip_date' => ['required', 'date'],
            'client_id' => ['required', 'exists:clients,id'],
            'shipping_line_id' => ['required', 'exists:shipping_lines,id'],
            'origin_type' => ['required', 'in:city,port'],
            'origin_id' => ['required', 'integer'],
            'destination_type' => ['required', 'in:city,port'],
            'destination_id' => ['required', 'integer'],
            'distance_km' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string'],
            'container_number' => ['nullable', 'string', 'max:30'],
            'container_size' => ['nullable', 'string', 'max:20'],
            'cargo_type' => ['nullable', 'string', 'max:30'],
            'weight_tons' => ['nullable', 'numeric', 'min:0'],
            'truck_id' => ['nullable', 'exists:trucks,id'],
            'driver_id' => ['nullable', 'exists:drivers,id'],
            'rate' => ['nullable', 'numeric', 'min:0'],
            'fuel_cost' => ['nullable', 'numeric', 'min:0'],
            'toll_cost' => ['nullable', 'numeric', 'min:0'],
            'driver_pay' => ['nullable', 'numeric', 'min:0'],
        ]);

        if ($validated['origin_type'] === $validated['destination_type'] &&
            (int) $validated['origin_id'] === (int) $validated['destination_id']) {
            return back()->withErrors(['destination_id' => "Origin and destination can't be the same place."]);
        }

        if ($validated['truck_id'] && ! in_array($validated['status'], ['Completed', 'Cancelled'])) {
            $conflict = $this->truckConflict(
                (int) $validated['truck_id'],
                $validated['trip_date'],
                $validated['direction'],
                $validated['origin_type'],
                (int) $validated['origin_id'],
                $validated['destination_type'],
                (int) $validated['destination_id'],
                $trip->id,
            );
            if ($conflict) {
                return back()->withErrors(['truck_id' => $conflict]);
            }
        }

        if ($validated['driver_id'] && ! in_array($validated['status'], ['Completed', 'Cancelled'])) {
            $driverConflict = $this->driverConflict(
                (int) $validated['driver_id'],
                $validated['trip_date'],
                $validated['direction'],
                $trip->id,
            );
            if ($driverConflict) {
                return back()->withErrors(['driver_id' => $driverConflict]);
            }
        }

        $originName = $validated['origin_type'] === 'city'
            ? City::find($validated['origin_id'])?->name
            : Port::find($validated['origin_id'])?->name;
        $destinationName = $validated['destination_type'] === 'city'
            ? City::find($validated['destination_id'])?->name
            : Port::find($validated['destination_id'])?->name;

        $client = Client::find($validated['client_id']);
        $line = ShippingLine::find($validated['shipping_line_id']);

        // Auto-calculate driver_pay if driver has pay_rate and driver_pay not set
        $driverPay = $validated['driver_pay'] ?? null;
        if (! $driverPay && $validated['driver_id']) {
            $driver = Driver::find($validated['driver_id']);
            if ($driver && $driver->pay_rate) {
                $driverPay = $driver->pay_type === 'percentage'
                    ? round(($validated['rate'] ?? 0) * ($driver->pay_rate / 100), 2)
                    : $driver->pay_rate;
            }
        }

        $trip->update([
            'order_number' => $validated['order_number'],
            'type' => $validated['direction'],
            'date' => $validated['trip_date'],
            'client_id' => $validated['client_id'],
            'client' => $client?->name ?? '',
            'shipping_line_id' => $validated['shipping_line_id'],
            'line' => $line?->name ?? '',
            'origin_type' => $validated['origin_type'],
            'origin_id' => $validated['origin_id'],
            'destination_type' => $validated['destination_type'],
            'destination_id' => $validated['destination_id'],
            'from_location' => $originName ?? '',
            'to_location' => $destinationName ?? '',
            'km' => $validated['distance_km'] ?? $trip->km,
            'status' => $validated['status'],
            'container_number' => $validated['container_number'],
            'container_size' => $validated['container_size'],
            'cargo_type' => $validated['cargo_type'],
            'weight_tons' => $validated['weight_tons'],
            'truck_id' => $validated['truck_id'],
            'driver_id' => $validated['driver_id'],
            'rate' => $validated['rate'],
            'fuel_cost' => $validated['fuel_cost'],
            'toll_cost' => $validated['toll_cost'],
            'driver_pay' => $driverPay,
        ]);

        $order = Order::where('trip_id', $trip->id)->first();
        if ($order) {
            $newStatus = $validated['status'];
            if ($newStatus === 'Completed') {
                if ($order->status !== 'ready') {
                    $order->update(['status' => 'ready', 'completed_at' => now()]);
                }
            } elseif ($newStatus === 'Cancelled') {
                $order->update(['status' => 'cancelled']);
            } elseif (in_array($newStatus, ['Scheduled', 'At port', 'On the road', 'Paused', 'Delayed'])) {
                if (in_array($order->status, ['cancelled', 'ready'])) {
                    $order->update(['status' => 'open', 'completed_at' => null]);
                }
            }
            // Sync client info if changed
            $order->update([
                'client_id' => $trip->client_id,
                'client' => $trip->client,
                'date' => $trip->date,
            ]);
        }

        // Sync truck status based on the updated trip status
        $this->syncTruckStatus($trip->fresh(), $validated['status']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Trip updated']);

        return redirect()->route('dashboard');
    }

    public function assign(Request $request, Trip $trip): JsonResponse
    {
        abort_unless($request->user()->canDo('trips', 'edit'), 403);

        $validated = $request->validate([
            'truck_id' => ['nullable', 'exists:trucks,id'],
            'driver_id' => ['nullable', 'exists:drivers,id'],
        ]);

        // Validate truck availability (skip if clearing the truck or trip is already done)
        if ($validated['truck_id'] && ! in_array($trip->status, ['Completed', 'Cancelled'])) {
            $conflict = $this->truckConflict(
                (int) $validated['truck_id'],
                $trip->date->toDateString(),
                $trip->type,
                $trip->origin_type,
                (int) $trip->origin_id,
                $trip->destination_type,
                (int) $trip->destination_id,
                $trip->id,
            );
            if ($conflict) {
                return response()->json(['ok' => false, 'error' => $conflict], 422);
            }
        }

        // Validate driver availability (skip if clearing or trip is already done)
        if (isset($validated['driver_id']) && $validated['driver_id'] && ! in_array($trip->status, ['Completed', 'Cancelled'])) {
            $driverConflict = $this->driverConflict(
                (int) $validated['driver_id'],
                $trip->date->toDateString(),
                $trip->type,
                $trip->id,
            );
            if ($driverConflict) {
                return response()->json(['ok' => false, 'error' => $driverConflict], 422);
            }
        }

        // Release old truck if it's being swapped out
        $oldTruckId = $trip->truck_id;
        if ($oldTruckId && $oldTruckId !== (int) $validated['truck_id']) {
            $stillBusy = Trip::where('truck_id', $oldTruckId)
                ->where('id', '!=', $trip->id)
                ->whereNotIn('status', ['Completed', 'Cancelled'])
                ->exists();
            if (! $stillBusy) {
                Truck::where('id', $oldTruckId)->update(['status' => 'available']);
            }
        }

        $trip->update([
            'truck_id' => $validated['truck_id'],
            'driver_id' => array_key_exists('driver_id', $validated) ? $validated['driver_id'] : $trip->driver_id,
        ]);

        // Mark new truck as on_trip if trip is active
        if ($validated['truck_id'] && ! in_array($trip->status, ['Completed', 'Cancelled'])) {
            Truck::where('id', $validated['truck_id'])->update(['status' => 'on_trip']);
        }

        return response()->json(['ok' => true]);
    }
}
