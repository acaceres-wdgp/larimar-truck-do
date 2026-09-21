<?php
namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(): Response
    {
        $today = now()->toDateString();

        // Auto-mark overdue
        Invoice::where('status', 'sent')->where('due_date', '<', $today)->update(['status' => 'overdue']);

        $overdueCount   = Invoice::where('status', 'overdue')->count();
        $readyOrders    = Order::where('status', 'ready')->count();
        $invoicesThisMonth = Invoice::whereMonth('issued_at', now()->month)
            ->whereYear('issued_at', now()->year)
            ->count();

        $invoices = Invoice::withCount('orders')
            ->orderByDesc('issued_at')
            ->get()
            ->map(fn(Invoice $inv) => [
                'id'             => $inv->id,
                'invoice_number' => $inv->invoice_number,
                'client'         => $inv->client,
                'client_id'      => $inv->client_id,
                'issued_at'      => $inv->issued_at?->format('Y-m-d'),
                'due_date'       => $inv->due_date?->format('Y-m-d'),
                'paid_at'        => $inv->paid_at?->format('Y-m-d'),
                'payment_terms'  => $inv->payment_terms,
                'subtotal'       => (float) $inv->subtotal,
                'tax_amount'     => (float) $inv->tax_amount,
                'total'          => (float) $inv->total,
                'status'         => $inv->status,
                'orders_count'   => $inv->orders_count,
            ]);

        return Inertia::render('invoices', [
            'overdueCount'      => $overdueCount,
            'readyOrders'       => $readyOrders,
            'invoicesThisMonth' => $invoicesThisMonth,
            'invoices'          => $invoices,
        ]);
    }

    public function create(): Response
    {
        $readyOrders = Order::with('trip')
            ->where('status', 'ready')
            ->whereNotNull('client_id')
            ->orderByDesc('date')
            ->get()
            ->map(fn(Order $o) => [
                'id'           => $o->id,
                'order_number' => $o->trip?->order_number ?? "ORD-{$o->id}",
                'client_id'    => $o->client_id,
                'client'       => $o->client,
                'date'         => $o->date?->format('Y-m-d'),
                'from'         => $o->trip?->from_location,
                'to'           => $o->trip?->to_location,
                'rate'         => (float) ($o->trip?->rate ?? 0),
                'type'         => $o->trip?->type,
                'line'         => $o->trip?->line,
            ]);

        $clients = $readyOrders
            ->unique('client_id')
            ->filter(fn($o) => $o['client_id'] !== null)
            ->map(fn($o) => ['id' => $o['client_id'], 'name' => $o['client']])
            ->values();

        return Inertia::render('invoices/create', [
            'readyOrders' => $readyOrders,
            'clients'     => $clients,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->canDo('trips', 'edit'), 403);

        $validated = $request->validate([
            'client_id'     => ['required', 'exists:clients,id'],
            'order_ids'     => ['required', 'array', 'min:1'],
            'order_ids.*'   => ['integer', 'exists:orders,id'],
            'tax_rate'      => ['required', 'numeric', 'min:0', 'max:100'],
            'payment_terms' => ['required', 'in:net15,net30,net60,net90'],
            'notes'         => ['nullable', 'string', 'max:1000'],
        ]);

        $orders = Order::with('trip')
            ->whereIn('id', $validated['order_ids'])
            ->where('client_id', $validated['client_id'])
            ->where('status', 'ready')
            ->get();

        if ($orders->count() !== count($validated['order_ids'])) {
            return back()->withErrors(['order_ids' => 'One or more selected orders are invalid.']);
        }

        $subtotal  = (float) $orders->sum(fn($o) => $o->trip?->rate ?? 0);
        $taxRate   = (float) $validated['tax_rate'];
        $taxAmount = round($subtotal * ($taxRate / 100), 2);
        $total     = $subtotal + $taxAmount;
        $termsDays = Invoice::TERMS_DAYS[$validated['payment_terms']];
        $issuedAt  = now();
        $dueDate   = $issuedAt->clone()->addDays($termsDays);

        $invoiceNumber = 'INV-' . str_pad(Invoice::count() + 1, 4, '0', STR_PAD_LEFT);
        $client = Client::find($validated['client_id']);

        $invoice = Invoice::create([
            'invoice_number' => $invoiceNumber,
            'client_id'      => $validated['client_id'],
            'client'         => $client?->name ?? '',
            'subtotal'       => $subtotal,
            'tax_rate'       => $taxRate,
            'tax_amount'     => $taxAmount,
            'total'          => $total,
            'status'         => 'draft',
            'payment_terms'  => $validated['payment_terms'],
            'issued_at'      => $issuedAt,
            'due_date'       => $dueDate,
            'notes'          => $validated['notes'],
        ]);

        $orders->each(fn($o) => $o->update([
            'status'      => 'invoiced',
            'invoice_id'  => $invoice->id,
            'invoiced_at' => now(),
        ]));

        Inertia::flash('toast', ['type' => 'success', 'message' => "Invoice {$invoiceNumber} created successfully"]);

        return redirect()->route('invoices.show', $invoice);
    }

    public function show(Invoice $invoice): Response
    {
        $invoice->load(['orders.trip.truck', 'orders.trip.driver', 'clientModel']);

        return Inertia::render('invoices/show', [
            'invoice' => [
                'id'             => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'client'         => $invoice->client,
                'client_id'      => $invoice->client_id,
                'issued_at'      => $invoice->issued_at?->format('Y-m-d'),
                'due_date'       => $invoice->due_date?->format('Y-m-d'),
                'paid_at'        => $invoice->paid_at?->format('Y-m-d'),
                'payment_terms'  => $invoice->payment_terms,
                'subtotal'       => (float) $invoice->subtotal,
                'tax_rate'       => (float) $invoice->tax_rate,
                'tax_amount'     => (float) $invoice->tax_amount,
                'total'          => (float) $invoice->total,
                'status'         => $invoice->status,
                'notes'          => $invoice->notes,
                'orders'         => $invoice->orders->map(fn(Order $o) => [
                    'id'           => $o->id,
                    'order_number' => $o->trip?->order_number ?? "ORD-{$o->id}",
                    'date'         => $o->date?->format('Y-m-d'),
                    'type'         => $o->trip?->type,
                    'from'         => $o->trip?->from_location,
                    'to'           => $o->trip?->to_location,
                    'truck'        => $o->trip?->truck?->plate,
                    'driver'       => $o->trip?->driver
                        ? "{$o->trip->driver->first_name} {$o->trip->driver->last_name}"
                        : null,
                    'line'         => $o->trip?->line,
                    'rate'         => (float) ($o->trip?->rate ?? 0),
                ])->values(),
            ],
        ]);
    }

    public function markSent(Request $request, Invoice $invoice): RedirectResponse
    {
        abort_unless($request->user()->canDo('trips', 'edit'), 403);
        abort_if(in_array($invoice->status, ['paid', 'cancelled']), 422);
        $invoice->update(['status' => 'sent']);
        Inertia::flash('toast', ['type' => 'success', 'message' => "Invoice {$invoice->invoice_number} marked as sent"]);
        return redirect()->route('invoices.show', $invoice);
    }

    public function markPaid(Request $request, Invoice $invoice): RedirectResponse
    {
        abort_unless($request->user()->canDo('trips', 'edit'), 403);
        abort_if($invoice->status === 'cancelled', 422);
        $invoice->update(['status' => 'paid', 'paid_at' => now()]);
        Inertia::flash('toast', ['type' => 'success', 'message' => "Invoice {$invoice->invoice_number} marked as paid"]);
        return redirect()->route('invoices.show', $invoice);
    }

    public function pdf(Invoice $invoice): HttpResponse
    {
        $invoice->load(['orders.trip.truck', 'orders.trip.driver', 'clientModel']);
        $pdf = Pdf::loadView('invoices.pdf', ['invoice' => $invoice])->setPaper('letter', 'portrait');
        return $pdf->download("{$invoice->invoice_number}.pdf");
    }
}
