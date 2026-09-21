<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Trip;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DriverController extends Controller
{
    private function driverRow(Driver $d): array
    {
        return [
            'id' => $d->id,
            'first_name' => $d->first_name,
            'last_name' => $d->last_name,
            'national_id' => $d->national_id,
            'phone' => $d->phone,
            'emergency_contact' => $d->emergency_contact,
            'license_number' => $d->license_number,
            'license_category' => $d->license_category,
            'license_expires_at' => $d->license_expires_at?->format('Y-m-d'),
            'status' => $d->status,
            'notes' => $d->notes,
            'photo_path' => $d->photo_path,
        ];
    }

    public function index(): Response
    {
        $drivers = Driver::orderBy('last_name')->orderBy('first_name')->get()
            ->map(fn (Driver $d) => $this->driverRow($d));

        return Inertia::render('drivers/index', ['drivers' => $drivers]);
    }

    public function create(): Response
    {
        return Inertia::render('drivers/form', ['driver' => null]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->canDo('drivers', 'create'), 403, "You don't have permission to do that");

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:60'],
            'last_name' => ['required', 'string', 'max:60'],
            'national_id' => ['nullable', 'string', 'max:30'],
            'phone' => ['nullable', 'string', 'max:30'],
            'emergency_contact' => ['nullable', 'string', 'max:120'],
            'license_number' => ['required', 'string', 'max:30', Rule::unique('drivers', 'license_number')],
            'license_category' => ['nullable', Rule::in(Driver::LICENSE_CATEGORIES)],
            'license_expires_at' => ['nullable', 'date'],
            'status' => ['required', Rule::in(Driver::STATUSES)],
            'notes' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ]);

        $validated['license_number'] = strtoupper($validated['license_number']);

        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('drivers', 'public');
        }
        unset($validated['photo']);

        $driver = Driver::create($validated);

        $name = "{$driver->first_name} {$driver->last_name}";
        Inertia::flash('toast', ['type' => 'success', 'message' => "$name added to the crew"]);

        return redirect()->route('drivers.index');
    }

    public function show(Driver $driver): Response
    {
        $trips = Trip::with('truck')
            ->where('driver_id', $driver->id)
            ->orderByDesc('date')
            ->get()
            ->map(fn (Trip $t) => [
                'id' => $t->id,
                'date' => $t->date->format('Y-m-d'),
                'type' => $t->type,
                'client' => $t->client,
                'line' => $t->line,
                'from_location' => $t->from_location,
                'to_location' => $t->to_location,
                'truck_plate' => $t->truck?->plate,
                'status' => $t->status,
                'km' => (float) $t->km,
            ]);

        $completedTrips = $trips->where('status', 'Completed');
        $distanceKm = $trips->sum('km');

        return Inertia::render('drivers/show', [
            'driver' => $this->driverRow($driver),
            'trips' => $trips,
            'metrics' => [
                'trips_total' => $trips->count(),
                'completed' => $completedTrips->count(),
                'distance_km' => $distanceKm,
                'last_trip_date' => ($trips->first())['date'] ?? null,
            ],
        ]);
    }

    public function edit(Driver $driver): Response
    {
        return Inertia::render('drivers/form', ['driver' => $this->driverRow($driver)]);
    }

    public function update(Request $request, Driver $driver): RedirectResponse
    {
        abort_unless($request->user()->canDo('drivers', 'edit'), 403, "You don't have permission to do that");

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:60'],
            'last_name' => ['required', 'string', 'max:60'],
            'national_id' => ['nullable', 'string', 'max:30'],
            'phone' => ['nullable', 'string', 'max:30'],
            'emergency_contact' => ['nullable', 'string', 'max:120'],
            'license_number' => ['required', 'string', 'max:30', Rule::unique('drivers', 'license_number')->ignore($driver->id)],
            'license_category' => ['nullable', Rule::in(Driver::LICENSE_CATEGORIES)],
            'license_expires_at' => ['nullable', 'date'],
            'status' => ['required', Rule::in(Driver::STATUSES)],
            'notes' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ]);

        $validated['license_number'] = strtoupper($validated['license_number']);

        if ($request->hasFile('photo')) {
            if ($driver->photo_path) {
                Storage::disk('public')->delete($driver->photo_path);
            }
            $validated['photo_path'] = $request->file('photo')->store('drivers', 'public');
        }
        unset($validated['photo']);

        $driver->update($validated);

        $name = "{$driver->first_name} {$driver->last_name}";
        Inertia::flash('toast', ['type' => 'success', 'message' => "$name updated"]);

        return redirect()->route('drivers.index');
    }

    public function destroy(Request $request, Driver $driver): RedirectResponse
    {
        abort_unless($request->user()->canDo('drivers', 'delete'), 403, "You don't have permission to do that");

        $name = $driver->full_name;

        if ($driver->photo_path) {
            Storage::disk('public')->delete($driver->photo_path);
        }

        $driver->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "$name removed from the crew"]);

        return redirect()->route('drivers.index');
    }
}
