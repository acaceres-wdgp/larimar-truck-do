<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(): Response
    {
        $today = now()->toDateString();

        $pendingInvoice = Order::where('status', 'ready')->count();
        $overdueOpen = Order::where('status', 'open')->whereDate('date', '<', $today)->count();
        $dueToday = Order::where('status', 'open')->whereDate('date', $today)->count();

        $orders = Order::with(['trip.truck', 'trip.driver'])
            ->orderByDesc('date')
            ->get()
            ->map(fn (Order $o) => [
                'id' => $o->id,
                'order_number' => $o->trip?->order_number ?? "ORD-{$o->id}",
                'client' => $o->client,
                'client_id' => $o->client_id,
                'date' => $o->date?->format('Y-m-d'),
                'from' => $o->trip?->from_location,
                'to' => $o->trip?->to_location,
                'truck' => $o->trip?->truck?->plate,
                'driver' => $o->trip?->driver
                    ? "{$o->trip->driver->first_name} {$o->trip->driver->last_name}"
                    : null,
                'trip_status' => $o->trip?->status,
                'status' => $o->status,
                'rate' => (float) ($o->trip?->rate ?? 0),
                'trip_id' => $o->trip_id,
            ]);

        return Inertia::render('orders', [
            'pendingInvoice' => $pendingInvoice,
            'overdueOpen' => $overdueOpen,
            'dueToday' => $dueToday,
            'orders' => $orders,
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['trip.truck', 'trip.driver', 'trip.shippingLine', 'clientModel']);
        $t = $order->trip;

        return Inertia::render('orders/show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $t?->order_number ?? "ORD-{$order->id}",
                'client' => $order->client,
                'date' => $order->date?->format('Y-m-d'),
                'status' => $order->status,
                'completed_at' => $order->completed_at?->format('Y-m-d H:i'),
                'invoiced_at' => $order->invoiced_at?->format('Y-m-d H:i'),
                'trip' => $t ? [
                    'id' => $t->id,
                    'type' => $t->type,
                    'from' => $t->from_location,
                    'to' => $t->to_location,
                    'status' => $t->status,
                    'truck' => $t->truck?->plate,
                    'driver' => $t->driver ? "{$t->driver->first_name} {$t->driver->last_name}" : null,
                    'line' => $t->line,
                    'container_number' => $t->container_number,
                    'container_size' => $t->container_size,
                    'cargo_type' => $t->cargo_type,
                    'weight_tons' => $t->weight_tons,
                    'km' => $t->km,
                    'rate' => (float) ($t->rate ?? 0),
                    'fuel_cost' => (float) ($t->fuel_cost ?? 0),
                    'toll_cost' => (float) ($t->toll_cost ?? 0),
                    'driver_pay' => (float) ($t->driver_pay ?? 0),
                    'margin' => (float) $t->margin,
                ] : null,
            ],
        ]);
    }

    public function complete(Request $request, Order $order): RedirectResponse
    {
        abort_unless($request->user()->canDo('trips', 'edit'), 403);

        $order->update(['status' => 'ready', 'completed_at' => now()]);
        $order->trip?->update(['status' => 'Completed']);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Order {$order->trip?->order_number} marked as ready to invoice"]);

        return redirect()->route('orders.show', $order);
    }
}
