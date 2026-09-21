<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Trip;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    private function clientRow(Client $c): array
    {
        return [
            'id' => $c->id,
            'name' => $c->name,
            'kind' => $c->kind,
            'tax_id' => $c->tax_id,
            'contact_name' => $c->contact_name,
            'contact_role' => $c->contact_role,
            'contact_phone' => $c->contact_phone,
            'contact_email' => $c->contact_email,
            'payment_terms' => $c->payment_terms,
            'credit_limit' => (float) $c->credit_limit,
            'status' => $c->status,
            'logo_path' => $c->logo_path,
            'client_since' => $c->client_since?->format('Y-m-d'),
            'initials' => $c->initials,
            'balance' => 0,
            'overdue' => 0,
            'open_invoices' => 0,
        ];
    }

    public function index(): Response
    {
        $clients = Client::orderBy('name')->get()
            ->map(fn (Client $c) => $this->clientRow($c));

        return Inertia::render('clients/index', ['clients' => $clients]);
    }

    public function create(): Response
    {
        return Inertia::render('clients/form', ['client' => null]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->canDo('clients', 'create'), 403, "You don't have permission to do that");

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'kind' => ['required', Rule::in(Client::KINDS)],
            'tax_id' => ['required', 'string', 'max:30', Rule::unique('clients', 'tax_id')],
            'contact_name' => ['nullable', 'string', 'max:100'],
            'contact_role' => ['nullable', 'string', 'max:80'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'contact_email' => ['nullable', 'email', 'max:120'],
            'payment_terms' => ['required', Rule::in(Client::PAYMENT_TERMS)],
            'credit_limit' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', Rule::in(Client::STATUSES)],
            'client_since' => ['nullable', 'date'],
            'logo' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo_path'] = $request->file('logo')->store('clients', 'public');
        }
        unset($validated['logo']);

        $client = Client::create($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$client->name} added to clients"]);

        return redirect()->route('clients.index');
    }

    public function show(Client $client): Response
    {
        $trips = Trip::with(['truck', 'driver'])
            ->where('client_id', $client->id)
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
                'driver_name' => $t->driver?->full_name,
                'status' => $t->status,
                'km' => (float) $t->km,
            ]);

        $completed = $trips->where('status', 'Completed')->count();
        $distanceKm = $trips->sum('km');

        return Inertia::render('clients/show', [
            'client' => $this->clientRow($client),
            'trips' => $trips,
            'metrics' => [
                'trips_total' => $trips->count(),
                'completed' => $completed,
                'distance_km' => $distanceKm,
                'last_trip_date' => $trips->first()['date'] ?? null,
            ],
        ]);
    }

    public function edit(Client $client): Response
    {
        return Inertia::render('clients/form', ['client' => $this->clientRow($client)]);
    }

    public function update(Request $request, Client $client): RedirectResponse
    {
        abort_unless($request->user()->canDo('clients', 'edit'), 403, "You don't have permission to do that");

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'kind' => ['required', Rule::in(Client::KINDS)],
            'tax_id' => ['required', 'string', 'max:30', Rule::unique('clients', 'tax_id')->ignore($client->id)],
            'contact_name' => ['nullable', 'string', 'max:100'],
            'contact_role' => ['nullable', 'string', 'max:80'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'contact_email' => ['nullable', 'email', 'max:120'],
            'payment_terms' => ['required', Rule::in(Client::PAYMENT_TERMS)],
            'credit_limit' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', Rule::in(Client::STATUSES)],
            'client_since' => ['nullable', 'date'],
            'logo' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('logo')) {
            if ($client->logo_path) {
                Storage::disk('public')->delete($client->logo_path);
            }
            $validated['logo_path'] = $request->file('logo')->store('clients', 'public');
        }
        unset($validated['logo']);

        $client->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$client->name} updated"]);

        return redirect()->route('clients.index');
    }

    public function destroy(Request $request, Client $client): RedirectResponse
    {
        abort_unless($request->user()->canDo('clients', 'delete'), 403, "You don't have permission to do that");

        $name = $client->name;

        if ($client->logo_path) {
            Storage::disk('public')->delete($client->logo_path);
        }

        $client->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "$name removed from clients"]);

        return redirect()->route('clients.index');
    }
}
