<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    public function index(Request $request): Response
    {
        $type = $request->get('type', 'revenue');
        $from = $request->get('from', now()->startOfYear()->toDateString());
        $to   = $request->get('to', now()->toDateString());

        $rows   = match ($type) {
            'clients' => $this->clientsReport($from, $to),
            'drivers' => $this->driversReport($from, $to),
            default   => $this->revenueReport($from, $to),
        };

        $totals = $this->totals($from, $to);

        return Inertia::render('reports', [
            'type'   => $type,
            'from'   => $from,
            'to'     => $to,
            'rows'   => $rows,
            'totals' => $totals,
        ]);
    }

    // ── Revenue by month ─────────────────────────────────────────────────────

    private function revenueReport(string $from, string $to): array
    {
        return Trip::whereBetween('date', [$from, $to])
            ->selectRaw("
                DATE_FORMAT(date, '%Y-%m') as period,
                COUNT(*) as trips,
                SUM(COALESCE(rate, 0)) as revenue,
                SUM(COALESCE(fuel_cost, 0) + COALESCE(toll_cost, 0) + COALESCE(driver_pay, 0)) as costs
            ")
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(fn ($r) => [
                'label'   => Carbon::createFromFormat('Y-m', $r->period)->format('M Y'),
                'trips'   => (int) $r->trips,
                'revenue' => (float) $r->revenue,
                'costs'   => (float) $r->costs,
                'margin'  => (float) $r->revenue - (float) $r->costs,
            ])
            ->toArray();
    }

    // ── Revenue by client ────────────────────────────────────────────────────

    private function clientsReport(string $from, string $to): array
    {
        return Trip::whereBetween('date', [$from, $to])
            ->selectRaw("
                COALESCE(NULLIF(client, ''), '(Sin cliente)') as label,
                COUNT(*) as trips,
                SUM(COALESCE(rate, 0)) as revenue,
                AVG(COALESCE(rate, 0)) as avg_rate
            ")
            ->groupBy('label')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($r) => [
                'label'    => $r->label,
                'trips'    => (int) $r->trips,
                'revenue'  => (float) $r->revenue,
                'avg_rate' => (float) $r->avg_rate,
            ])
            ->toArray();
    }

    // ── Activity by driver ───────────────────────────────────────────────────

    private function driversReport(string $from, string $to): array
    {
        return Trip::with('driver')
            ->whereBetween('date', [$from, $to])
            ->whereNotNull('driver_id')
            ->selectRaw("
                driver_id,
                COUNT(*) as trips,
                SUM(COALESCE(rate, 0)) as revenue,
                SUM(COALESCE(driver_pay, 0)) as total_pay,
                AVG(COALESCE(driver_pay, 0)) as avg_pay
            ")
            ->groupBy('driver_id')
            ->orderByDesc('trips')
            ->get()
            ->map(fn ($r) => [
                'label'     => $r->driver
                    ? "{$r->driver->first_name} {$r->driver->last_name}"
                    : "Driver #{$r->driver_id}",
                'trips'     => (int) $r->trips,
                'revenue'   => (float) $r->revenue,
                'total_pay' => (float) $r->total_pay,
                'avg_pay'   => (float) $r->avg_pay,
            ])
            ->toArray();
    }

    // ── Period totals (for KPI summary row) ─────────────────────────────────

    private function totals(string $from, string $to): array
    {
        $agg = Trip::whereBetween('date', [$from, $to])
            ->selectRaw("
                COUNT(*) as trips,
                SUM(COALESCE(rate, 0)) as revenue,
                SUM(COALESCE(fuel_cost, 0) + COALESCE(toll_cost, 0) + COALESCE(driver_pay, 0)) as costs
            ")
            ->first();

        return [
            'trips'   => (int) ($agg->trips ?? 0),
            'revenue' => (float) ($agg->revenue ?? 0),
            'costs'   => (float) ($agg->costs ?? 0),
            'margin'  => (float) ($agg->revenue ?? 0) - (float) ($agg->costs ?? 0),
        ];
    }
}
