<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Port;
use App\Models\ShippingLine;
use App\Models\Trip;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    private function catalogData(): array
    {
        return [
            'lines' => ShippingLine::withCount('trips')->orderBy('name')->get()->map(fn ($l) => [
                'id' => $l->id,
                'name' => $l->name,
                'scac' => $l->scac,
                'contact' => $l->contact,
                'active' => $l->active,
                'trips_count' => $l->trips_count,
            ]),
            'cities' => City::orderBy('name')->get()->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'province' => $c->province,
                'km_from_base' => $c->km_from_base,
                'active' => $c->active,
                'trips_count' => Trip::where(function ($q) use ($c) {
                    $q->where('origin_type', 'city')->where('origin_id', $c->id)
                        ->orWhere(function ($q2) use ($c) {
                            $q2->where('destination_type', 'city')->where('destination_id', $c->id);
                        });
                })->count(),
            ]),
            'ports' => Port::orderBy('name')->get()->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'code' => $p->code,
                'km_from_base' => $p->km_from_base,
                'active' => $p->active,
                'trips_count' => Trip::where(function ($q) use ($p) {
                    $q->where('origin_type', 'port')->where('origin_id', $p->id)
                        ->orWhere(function ($q2) use ($p) {
                            $q2->where('destination_type', 'port')->where('destination_id', $p->id);
                        });
                })->count(),
            ]),
        ];
    }

    public function index(Request $request): Response
    {
        return Inertia::render('settings/catalogs', array_merge($this->catalogData(), [
            'initialTab' => session('catalog_tab', 'Shipping lines'),
        ]));
    }

    // ─── Shipping lines ────────────────────────────────────────────────────────

    public function storeLine(Request $request): RedirectResponse
    {
        abort_unless($request->user()->canDo('settings', 'create'), 403, "You don't have permission to do that");

        $data = $request->validate([
            'name' => ['required', 'string', 'max:80', 'unique:shipping_lines,name'],
            'scac' => ['nullable', 'string', 'max:10'],
            'contact' => ['nullable', 'string', 'max:160'],
        ]);
        $line = ShippingLine::create(array_merge($data, ['active' => true]));
        Inertia::flash('toast', ['type' => 'success', 'message' => "{$line->name} added to Shipping lines"]);

        return redirect()->route('catalogs.index')->with('catalog_tab', 'Shipping lines');
    }

    public function updateLine(Request $request, ShippingLine $line): RedirectResponse
    {
        abort_unless($request->user()->canDo('settings', 'edit'), 403, "You don't have permission to do that");

        $data = $request->validate([
            'name' => ['required', 'string', 'max:80', Rule::unique('shipping_lines', 'name')->ignore($line->id)],
            'scac' => ['nullable', 'string', 'max:10'],
            'contact' => ['nullable', 'string', 'max:160'],
        ]);
        $line->update($data);
        Inertia::flash('toast', ['type' => 'success', 'message' => "{$line->name} updated"]);

        return redirect()->route('catalogs.index')->with('catalog_tab', 'Shipping lines');
    }

    public function destroyLine(Request $request, ShippingLine $line): RedirectResponse
    {
        abort_unless($request->user()->canDo('settings', 'delete'), 403, "You don't have permission to do that");

        $n = $line->trips()->count();
        if ($n > 0) {
            Inertia::flash('toast', ['type' => 'warning', 'message' => "{$line->name} is used on {$n} trips — set it inactive instead"]);

            return redirect()->route('catalogs.index')->with('catalog_tab', 'Shipping lines');
        }
        $name = $line->name;
        $line->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => "$name deleted"]);

        return redirect()->route('catalogs.index')->with('catalog_tab', 'Shipping lines');
    }

    public function toggleLine(Request $request, ShippingLine $line): RedirectResponse
    {
        abort_unless($request->user()->canDo('settings', 'edit'), 403, "You don't have permission to do that");

        $line->update(['active' => ! $line->active]);

        return redirect()->route('catalogs.index')->with('catalog_tab', 'Shipping lines');
    }

    // ─── Cities ────────────────────────────────────────────────────────────────

    public function storeCity(Request $request): RedirectResponse
    {
        abort_unless($request->user()->canDo('settings', 'create'), 403, "You don't have permission to do that");

        $data = $request->validate([
            'name' => ['required', 'string', 'max:80', 'unique:cities,name'],
            'province' => ['nullable', 'string', 'max:80'],
            'km_from_base' => ['nullable', 'integer', 'min:0'],
        ]);
        $city = City::create(array_merge($data, ['active' => true, 'km_from_base' => $data['km_from_base'] ?? 0]));
        Inertia::flash('toast', ['type' => 'success', 'message' => "{$city->name} added to Cities"]);

        return redirect()->route('catalogs.index')->with('catalog_tab', 'Cities');
    }

    public function updateCity(Request $request, City $city): RedirectResponse
    {
        abort_unless($request->user()->canDo('settings', 'edit'), 403, "You don't have permission to do that");

        $data = $request->validate([
            'name' => ['required', 'string', 'max:80', Rule::unique('cities', 'name')->ignore($city->id)],
            'province' => ['nullable', 'string', 'max:80'],
            'km_from_base' => ['nullable', 'integer', 'min:0'],
        ]);
        $city->update($data);
        Inertia::flash('toast', ['type' => 'success', 'message' => "{$city->name} updated"]);

        return redirect()->route('catalogs.index')->with('catalog_tab', 'Cities');
    }

    public function destroyCity(Request $request, City $city): RedirectResponse
    {
        abort_unless($request->user()->canDo('settings', 'delete'), 403, "You don't have permission to do that");

        $count = Trip::where(function ($q) use ($city) {
            $q->where('origin_type', 'city')->where('origin_id', $city->id)
                ->orWhere(function ($q2) use ($city) {
                    $q2->where('destination_type', 'city')->where('destination_id', $city->id);
                });
        })->count();
        if ($count > 0) {
            Inertia::flash('toast', ['type' => 'warning', 'message' => "{$city->name} is used on {$count} trips — set it inactive instead"]);

            return redirect()->route('catalogs.index')->with('catalog_tab', 'Cities');
        }
        $name = $city->name;
        $city->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => "$name deleted"]);

        return redirect()->route('catalogs.index')->with('catalog_tab', 'Cities');
    }

    public function toggleCity(Request $request, City $city): RedirectResponse
    {
        abort_unless($request->user()->canDo('settings', 'edit'), 403, "You don't have permission to do that");

        $city->update(['active' => ! $city->active]);

        return redirect()->route('catalogs.index')->with('catalog_tab', 'Cities');
    }

    // ─── Ports ─────────────────────────────────────────────────────────────────

    public function storePort(Request $request): RedirectResponse
    {
        abort_unless($request->user()->canDo('settings', 'create'), 403, "You don't have permission to do that");

        $data = $request->validate([
            'name' => ['required', 'string', 'max:80', 'unique:ports,name'],
            'code' => ['nullable', 'string', 'max:10'],
            'km_from_base' => ['nullable', 'integer', 'min:0'],
        ]);
        $port = Port::create(array_merge($data, ['active' => true, 'km_from_base' => $data['km_from_base'] ?? 0]));
        Inertia::flash('toast', ['type' => 'success', 'message' => "{$port->name} added to Ports"]);

        return redirect()->route('catalogs.index')->with('catalog_tab', 'Ports');
    }

    public function updatePort(Request $request, Port $port): RedirectResponse
    {
        abort_unless($request->user()->canDo('settings', 'edit'), 403, "You don't have permission to do that");

        $data = $request->validate([
            'name' => ['required', 'string', 'max:80', Rule::unique('ports', 'name')->ignore($port->id)],
            'code' => ['nullable', 'string', 'max:10'],
            'km_from_base' => ['nullable', 'integer', 'min:0'],
        ]);
        $port->update($data);
        Inertia::flash('toast', ['type' => 'success', 'message' => "{$port->name} updated"]);

        return redirect()->route('catalogs.index')->with('catalog_tab', 'Ports');
    }

    public function destroyPort(Request $request, Port $port): RedirectResponse
    {
        abort_unless($request->user()->canDo('settings', 'delete'), 403, "You don't have permission to do that");

        $count = Trip::where(function ($q) use ($port) {
            $q->where('origin_type', 'port')->where('origin_id', $port->id)
                ->orWhere(function ($q2) use ($port) {
                    $q2->where('destination_type', 'port')->where('destination_id', $port->id);
                });
        })->count();
        if ($count > 0) {
            Inertia::flash('toast', ['type' => 'warning', 'message' => "{$port->name} is used on {$count} trips — set it inactive instead"]);

            return redirect()->route('catalogs.index')->with('catalog_tab', 'Ports');
        }
        $name = $port->name;
        $port->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => "$name deleted"]);

        return redirect()->route('catalogs.index')->with('catalog_tab', 'Ports');
    }

    public function togglePort(Request $request, Port $port): RedirectResponse
    {
        abort_unless($request->user()->canDo('settings', 'edit'), 403, "You don't have permission to do that");

        $port->update(['active' => ! $port->active]);

        return redirect()->route('catalogs.index')->with('catalog_tab', 'Ports');
    }
}
