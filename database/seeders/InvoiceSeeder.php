<?php

namespace Database\Seeders;

use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Database\Seeder;

class InvoiceSeeder extends Seeder
{
    public function run(): void
    {
        $invoices = [
            [
                'invoice_number' => 'INV-0001',
                'client_name'    => 'Imagine SRL',
                'months'         => [4, 5],
                'year'           => 2026,
                'tax_rate'       => 18,
                'payment_terms'  => 'net30',
                'issued_at'      => '2026-06-01',
                'due_date'       => '2026-07-01',
                'status'         => 'paid',
                'paid_at'        => '2026-06-20',
            ],
            [
                'invoice_number' => 'INV-0002',
                'client_name'    => 'Grupo Ramos',
                'months'         => [4, 5],
                'year'           => 2026,
                'tax_rate'       => 18,
                'payment_terms'  => 'net30',
                'issued_at'      => '2026-06-05',
                'due_date'       => '2026-07-05',
                'status'         => 'paid',
                'paid_at'        => '2026-07-10',
            ],
            [
                'invoice_number' => 'INV-0003',
                'client_name'    => 'Tabacalera del Norte',
                'months'         => [4, 5, 6],
                'year'           => 2026,
                'tax_rate'       => 18,
                'payment_terms'  => 'net30',
                'issued_at'      => '2026-07-01',
                'due_date'       => '2026-07-31',
                'status'         => 'overdue',
                'paid_at'        => null,
            ],
            [
                'invoice_number' => 'INV-0004',
                'client_name'    => 'América Internacional',
                'months'         => [6, 7],
                'year'           => 2026,
                'tax_rate'       => 18,
                'payment_terms'  => 'net30',
                'issued_at'      => '2026-08-01',
                'due_date'       => '2026-08-31',
                'status'         => 'sent',
                'paid_at'        => null,
            ],
            [
                'invoice_number' => 'INV-0005',
                'client_name'    => 'Industria Blanca SRL',
                'months'         => [5, 6, 7],
                'year'           => 2026,
                'tax_rate'       => 18,
                'payment_terms'  => 'net30',
                'issued_at'      => '2026-09-02',
                'due_date'       => '2026-10-02',
                'status'         => 'sent',
                'paid_at'        => null,
            ],
            [
                'invoice_number' => 'INV-0006',
                'client_name'    => 'Distribuidora Corripio',
                'months'         => [5, 6, 7],
                'year'           => 2026,
                'tax_rate'       => 18,
                'payment_terms'  => 'net30',
                'issued_at'      => '2026-09-08',
                'due_date'       => '2026-10-08',
                'status'         => 'draft',
                'paid_at'        => null,
            ],
        ];

        foreach ($invoices as $data) {
            // Find ready orders for this client in the specified months
            $months = $data['months'];
            $year   = $data['year'];
            $orders = Order::with('trip')
                ->where('client', $data['client_name'])
                ->where('status', 'ready')
                ->whereRaw('YEAR(date) = ?', [$year])
                ->whereRaw('MONTH(date) IN (' . implode(',', array_fill(0, count($months), '?')) . ')', $months)
                ->get();

            if ($orders->isEmpty()) {
                continue;
            }

            $subtotal  = (float) $orders->sum(fn($o) => $o->trip?->rate ?? 0);
            $taxAmount = round($subtotal * ($data['tax_rate'] / 100), 2);
            $total     = $subtotal + $taxAmount;

            $invoice = Invoice::create([
                'invoice_number' => $data['invoice_number'],
                'client_id'      => $orders->first()->client_id,
                'client'         => $data['client_name'],
                'subtotal'       => $subtotal,
                'tax_rate'       => $data['tax_rate'],
                'tax_amount'     => $taxAmount,
                'total'          => $total,
                'status'         => $data['status'],
                'payment_terms'  => $data['payment_terms'],
                'issued_at'      => $data['issued_at'],
                'due_date'       => $data['due_date'],
                'paid_at'        => $data['paid_at'],
            ]);

            $orders->each(fn($o) => $o->update([
                'status'      => 'invoiced',
                'invoice_id'  => $invoice->id,
                'invoiced_at' => $data['issued_at'],
            ]));
        }
    }
}
