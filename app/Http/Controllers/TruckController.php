<?php

namespace App\Http\Controllers;

use App\Models\BodyType;
use App\Models\Trip;
use App\Models\Truck;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TruckController extends Controller
{
    public function index(): Response
    {
        $trucks = Truck::orderBy('plate')->get()->map(fn (Truck $t) => [
            'id' => $t->id,
            'plate' => $t->plate,
            'vin' => $t->vin,
            'make' => $t->make,
            'model' => $t->model,
            'year' => $t->year,
            'type' => $t->type,
            'capacity_tons' => $t->capacity_tons,
            'odometer_km' => $t->odometer_km,
            'status' => $t->status,
            'insurance_expires_at' => $t->insurance_expires_at?->format('Y-m-d'),
            'inspection_expires_at' => $t->inspection_expires_at?->format('Y-m-d'),
            'photo_path' => $t->photo_path,
        ]);

        return Inertia::render('trucks/index', ['trucks' => $trucks]);
    }

    public function create(): Response
    {
        return Inertia::render('trucks/form', [
            'truck' => null,
            'bodyTypes' => BodyType::orderBy('sort_order')->pluck('name')->toArray(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->canDo('trucks', 'create'), 403, "You don't have permission to do that");

        $validated = $request->validate([
            'plate' => ['required', 'string', 'max:30', Rule::unique('trucks', 'plate')],
            'vin' => ['nullable', 'string', 'max:50'],
            'make' => ['required', 'string', 'max:60'],
            'model' => ['nullable', 'string', 'max:60'],
            'year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'type' => ['nullable', 'string', 'max:60'],
            'capacity_tons' => ['nullable', 'numeric', 'min:0'],
            'odometer_km' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', Rule::in(Truck::STATUSES)],
            'insurance_expires_at' => ['nullable', 'date'],
            'inspection_expires_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ]);

        $validated['plate'] = strtoupper(str_replace(' ', '', $validated['plate']));

        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('trucks', 'public');
        }

        unset($validated['photo']);

        Truck::create($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$validated['plate']} added to the fleet"]);

        return redirect()->route('trucks.index');
    }

    public function show(Truck $truck): Response
    {
        $trips = Trip::with('driver')
            ->where('truck_id', $truck->id)
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
                'driver_name' => $t->driver?->full_name,
                'status' => $t->status,
                'km' => (float) $t->km,
            ]);

        $completedTrips = $trips->where('status', 'Completed');
        $distanceKm = $trips->sum('km');

        return Inertia::render('trucks/show', [
            'truck' => [
                'id' => $truck->id,
                'plate' => $truck->plate,
                'vin' => $truck->vin,
                'make' => $truck->make,
                'model' => $truck->model,
                'year' => $truck->year,
                'type' => $truck->type,
                'capacity_tons' => $truck->capacity_tons,
                'odometer_km' => $truck->odometer_km,
                'status' => $truck->status,
                'insurance_expires_at' => $truck->insurance_expires_at?->format('Y-m-d'),
                'inspection_expires_at' => $truck->inspection_expires_at?->format('Y-m-d'),
                'notes' => $truck->notes,
                'photo_path' => $truck->photo_path,
            ],
            'trips' => $trips,
            'metrics' => [
                'trips_total' => $trips->count(),
                'completed' => $completedTrips->count(),
                'distance_km' => $distanceKm,
                'last_trip_date' => ($trips->first())['date'] ?? null,
            ],
        ]);
    }

    public function edit(Truck $truck): Response
    {
        return Inertia::render('trucks/form', [
            'truck' => [
                'id' => $truck->id,
                'plate' => $truck->plate,
                'vin' => $truck->vin,
                'make' => $truck->make,
                'model' => $truck->model,
                'year' => $truck->year,
                'type' => $truck->type,
                'capacity_tons' => $truck->capacity_tons,
                'odometer_km' => $truck->odometer_km,
                'status' => $truck->status,
                'insurance_expires_at' => $truck->insurance_expires_at?->format('Y-m-d'),
                'inspection_expires_at' => $truck->inspection_expires_at?->format('Y-m-d'),
                'notes' => $truck->notes,
                'photo_path' => $truck->photo_path,
            ],
            'bodyTypes' => BodyType::orderBy('sort_order')->pluck('name')->toArray(),
        ]);
    }

    public function update(Request $request, Truck $truck): RedirectResponse
    {
        abort_unless($request->user()->canDo('trucks', 'edit'), 403, "You don't have permission to do that");

        $validated = $request->validate([
            'plate' => ['required', 'string', 'max:30', Rule::unique('trucks', 'plate')->ignore($truck->id)],
            'vin' => ['nullable', 'string', 'max:50'],
            'make' => ['required', 'string', 'max:60'],
            'model' => ['nullable', 'string', 'max:60'],
            'year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'type' => ['nullable', 'string', 'max:60'],
            'capacity_tons' => ['nullable', 'numeric', 'min:0'],
            'odometer_km' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', Rule::in(Truck::STATUSES)],
            'insurance_expires_at' => ['nullable', 'date'],
            'inspection_expires_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ]);

        $validated['plate'] = strtoupper(str_replace(' ', '', $validated['plate']));

        if ($request->hasFile('photo')) {
            if ($truck->photo_path) {
                Storage::disk('public')->delete($truck->photo_path);
            }
            $validated['photo_path'] = $request->file('photo')->store('trucks', 'public');
        }

        unset($validated['photo']);

        $truck->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$validated['plate']} updated"]);

        return redirect()->route('trucks.index');
    }

    public function destroy(Request $request, Truck $truck): RedirectResponse
    {
        abort_unless($request->user()->canDo('trucks', 'delete'), 403, "You don't have permission to do that");

        $plate = $truck->plate;

        if ($truck->photo_path) {
            Storage::disk('public')->delete($truck->photo_path);
        }

        $truck->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "$plate removed from the fleet"]);

        return redirect()->route('trucks.index');
    }
}
