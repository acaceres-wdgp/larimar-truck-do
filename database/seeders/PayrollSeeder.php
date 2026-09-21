<?php

namespace Database\Seeders;

use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\Trip;
use Illuminate\Database\Seeder;

class PayrollSeeder extends Seeder
{
    public function run(): void
    {
        // First, update all completed trips with null driver_pay if driver has pay_rate set
        Trip::with('driver')
            ->where('status', 'Completed')
            ->whereNull('driver_pay')
            ->whereNotNull('driver_id')
            ->get()
            ->each(function (Trip $trip) {
                if ($trip->driver && $trip->driver->pay_rate) {
                    $pay = $trip->driver->pay_type === 'percentage'
                        ? round(($trip->rate ?? 0) * ($trip->driver->pay_rate / 100), 2)
                        : $trip->driver->pay_rate;
                    $trip->update(['driver_pay' => $pay]);
                }
            });

        // Run 1 — April 2026 — paid
        $this->createRun('2026-04-01', '2026-04-30', 'paid', '2026-05-02', '2026-05-05');

        // Run 2 — May 2026 — paid
        $this->createRun('2026-05-01', '2026-05-31', 'paid', '2026-06-01', '2026-06-03');

        // Run 3 — June 2026 — approved
        $this->createRun('2026-06-01', '2026-06-30', 'approved', '2026-07-02', null);
    }

    private function createRun(string $start, string $end, string $status, ?string $approvedAt, ?string $paidAt): void
    {
        $trips = Trip::with('driver')
            ->where('status', 'Completed')
            ->whereNull('payroll_item_id')
            ->whereBetween('date', [$start, $end])
            ->whereNotNull('driver_id')
            ->where('driver_pay', '>', 0)
            ->get();

        if ($trips->isEmpty()) {
            return;
        }

        $byDriver    = $trips->groupBy('driver_id');
        $totalAmount = (float) $trips->sum('driver_pay');

        $run = PayrollRun::create([
            'period_start' => $start,
            'period_end'   => $end,
            'status'       => $status,
            'total_amount' => $totalAmount,
            'approved_at'  => $approvedAt,
            'paid_at'      => $paidAt,
        ]);

        foreach ($byDriver as $driverId => $driverTrips) {
            $driver     = $driverTrips->first()->driver;
            $grossPay   = (float) $driverTrips->sum('driver_pay');
            $itemStatus = $status === 'paid' ? 'paid' : 'pending';

            $item = PayrollItem::create([
                'payroll_run_id' => $run->id,
                'driver_id'      => $driverId,
                'driver_name'    => $driver ? "{$driver->first_name} {$driver->last_name}" : "Driver #{$driverId}",
                'trips_count'    => $driverTrips->count(),
                'gross_pay'      => $grossPay,
                'deductions'     => 0,
                'net_pay'        => $grossPay,
                'status'         => $itemStatus,
                'paid_at'        => $status === 'paid' ? $paidAt : null,
            ]);

            $driverTrips->each(fn($t) => $t->update(['payroll_item_id' => $item->id]));
        }
    }
}
