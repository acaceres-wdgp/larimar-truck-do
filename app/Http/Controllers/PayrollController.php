<?php
namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\Trip;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class PayrollController extends Controller
{
    public function index(): Response
    {
        // KPI: total pending driver pay (completed trips not in any payroll)
        $totalPending = (float) Trip::where('status', 'Completed')
            ->whereNull('payroll_item_id')
            ->whereNotNull('driver_id')
            ->where('driver_pay', '>', 0)
            ->sum('driver_pay');

        $driversPending = Trip::where('status', 'Completed')
            ->whereNull('payroll_item_id')
            ->whereNotNull('driver_id')
            ->where('driver_pay', '>', 0)
            ->distinct('driver_id')
            ->count('driver_id');

        $lastRun = PayrollRun::latest('period_end')->first();

        $runs = PayrollRun::withCount('items')
            ->orderByDesc('period_end')
            ->get()
            ->map(fn(PayrollRun $r) => [
                'id'           => $r->id,
                'period_start' => $r->period_start?->format('Y-m-d'),
                'period_end'   => $r->period_end?->format('Y-m-d'),
                'status'       => $r->status,
                'total_amount' => (float) $r->total_amount,
                'items_count'  => $r->items_count,
                'approved_at'  => $r->approved_at?->format('Y-m-d'),
                'paid_at'      => $r->paid_at?->format('Y-m-d'),
            ]);

        return Inertia::render('payroll', [
            'totalPending'   => $totalPending,
            'driversPending' => $driversPending,
            'lastRunDate'    => $lastRun?->period_end?->format('Y-m-d'),
            'runs'           => $runs,
        ]);
    }

    public function create(): Response
    {
        $eligibleTrips = Trip::with('driver')
            ->where('status', 'Completed')
            ->whereNull('payroll_item_id')
            ->whereNotNull('driver_id')
            ->where('driver_pay', '>', 0)
            ->orderBy('date')
            ->get()
            ->map(fn(Trip $t) => [
                'id'          => $t->id,
                'date'        => $t->date->format('Y-m-d'),
                'client'      => $t->client,
                'from'        => $t->from_location,
                'to'          => $t->to_location,
                'driver_id'   => $t->driver_id,
                'driver_name' => $t->driver ? "{$t->driver->first_name} {$t->driver->last_name}" : 'Unknown',
                'driver_pay'  => (float) ($t->driver_pay ?? 0),
                'rate'        => (float) ($t->rate ?? 0),
                'km'          => (float) ($t->km ?? 0),
            ]);

        return Inertia::render('payroll/create', [
            'eligibleTrips' => $eligibleTrips,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->canDo('trips', 'edit'), 403);

        $validated = $request->validate([
            'period_start' => ['required', 'date'],
            'period_end'   => ['required', 'date', 'after_or_equal:period_start'],
            'trip_ids'     => ['required', 'array', 'min:1'],
            'trip_ids.*'   => ['integer', 'exists:trips,id'],
            'notes'        => ['nullable', 'string', 'max:500'],
        ]);

        $trips = Trip::with('driver')
            ->whereIn('id', $validated['trip_ids'])
            ->where('status', 'Completed')
            ->whereNull('payroll_item_id')
            ->where('driver_pay', '>', 0)
            ->get();

        if ($trips->isEmpty()) {
            return back()->withErrors(['trip_ids' => 'No valid trips found.']);
        }

        $byDriver    = $trips->groupBy('driver_id');
        $totalAmount = (float) $trips->sum('driver_pay');

        $run = PayrollRun::create([
            'period_start' => $validated['period_start'],
            'period_end'   => $validated['period_end'],
            'status'       => 'draft',
            'total_amount' => $totalAmount,
            'notes'        => $validated['notes'] ?? null,
        ]);

        foreach ($byDriver as $driverId => $driverTrips) {
            $driver   = $driverTrips->first()->driver;
            $grossPay = (float) $driverTrips->sum('driver_pay');

            $item = PayrollItem::create([
                'payroll_run_id' => $run->id,
                'driver_id'      => $driverId,
                'driver_name'    => $driver ? "{$driver->first_name} {$driver->last_name}" : "Driver #{$driverId}",
                'trips_count'    => $driverTrips->count(),
                'gross_pay'      => $grossPay,
                'deductions'     => 0,
                'net_pay'        => $grossPay,
                'status'         => 'pending',
            ]);

            $driverTrips->each(fn($t) => $t->update(['payroll_item_id' => $item->id]));
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => "Payroll run created — {$trips->count()} trips, RD\${$totalAmount}"]);

        return redirect()->route('payroll.show', $run);
    }

    public function show(PayrollRun $run): Response
    {
        $run->load(['items.driver', 'items.trips']);

        return Inertia::render('payroll/show', [
            'run' => [
                'id'           => $run->id,
                'period_start' => $run->period_start?->format('Y-m-d'),
                'period_end'   => $run->period_end?->format('Y-m-d'),
                'status'       => $run->status,
                'total_amount' => (float) $run->total_amount,
                'approved_at'  => $run->approved_at?->format('Y-m-d'),
                'paid_at'      => $run->paid_at?->format('Y-m-d'),
                'notes'        => $run->notes,
                'items'        => $run->items->map(fn(PayrollItem $item) => [
                    'id'          => $item->id,
                    'driver_id'   => $item->driver_id,
                    'driver_name' => $item->driver_name,
                    'trips_count' => $item->trips_count,
                    'gross_pay'   => (float) $item->gross_pay,
                    'deductions'  => (float) $item->deductions,
                    'net_pay'     => (float) $item->net_pay,
                    'status'      => $item->status,
                    'paid_at'     => $item->paid_at?->format('Y-m-d'),
                    'trips'       => $item->trips->map(fn(Trip $t) => [
                        'id'         => $t->id,
                        'date'       => $t->date?->format('Y-m-d'),
                        'client'     => $t->client,
                        'from'       => $t->from_location,
                        'to'         => $t->to_location,
                        'driver_pay' => (float) ($t->driver_pay ?? 0),
                        'rate'       => (float) ($t->rate ?? 0),
                        'km'         => (float) ($t->km ?? 0),
                    ])->values(),
                ])->values(),
            ],
        ]);
    }

    public function approve(Request $request, PayrollRun $run): RedirectResponse
    {
        abort_unless($request->user()->canDo('trips', 'edit'), 403);
        if ($run->status !== 'draft') {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'This run is already ' . $run->status . '.']);
            return redirect()->route('payroll.show', $run);
        }
        $run->update(['status' => 'approved', 'approved_at' => now()]);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Payroll run approved']);
        return redirect()->route('payroll.show', $run);
    }

    public function markPaid(Request $request, PayrollRun $run): RedirectResponse
    {
        abort_unless($request->user()->canDo('trips', 'edit'), 403);
        if ($run->status === 'paid') {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'This run is already paid.']);
            return redirect()->route('payroll.show', $run);
        }
        if ($run->status === 'draft') {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Approve the run before marking as paid.']);
            return redirect()->route('payroll.show', $run);
        }
        $now = now();
        $run->items()->where('status', 'pending')->update(['status' => 'paid', 'paid_at' => $now]);
        $run->update(['status' => 'paid', 'paid_at' => $now]);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Payroll marked as paid']);
        return redirect()->route('payroll.show', $run);
    }

    public function updateDeduction(Request $request, PayrollItem $item): JsonResponse
    {
        $validated = $request->validate([
            'deductions' => ['required', 'numeric', 'min:0'],
        ]);
        $deductions = (float) $validated['deductions'];
        $netPay     = max(0, (float) $item->gross_pay - $deductions);
        $item->update(['deductions' => $deductions, 'net_pay' => $netPay]);

        // Recalculate run total
        $run = $item->run;
        $run->update(['total_amount' => $run->items()->sum('net_pay')]);

        return response()->json(['ok' => true, 'net_pay' => $netPay, 'run_total' => (float) $run->fresh()->total_amount]);
    }

    public function pdf(PayrollRun $run): HttpResponse
    {
        $run->load(['items.driver', 'items.trips']);
        $pdf = Pdf::loadView('payroll.pdf', ['run' => $run])->setPaper('letter', 'portrait');
        $period = $run->period_start?->format('M-Y');
        return $pdf->download("payroll-{$period}.pdf");
    }
}
